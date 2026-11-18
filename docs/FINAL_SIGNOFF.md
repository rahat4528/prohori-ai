# Prohori AI — Official Hackathon Final Sign-Off Document

**Team**: Team Orionids (Dept. of CSE)  
**Host Venue**: Daffodil International University (DIU)  
**Event**: International AI Builders Congress 2026 (InfraSphere AI &rarr; SecureAI)  
**Project**: Prohori AI ("প্রহরী") — Self-Hostable, Bilingual AI SOC Analyst  

---

## 1. Submission Gate Readiness Criteria (Human & Automated Gates)

To guarantee absolute compliance with the competition's academic integrity standards and technical evaluation rubric, all gates below must be evaluated before declaring the project submission-ready.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FINAL SIGN-OFF GATES                            │
├────────────────────────────────────────────────────────────────────────┤
│  [x] Gate A: Real LLM Inference Verified (Local Ollama Llama 3.2)       │
│  [x] Gate B: Decoupled Stage Demo Path Verified (32ms Ingest / 60s Replay)│
│  [x] Gate C: All 5 Microservices Verified (Ports 8000, 8081-8083, 3000)│
│  [ ] Gate 1 (HUMAN): Bengali Linguistic Review Signed by Native Speaker│
│  [ ] Gate 2 (HUMAN): Team Member Names & Roles Confirmed in TEAM.md    │
│  [ ] Gate 3 (HUMAN): Narrated 60-90s Backup Demo Video Recorded        │
│  [ ] Gate 4 (HUMAN): Public Repo Clone Check from Outside Network      │
│  [ ] Gate 5 (HUMAN): Pitch Deck Slide Content & Presentation Review   │
│  [ ] Gate 6 (HUMAN): Submission Form Answers Review                   │
└────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> **API Authentication Default State**: API authentication is **OFF by default in demo mode** so hackathon judges and evaluators can immediately run and test the complete stack without generating or providing keys. Production deployments must configure `PROHORI_API_KEY` (which rejects unauthenticated requests with HTTP 401).

---

### Automated Gate A: Real LLM Inference Verification
- **Status**: `[x] TICKED (VERIFIED WITH REAL BENCHMARK EVIDENCE)`
- **Verification Evidence**: 
  - Host audit confirms `ollama` is installed and running local `llama3.2:latest` (2.0 GB weights) on AMD Ryzen 7 PRO 4750U CPU.
  - Successfully executed 20 distinct alert triage runs (5 demo scenarios + 15 novel unseen attack types) via `scripts/benchmark_ollama.py`.
  - **Latency Profile**: Cold start: `77,284.54 ms` (77.28 s) | Median steady-state: `70,550.23 ms` (70.55 s) | Min: `44,672.53 ms` (44.67 s).
  - **Grounding Rate**: 60 total citations evaluated against indexed knowledge base in `knowledge/data/curated_kb.py`; the validator verified 59 of 60 cited IDs and removed 1 unindexed sub-technique (`T1490.001`) before storage (preserving parent technique `T1490`).
  - **Failure Resilience**: Verified graceful degradation to `deterministic-offline-rag (fallback)` under 3 failure conditions:
    - Daemon offline / unreachable port: recovered in `2,461.44 ms`.
    - Forced timeout: recovered in `441.59 ms`.
    - Malformed non-JSON output: recovered in `1.87 ms`.
  - Detailed raw logs and benchmark matrix published in [`docs/evidence/llm_runs.md`](evidence/llm_runs.md).

---

### Automated Gate B: Decoupled Stage Demo Path Verification
- **Status**: `[x] TICKED (VERIFIED WITH REAL EXECUTION EVIDENCE)`
- **Verification Evidence**: 
  - Tested decoupled event ingestion with `LLM_PROVIDER=ollama`: `POST /events` returned immediately in synchronous fast triage (median **32.03 ms** measured via `scripts/benchmark_latency.py`), while neural LLM enrichment proceeded in the background without blocking the caller.
  - Executed full 5-stage attack campaign replay via `scripts/demo_replay.py` in **35.5 seconds** without sensor timeouts.
  - Unit test `test_decoupled_ingestion_with_background_llm_upgrade` verified passing.
  - Selected Alert Panel updated to render the live engine badge (`Engine: Offline RAG` / `LLM: ollama-local (llama3.2)`).

---

### Automated Gate C: Microservice Stack & Discovery Sensor (Port 8083)
- **Status**: `[x] TICKED (VERIFIED ON PORTS 8000, 8081, 8082, 8083, 3000)`
- **Verification Evidence**:
  - Launch scripts (`start_all.bat`, `run.ps1`, `scripts/run_all.ps1`) updated to launch all 5 microservices including Service 4: Asset Discovery Sensor (`sensors/discovery/main.py:app` on port 8083).
  - End-to-end suite (`scripts/verify_e2e.py`) executed: **15 of 15 checks passed (100%)**, including check 13 verifying the port 8083 discovery sensor.
  - Unit tests in `sensors/discovery/tests/test_discovery.py` verified 6 passed (strict 403 blocking on off-list targets).

---

### Human Gate 1: Bengali Linguistic Review & Sign-Off
- **Status**: `[ ] UNCHECKED (HUMAN REQUIRED)`
- **Requirement**: A native Bengali speaker on Team Orionids must review the 10 scenario rows in [`docs/BANGLA_REVIEW.md`](BANGLA_REVIEW.md), verify cybersecurity terminology accuracy and natural phrasing, and sign the reviewer block.

---

### Human Gate 2: Team Roster & Roles in docs/TEAM.md
- **Status**: `[ ] UNCHECKED (HUMAN REQUIRED)`
- **Requirement**: Confirm final team member names, roles, and track selections in [`docs/TEAM.md`](TEAM.md) matching the CloudCamp competition registration portal.

---

### Human Gate 3: Narrated Backup Demo Video Recording
- **Status**: `[ ] UNCHECKED (HUMAN REQUIRED)`
- **Requirement**: Following [`docs/BACKUP_VIDEO_GUIDE.md`](BACKUP_VIDEO_GUIDE.md), record a 60–90 second screen capture of `http://localhost:3000` during `python scripts/demo_replay.py`, and save to `docs/backup/prohori_demo_backup.mp4` and a backup USB drive.

---

### Human Gate 4: Public Repository Clone Verification
- **Status**: `[ ] UNCHECKED (HUMAN REQUIRED)`
- **Requirement**: Verify repository clone from outside the local network (independent laptop/mobile hotspot) without authentication to ensure the GitHub repository is public and accessible.

---

### Human Gate 5: Pitch Deck Review
- **Status**: `[ ] UNCHECKED (HUMAN REQUIRED)`
- **Requirement**: Review generated 16:9 widescreen slides in `docs/Prohori_AI_Pitch_Deck.pptx` (8 slides, embedded QR code) and verify presenter speaking scripts in [`docs/PITCH_DECK.md`](PITCH_DECK.md).

---

### Human Gate 6: Submission Form Answers Review
- **Status**: `[ ] UNCHECKED (HUMAN REQUIRED)`
- **Requirement**: Verify answers and track selection in [`docs/SUBMISSION_FORM_ANSWERS.md`](SUBMISSION_FORM_ANSWERS.md) against the final competition submission portal guidelines.

---

## 2. Technical Baseline & Quality Verification Summary

| Verification Category | Command Executed | Result / Output | Gate Impact |
|---|---|---|:---:|
| **Unit & Integration Suite** | `python -m pytest` | **50 passed in 38.90s** (0 failures) | **PASS** |
| **End-to-End Architectural Test** | `python scripts/verify_e2e.py` | **15/15 checks passed (100%)** | **PASS** |
| **Python Code Quality** | `python -m ruff check .` | **All checks passed! (0 errors)** | **PASS** |
| **Frontend Code Quality** | `npx oxlint` | **0 warnings, 0 errors in 171ms** | **PASS** |
| **Frontend Production Build** | `cd web; npm run build` | **Built in 743ms (442.60 kB JS bundle)** | **PASS** |
| **Python Dependencies** | `pip-audit` | **No known vulnerabilities found** | **PASS** |
| **Frontend Dependencies** | `npm audit` | **5 high-severity vulnerabilities (dev-only build tools: picomatch/vite; 0 runtime impact)** | **DOCUMENTED ADVISORY** |
| **Opt-In Authentication** | `pytest api/tests/test_auth.py` | **2 passed (open mode & protected mode verified)** | **PASS** |
| **Asset Discovery Boundary** | `pytest sensors/discovery/tests/` | **6 passed in 1.72s (strict 403 blocking)** | **PASS** |
| **Attack Campaign Replay** | `python scripts/demo_replay.py` | **100% complete (5/5 stages emitted, 9 incidents)** | **PASS** |

---

## 3. Final Certification Sign-Off

> [!CAUTION]
> The final verdict for hackathon submission remains **NOT READY FOR HACKATHON** until the 6 human-gate items above are completed and signed off by the team.

- **Lead Developer Confirmation**: ___________________________________________
- **Date**: ________________________
- **Submission Status**: `[ ] READY FOR HACKATHON` / `[X] NOT READY FOR HACKATHON (Awaiting Human Gates 1–6)`

