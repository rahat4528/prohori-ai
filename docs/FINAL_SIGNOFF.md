# Prohori AI — Official Hackathon Final Sign-Off Document

**Team**: Team Orionids (Daffodil International University, Dept. of CSE)  
**Event**: International AI Builders Congress 2026 (InfraSphere AI &rarr; SecureAI)  
**Project**: Prohori AI ("প্রহরী") — Self-Hostable, Bilingual AI SOC Analyst  

---

## 1. Submission Gate Readiness Criteria (4 Mandatory Blockers)

To guarantee absolute compliance with the competition's academic integrity standards and technical evaluation rubric, the four gates below must be satisfied before declaring the project submission-ready.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FINAL SIGN-OFF GATES                            │
├────────────────────────────────────────────────────────────────────────┤
│  [ ] Gate 1: Real LLM Inference Verified                               │
│  [ ] Gate 2: Bengali Samples Reviewed & Signed by Native Speaker       │
│  [ ] Gate 3: Real Team Names Filled & Confirmed in docs/TEAM.md        │
│  [ ] Gate 4: Narrated 60-90s Backup Demo Video Recorded & Verified    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Gate 1: Real LLM Inference Verification
- **Status**: `[ ] UNTICKED (NOT VERIFIED)`
- **Verification Evidence**: 
  - Host audit confirms `ollama` is not installed (`where.exe ollama` -> not found) and no `.env` API keys (`GEMINI_API_KEY` / `GROQ_API_KEY`) are present.
  - The system is verified in **Deterministic Offline RAG mode** (~50 ms latency, 34/34 tests passing), which uses rule-guided STIX 2.1 knowledge retrieval, but does NOT run a generative neural LLM.
- **Unblocking Action Required**: 
  - Either install and pull local Ollama (`winget install Ollama.Ollama` then `ollama pull llama3.2`), OR
  - Provide a Google Gemini API key (`GEMINI_API_KEY`) in `.env`.
  - Once active, run 10 test events and link the execution evidence to [`docs/evidence/llm_runs.md`](docs/evidence/llm_runs.md).

---

### Gate 2: Bengali Linguistic Review & Sign-Off
- **Status**: `[ ] UNTICKED (NOT VERIFIED)`
- **Verification Evidence**: 
  - 10 sample alert scenarios prepared in [`docs/BANGLA_REVIEW.md`](BANGLA_REVIEW.md) (5 from deterministic RAG, 5 reserved for neural LLM).
  - Automated coding assistants cannot ethically certify native linguistic fluency or terminology appropriateness.
- **Unblocking Action Required**: 
  - A native Bengali speaker from Team Orionids must review the 10 rows in [`docs/BANGLA_REVIEW.md`](BANGLA_REVIEW.md), complete the accuracy/fluency/terminology checkboxes, provide any required edits, and sign the reviewer block.

---

### Gate 3: Team Roster & Academic Credentials
- **Status**: `[ ] UNTICKED (NOT CONFIRMED)`
- **Verification Evidence**: 
  - Single source of truth established in [`docs/TEAM.md`](TEAM.md).
  - All placeholders (`[FILL: name]`, `[FILL: role]`, `[FILL: credibility line]`) are cleanly propagated to [`docs/PITCH_DECK.md`](PITCH_DECK.md), [`README.md`](../README.md), [`docs/LINKEDIN_POST.md`](LINKEDIN_POST.md), and [`scripts/generate_pitch_deck.py`](../scripts/generate_pitch_deck.py).
- **Unblocking Action Required**: 
  - The user must provide the names, roles, and one-line credibility descriptions for the 3 team members to replace the `[FILL]` markers in [`docs/TEAM.md`](TEAM.md).

---

### Gate 4: Narrated Backup Demo Video
- **Status**: `[ ] UNTICKED (NOT RECORDED)`
- **Verification Evidence**: 
  - Complete recording guide, timing matrix, and second-by-second narration script prepared in [`docs/BACKUP_VIDEO_GUIDE.md`](BACKUP_VIDEO_GUIDE.md).
  - Output directory `docs/backup/` created and git-ignored.
- **Unblocking Action Required**: 
  - The user must follow [`docs/BACKUP_VIDEO_GUIDE.md`](BACKUP_VIDEO_GUIDE.md), record a 60–90 second screen capture of `http://localhost:3000` during `python scripts/demo_replay.py`, and save copies to `docs/backup/prohori_demo_backup.mp4` and a backup USB drive.

---

## 2. Technical Baseline & Quality Verification Summary

| Verification Category | Command Executed | Result / Output | Gate Impact |
|---|---|---|:---:|
| **Unit & Integration Suite** | `python -m pytest` | **34 passed in ~5.06s** | **PASS** |
| **End-to-End Architectural Test** | `python scripts/verify_e2e.py` | **15/15 checks passed (100%)** | **PASS** |
| **Frontend Production Build** | `cd web; npm run build` | **Built in 598 ms (0 errors)** | **PASS** |
| **Python Code Quality** | `python -m ruff check .` | **All checks passed! (0 errors)** | **PASS** |
| **Frontend Code Quality** | `npx oxlint` | **0 warnings, 0 errors in 56ms** | **PASS** |
| **Python Dependencies** | `pip-audit` | **No known vulnerabilities found** | **PASS** |
| **Frontend Dependencies** | `npm audit` | **found 0 vulnerabilities** | **PASS** |
| **Opt-In Authentication** | `pytest api/tests/test_auth.py` | **2 passed (open mode & protected mode verified)** | **PASS** |

---

## 3. Final Certification Sign-Off

> [!CAUTION]
> The final verdict for hackathon submission remains **NOT READY FOR HACKATHON** until all four gates above are completed with empirical evidence and human sign-offs.

- **Lead Developer Confirmation**: ___________________________________________
- **Date**: ________________________
- **Submission Status**: `[ ] READY FOR HACKATHON` / `[X] NOT READY FOR HACKATHON (Awaiting 4 Gates)`
