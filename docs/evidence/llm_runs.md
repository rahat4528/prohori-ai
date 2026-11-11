# Prohori AI — Real LLM Inference & Resilience Verification (Ollama Llama 3.2)

**Evaluation Date**: 2026-11-11  
**Hardware Platform**: AMD Ryzen 7 PRO 4750U (8 Cores, 16 Threads @ 1.70 GHz, 32 GB RAM, Integrated Vega Graphics, No Discrete CUDA GPU)  
**Operating System**: Windows 11 Enterprise (PowerShell environment)  
**Local Provider**: Ollama v0.40.16 running local `llama3.2:latest` (2.0 GB 3B parameter quantized weights)  
**Evaluation Scope & Limitations**:
- **Single Test Run**: This benchmark was conducted **once** on **one CPU-only laptop**. Results reflect this specific host hardware.
- **Unreviewed Bangla**: The 3B model's Bengali translations are **unreviewed** by a human native speaker and may contain grammatical, cultural, or technical phrasing inaccuracies.
- **Verification Status**: **VERIFIED WITH REAL EXECUTION EVIDENCE (17/20 SUCCESS, 3/20 DETERMINISTIC FALLBACK)**

---

## 1. Executive Summary & Honest Benchmark Breakdown

- **Real Generative Inference Executed**: **YES**. Fully autonomous JSON-structured incident triage, bilingual narrative generation (English and native Bengali), MITRE ATT&CK / CVE citation grounding, and defensive recommendations were executed on a real local neural LLM (`llama3.2`).
- **Data Sovereignty Compliance**: **100% On-Premises**. Zero bytes left `127.0.0.1:11434`. No cloud API keys or external telemetry hops were used.
- **Model Success vs. Fallback Rate**:
  - **LLM Answer Used Directly**: **17 of 20 alerts (85.0%)**
  - **Fallback to Deterministic Engine**: **3 of 20 alerts (15.0%)**
  - **Reasons for Fallback (All 3 events)**: The model produced verbose bilingual text that exceeded the allocated token budget before completing the JSON structure (`Unterminated string`), resulting in a `JSONDecodeError` which was caught, logged, and gracefully recovered via our deterministic offline RAG engine:
    - Alert 03 (`bench-03`, `rate_limit_violation`): Unterminated string at char 1284. Latency cost: `99,441.42 ms`.
    - Alert 09 (`bench-09-unseen`, `ssrf_metadata_probe`): Unterminated string at char 1150. Latency cost: `110,056.05 ms`.
    - Alert 15 (`bench-15-unseen`, `network_port_scan`): Unterminated string at char 495. Latency cost: `108,528.86 ms`.
- **Citations & Grounding Audit**:
  - Total Citations Produced by Model: **60**
  - Verified in Knowledge Base: **59**
  - Ungrounded / Unindexed Citations Removed: **1 of 60 cited IDs** (On Alert 08, the model generated sub-technique `T1490.001`; our grounding validator caught that `T1490.001` was not indexed in `knowledge/data/curated_kb.py`, removed it before storage, and preserved the verified parent technique `T1490`).

---

## 2. Latency Breakdown Separated into Three Distinct Groups

### Group A: LLM Success Only (16 Steady-State Alerts; Alert 05 excluded due to laptop sleep)
- **Cold Start (Alert 01)**: `77,284.54 ms` (~77.3 s)
- **Median Latency**: **69,910.76 ms** (~69.91 s)
- **Min Latency**: `44,672.53 ms` (~44.67 s)
- **Worst-Case Steady-State**: `78,530.92 ms` (~78.53 s)
- **Distribution**: `[44.67s, 51.57s, 53.76s, 54.08s, 54.91s, 65.48s, 68.72s, 69.09s, 69.91s, 70.55s, 74.42s, 74.61s, 74.87s, 77.36s, 78.53s]`

### Group B: Fallback After Failed LLM Attempt (3 Alerts)
- **Median Latency**: **108,528.86 ms** (~108.53 s)
- **Worst-Case Latency**: **110,056.05 ms** (~110.06 s)
- **Total Time Spent on Fallbacks**: **318,026.33 ms** (~318.03 s / **5.30 minutes**)
- *Impact*: In synchronous ingestion, a failed LLM attempt incurs the full generation time before falling back. In decoupled mode, the user receives the deterministic triage immediately (~35 ms) while background enrichment fails over safely without impacting the operator.

### Group C: Deterministic Engine Only (20 Alerts from `scripts/benchmark_latency.py`)
- **Median Latency**: **32.03 ms**
- **Cold Start (Alert 01)**: **2,111.45 ms** (DB connection initialization & embedding store warm-up)
- **Steady-State Range**: **30.82 ms – 35.61 ms**

---

## 3. 20-Alert Run Log & Outcome Matrix

| Run # | Event ID | Event Type | Latency (s) | Severity | Outcome / Provider | Citations & Grounding | Notes / Fallback Reason |
|:---:|---|---|---:|:---:|---|---|---|
| 01 | `bench-01` | login_attempt_burst | 77.28 s | HIGH | `ollama-local (llama3.2)` | `CVE-2023-38606, T1021.004` (Verified) | Cold start inference |
| 02 | `bench-02` | recon_probe | 77.36 s | LOW | `ollama-local (llama3.2)` | `T1059.004, CWE-307` (Verified) | Steady-state CPU |
| 03 | `bench-03` | rate_limit_violation | 99.44 s | MEDIUM | `deterministic-offline-rag (fallback)` | `T1499.002, CVE-2023-38606` (Verified) | **FALLBACK**: Unterminated JSON at char 1284 |
| 04 | `bench-04` | vulnerability_detected | 70.55 s | HIGH | `ollama-local (llama3.2)` | `CVE-2023-38606, CVE-2021-44228` (Verified) | Steady-state CPU |
| 05 | `bench-05` | multi_stage_attack_campaign | *N/A (sleep)* | CRITICAL | `ollama-local (llama3.2)` | `T1595.001, CWE-307` (Verified) | Wall-clock skewed by laptop sleep mode |
| 06 | `bench-06-unseen` | jndi_injection | 65.48 s | CRITICAL | `ollama-local (llama3.2)` | `CVE-2021-44228, CVE-2022-22965` (Verified) | Steady-state CPU |
| 07 | `bench-07-unseen` | sql_injection | 74.42 s | HIGH | `ollama-local (llama3.2)` | `T1110.001, CWE-89` (Verified) | Steady-state CPU |
| 08 | `bench-08-unseen` | ransomware_indicator | 54.91 s | CRITICAL | `ollama-local (llama3.2)` | `CWE-307, T1490` (1 removed) | **FILTERED**: `T1490.001` removed; `T1490` kept |
| 09 | `bench-09-unseen` | ssrf_metadata_probe | 110.06 s | LOW | `deterministic-offline-rag (fallback)` | `T1595.002, CVE-2023-44487` (Verified) | **FALLBACK**: Unterminated JSON at char 1150 |
| 10 | `bench-10-unseen` | command_injection | 74.87 s | CRITICAL | `ollama-local (llama3.2)` | `T1059.004, CVE-2021-44228` (Verified) | Steady-state CPU |
| 11 | `bench-11-unseen` | c2_beaconing | 68.72 s | MEDIUM | `ollama-local (llama3.2)` | `T1071.001, CVE-2023-38606` (Verified) | Steady-state CPU |
| 12 | `bench-12-unseen` | spring4shell_rce | 74.61 s | CRITICAL | `ollama-local (llama3.2)` | `CVE-2022-22965, CVE-2021-44228` (Verified) | Steady-state CPU |
| 13 | `bench-13-unseen` | exchange_ssrf_proxylogon | 78.53 s | CRITICAL | `ollama-local (llama3.2)` | `CVE-2021-26855, CVE-2021-44228` (Verified) | Steady-state CPU |
| 14 | `bench-14-unseen` | default_credentials_probe | 69.91 s | HIGH | `ollama-local (llama3.2)` | `T1078.001, CVE-2021-44228` (Verified) | Steady-state CPU |
| 15 | `bench-15-unseen` | network_port_scan | 108.53 s | INFO | `deterministic-offline-rag (fallback)` | `T1046, CVE-2021-44228` (Verified) | **FALLBACK**: Unterminated JSON at char 495 |
| 16 | `bench-16-unseen` | ssh_lateral_movement | 69.09 s | HIGH | `ollama-local (llama3.2)` | `T1021.004, CVE-2023-38606` (Verified) | Steady-state CPU |
| 17 | `bench-17-unseen` | udp_flood_ddos | 44.67 s | CRITICAL | `ollama-local (llama3.2)` | `T1498.001, CWE-307` (Verified) | Steady-state CPU |
| 18 | `bench-18-unseen` | activemq_openwire_rce | 54.08 s | CRITICAL | `ollama-local (llama3.2)` | `CVE-2023-46604, CVE-2021-44228` (Verified) | Steady-state CPU |
| 19 | `bench-19-unseen` | http2_rapid_reset | 51.57 s | HIGH | `ollama-local (llama3.2)` | `CVE-2023-44487, CVE-2023-46604` (Verified) | Steady-state CPU |
| 20 | `bench-20-unseen` | password_spray_attack | 53.76 s | HIGH | `ollama-local (llama3.2)` | `T1110.003, CWE-307` (Verified) | Steady-state CPU |

---

## 4. Failure Resilience & Graceful Degradation Verification

| Test Scenario | Condition Injected | Expected System Behavior | Actual Measured Outcome | Status |
|---|---|---|---|:---:|
| **Test A: Daemon Unreachable** | Port `19999` (simulating stopped daemon or port collision) | Catch connection error, immediately fallback to deterministic offline RAG | Degraded gracefully to `deterministic-offline-rag (fallback)` in **2461.44 ms** | **PASS** |
| **Test B: Forced Timeout** | `timeout=0.0001s` (simulating frozen generation loop) | Catch timeout exception, immediately fallback to deterministic offline RAG | Degraded gracefully to `deterministic-offline-rag (fallback)` in **441.59 ms** | **PASS** |
| **Test C: Malformed Non-JSON Output** | Non-JSON string returned by model | Catch JSONDecodeError, log warning, fallback to deterministic offline RAG | Recovered via fallback in **1.87 ms** with clear fallback reason | **PASS** |

---

## 5. Console Badge Behavior During Failover & Decoupled Upgrades

The console displays the true origin of each explanation:
- Initial Fast Triage (Immediate Ingestion): `Engine: Offline RAG (deterministic-offline-rag)`
- Decoupled Neural LLM Upgrade: `LLM: ollama-local (llama3.2)`
- Failover on Model Crash / Invalid JSON: `Engine: Offline RAG (deterministic-offline-rag (fallback))`
