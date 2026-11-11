"""
Empirical evaluation of cheap latency improvements on Ollama llama3.2 (CPU).
Tests:
1. Baseline (num_predict=1000, default thread/keep_alive)
2. keep_alive="60m"
3. keep_alive="60m" + num_thread=8 (matches 8 physical cores)
4. keep_alive="60m" + num_thread=8 + concise prompt (num_predict=500)
"""
import asyncio
import json
import time

import httpx

TEST_EVENT = {
    "source": "honeypot",
    "severity": "high",
    "type": "login_attempt_burst",
    "details": {
        "source_ip": "192.168.1.189",
        "attempts": 45,
        "target": "SSH service",
        "user_agent": "paramiko"
    }
}

PROMPT_STANDARD = f"""
ANALYZE THE FOLLOWING DEFENSIVE SECURITY EVENT:
- Source: {TEST_EVENT['source']}
- Reported Sensor Severity: {TEST_EVENT['severity']}
- Event Type: {TEST_EVENT['type']}
- Scrubbed Telemetry Details: {json.dumps(TEST_EVENT['details'])}

GROUNDED KNOWLEDGE BASE CONTEXT (RAG):
- [T1110.001] Brute Force: Password Guessing: Adversaries may systematically guess passwords to gain unauthorized access. Recommended Mitigation: Enforce rate limits and multi-factor authentication.
- [CWE-307] Improper Restriction of Excessive Authentication Attempts: Permitting too many failed logins enables brute-force attacks. Recommended Mitigation: Implement lockout or IP throttling.

Return a single JSON object with these exact keys:
{{
  "severity": "info" | "low" | "medium" | "high" | "critical",
  "confidence": 0.0 to 1.0,
  "narrative_en": "1-2 concise sentences in English explaining what happened and citing the exact MITRE ATT&CK or CVE ID from context.",
  "narrative_bn": "1-2 concise sentences in fluent Bangla explaining the event clearly to Bangladeshi security staff with citations.",
  "citations": ["T1110.001", "CWE-307"],
  "mitre_technique": "Primary MITRE ID",
  "recommended_action": "Clear, defensive next step requiring human operator approval.",
  "requires_human_approval": true
}}
"""

PROMPT_CONCISE = f"""
ANALYZE THE FOLLOWING DEFENSIVE SECURITY EVENT:
- Source: {TEST_EVENT['source']}
- Reported Sensor Severity: {TEST_EVENT['severity']}
- Event Type: {TEST_EVENT['type']}
- Scrubbed Telemetry Details: {json.dumps(TEST_EVENT['details'])}

GROUNDED KNOWLEDGE BASE CONTEXT (RAG):
- [T1110.001] Brute Force: Password Guessing: Adversaries may systematically guess passwords. Mitigation: Enforce rate limits.
- [CWE-307] Improper Restriction of Excessive Authentication Attempts. Mitigation: IP throttling.

Return a single JSON object with these exact keys:
{{
  "severity": "high",
  "confidence": 0.95,
  "narrative_en": "Exactly 1 English sentence citing [T1110.001].",
  "narrative_bn": "ঠিক ১টি বাংলা বাক্য [T1110.001] উল্লেখ সহ।",
  "citations": ["T1110.001", "CWE-307"],
  "mitre_technique": "T1110.001",
  "recommended_action": "1 short mitigation sentence.",
  "requires_human_approval": true
}}
"""

SYSTEM_PROMPT = "You are an enterprise AI SOC analyst. Return ONLY valid JSON matching the requested schema. No conversational preamble."


async def run_variant(name: str, prompt: str, options: dict, keep_alive: str | None = None):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "system": SYSTEM_PROMPT,
        "stream": False,
        "format": "json",
        "options": options
    }
    if keep_alive:
        payload["keep_alive"] = keep_alive

    t0 = time.perf_counter()
    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(url, json=payload)
    elapsed_ms = (time.perf_counter() - t0) * 1000

    if resp.status_code != 200:
        return {"name": name, "status": "ERROR", "elapsed_ms": elapsed_ms, "valid_json": False}

    data = resp.json()
    raw = data.get("response", "")
    valid_json = False
    parsed = None
    try:
        parsed = json.loads(raw)
        valid_json = True
    except Exception:
        valid_json = False

    return {
        "name": name,
        "elapsed_ms": elapsed_ms,
        "valid_json": valid_json,
        "eval_count": data.get("eval_count"),
        "eval_duration_ms": data.get("eval_duration", 0) / 1_000_000,
        "output_chars": len(raw),
        "narrative_en": parsed.get("narrative_en") if parsed else None,
        "narrative_bn": parsed.get("narrative_bn") if parsed else None,
        "citations": parsed.get("citations") if parsed else None
    }


async def main():
    print("--- WARMING MODEL ---")
    await run_variant("Warmup", "Ping", {"num_predict": 10})

    results = []

    print("\n1. Running Baseline (num_predict=1000, default threads/keep_alive)...")
    res1 = await run_variant("Baseline", PROMPT_STANDARD, {"temperature": 0.2, "num_predict": 1000})
    results.append(res1)
    print(f"   -> {res1['elapsed_ms']:.1f} ms | valid_json: {res1['valid_json']} | tokens: {res1['eval_count']}")

    print("\n2. Running Config A: keep_alive='60m'...")
    res2 = await run_variant("Config A (keep_alive=60m)", PROMPT_STANDARD, {"temperature": 0.2, "num_predict": 1000}, keep_alive="60m")
    results.append(res2)
    print(f"   -> {res2['elapsed_ms']:.1f} ms | valid_json: {res2['valid_json']} | tokens: {res2['eval_count']}")

    print("\n3. Running Config B: keep_alive='60m' + num_thread=8...")
    res3 = await run_variant("Config B (num_thread=8)", PROMPT_STANDARD, {"temperature": 0.2, "num_predict": 1000, "num_thread": 8}, keep_alive="60m")
    results.append(res3)
    print(f"   -> {res3['elapsed_ms']:.1f} ms | valid_json: {res3['valid_json']} | tokens: {res3['eval_count']}")

    print("\n4. Running Config C: keep_alive='60m' + num_thread=8 + concise prompt (num_predict=500)...")
    res4 = await run_variant("Config C (concise prompt + num_predict=500)", PROMPT_CONCISE, {"temperature": 0.2, "num_predict": 500, "num_thread": 8}, keep_alive="60m")
    results.append(res4)
    print(f"   -> {res4['elapsed_ms']:.1f} ms | valid_json: {res4['valid_json']} | tokens: {res4['eval_count']}")

    print("\n=== SUMMARY TABLE ===")
    print(f"{'Configuration':<45} | {'Latency (s)':<12} | {'Tokens':<8} | {'Valid JSON':<10}")
    print("-" * 80)
    for r in results:
        print(f"{r['name']:<45} | {r['elapsed_ms']/1000:>10.2f} s | {str(r.get('eval_count')):>8} | {str(r['valid_json']):<10}")


if __name__ == "__main__":
    asyncio.run(main())
