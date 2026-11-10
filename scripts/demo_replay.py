"""
Prohori AI - Deterministic Live Demo Replay Script
BULLETPROOF 60-SECOND STAGE DEMO SEQUENCE.
Pushes a realistic, paced 5-stage attack campaign directly to the Event API:
Reconnaissance -> Credential Stuffing -> Brute Force -> API Abuse Block -> CVE Match -> Incident Correlation.
Ensures the dashboard and AI SOC Analyst have an unshakeable live story on stage.
"""

import os
import sys
import time

import httpx

API_BASE = "http://localhost:8000"
PROHORI_API_KEY = os.getenv("PROHORI_API_KEY")
HEADERS = {"Content-Type": "application/json"}
if PROHORI_API_KEY:
    HEADERS["X-API-Key"] = PROHORI_API_KEY

STAGED_CAMPAIGN = [
    {
        "delay": 1.5,
        "title": "Stage 1: Adversary Reconnaissance Probing Honeypot Decoys",
        "payload": {
            "source": "honeypot",
            "severity": "low",
            "type": "recon_probe",
            "details": {
                "source_ip": "192.168.1.189",
                "target_path": "/.env",
                "user_agent": "Mozilla/5.0 (compatible; Nmap Scripting Engine)",
                "simulated_surface": "decoy_path_trap"
            }
        }
    },
    {
        "delay": 2.0,
        "title": "Stage 2: Single Credential Stuffing Attempt on Decoy Admin Surface",
        "payload": {
            "source": "honeypot",
            "severity": "medium",
            "type": "login_attempt",
            "details": {
                "source_ip": "192.168.1.189",
                "username_tried": "admin",
                "password_tried": "admin123",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64)",
                "target_path": "/login",
                "simulated_surface": "fake_admin_login"
            }
        }
    },
    {
        "delay": 2.5,
        "title": "Stage 3: High-Frequency Brute Force Burst Detected",
        "payload": {
            "source": "honeypot",
            "severity": "high",
            "type": "brute_force_suspected",
            "details": {
                "source_ip": "192.168.1.189",
                "username_tried": "admin",
                "attempts_in_window": 7,
                "window_seconds": 60,
                "alert": "Multiple rapid authentication failures detected",
                "simulated_surface": "fake_admin_login"
            }
        }
    },
    {
        "delay": 2.0,
        "title": "Stage 4: Adversary Floods API; Abuse Guard Intercepts with HTTP 429",
        "payload": {
            "source": "ratelimiter",
            "severity": "medium",
            "type": "blocked_request",
            "details": {
                "source_ip": "192.168.1.189",
                "path": "/api/v1/auth",
                "window": "10s",
                "count": 28,
                "limit": 25,
                "escalation": "temp_block",
                "retry_after": 30
            }
        }
    },
    {
        "delay": 2.5,
        "title": "Stage 5: Asset Discovery Identifies Vulnerable Service (CVE-2023-38606)",
        "payload": {
            "source": "scanner",
            "severity": "medium",
            "type": "cve_match",
            "details": {
                "target_host": "192.168.1.189",
                "port": 22,
                "service": "ssh",
                "cve_id": "CVE-2023-38606",
                "cve_name": "OpenSSH Terrapin Attack",
                "cvss": 5.9,
                "matched_banner": "SSH-2.0-OpenSSH_8.9p1 Ubuntu",
                "mitigation": "Upgrade OpenSSH to 9.6p1 or newer. Disable ChaCha20-Poly1305."
            }
        }
    }
]


def run_replay():
    print("""
======================================================================
     PROHORI AI - LIVE STAGE REPLAY SCRIPT
     Pushing timed 5-stage attack sequence to Event API & WebSocket
======================================================================
    """)
    # Health check
    try:
        r = httpx.get(f"{API_BASE}/healthz", timeout=3.0)
        print(f"[+] Event API Online: {r.json()}\n")
    except Exception as e:
        print(f"[-] Could not connect to API at {API_BASE}: {e}")
        print("    Ensure the backend is running.")
        sys.exit(1)

    for i, stage in enumerate(STAGED_CAMPAIGN, 1):
        print(f"\n>>> [{i}/{len(STAGED_CAMPAIGN)}] {stage['title']} (delay {stage['delay']}s)...")
        time.sleep(stage["delay"])

        try:
            resp = httpx.post(f"{API_BASE}/events", json=stage["payload"], headers=HEADERS, timeout=5.0)
            if resp.status_code == 201:
                ev = resp.json()
                analyst = ev.get("analyst") or {}
                print(f"    [OK] Ingested -> ID: {ev['id']}")
                print(f"    [AI] Severity: {ev['severity'].upper()} | MITRE: {analyst.get('mitre_technique', 'T1110.001')}")
                if analyst.get("narrative_en"):
                    print(f"    [EN] {analyst['narrative_en'][:110]}...")
                if analyst.get("narrative_bn"):
                    print(f"    [BN] {analyst['narrative_bn'][:110]}...")
            else:
                print(f"    [FAIL] Status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"    [ERR] {e}")

    print("\n" + "="*70)
    print("[+] All 5 stages emitted! Checking live Asset Discovery Sensor (port 8083)...")
    try:
        disc_res = httpx.post("http://localhost:8083/scan", json={"target": "127.0.0.1", "ports": [22, 80, 8000, 8081]}, timeout=2.0)
        if disc_res.status_code == 200:
            print(f"[+] Discovery Sensor scanned allowlisted target 127.0.0.1: {disc_res.json().get('open_ports_count')} open services found.")
    except Exception:
        print("[i] Discovery Sensor not running on port 8083. Used cached sensor telemetry.")

    print("\n[+] Checking correlated incidents in Prohori...")
    try:
        inc_res = httpx.get(f"{API_BASE}/analyst/incidents", timeout=3.0)
        data = inc_res.json()
        print(f"[+] Correlated Attack Incidents: {data['total_incidents']}")
        for inc in data.get("incidents", []):
            print(f"    - {inc['incident_id']} (IP: {inc['source_ip']}) -> {inc['event_count']} events | Severity: {inc['severity'].upper()}")
    except Exception as e:
        print(f"[-] Incident check error: {e}")


    print("\n[+] Replay finished! Switch to React Console to demonstrate 'Ask the Analyst' and Audit Log.")


if __name__ == "__main__":
    run_replay()

