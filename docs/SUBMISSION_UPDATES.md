# Prohori AI ("প্রহরী") — Submission Updates & Verification Audit

**Team**: Team Orionids  
**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**  
**Audit Date**: November 9, 2026  
**Status**: All mentor review items addressed; prototype fully verified; submission-ready.

---

## 1. Executive Summary of Improvements

Following a strict mentor review, Prohori AI underwent a comprehensive engineering and documentation overhaul:
- **Resilient Local Database Startup**: Fixed PostgreSQL requirement crash for local developers by implementing an automatic SQLite fallback (`prohori.db`) in `api/app/database.py`.
- **Refocused Pitch & Script**: Shifted pitch and demonstration narrative so that **~90% of presentation time is dedicated to the Bilingual AI SOC Analyst core**, presenting the 3 sensors in 20 seconds as simple data feeds.
- **Truthful, Grounded Claims**: Audited every single claim against actual running code, replacing exaggerated statements ("zero hallucination", "zero bytes ever leave", "under 800ms") with empirically verified facts and real benchmark measurements.
- **Widescreen PPTX & Visual Deck**: Produced a production-ready 16:9 widescreen PowerPoint deck (`docs/Prohori_AI_Pitch_Deck.pptx`) with dark SOC styling, strict < 15 words of body text per slide, and an embedded high-contrast QR code (`docs/assets/repo_qr_code.png`).
- **Comprehensive Defense & Social Kit**: Created an 8-question Judge Defense Q&A guide (`docs/JUDGE_QA.md`), a 75-second backup video recording protocol using Windows Game Bar, and ready-to-use LinkedIn and Discord drafts (`docs/LINKEDIN_POST.md`).

---

## 2. Before-and-After Audit Matrix

| Dimension | Previous State | Current Submission State | Why Changed |
|---|---|---|---|
| **Local Startup** | Crashed with `ConnectionRefusedError` if local PostgreSQL was absent. | Automatic graceful fallback to `sqlite+aiosqlite:///prohori.db`. | Ensures any evaluator or teammate can run `uvicorn app.main:app` out of the box with zero external DB setup. |
| **Pitch Focus** | Spent equal time (~50%) explaining the 3 defensive sensors instead of the AI. | **90% of pitch & video time** focused on the Bilingual AI Analyst; 3 sensors framed in 20 seconds. | Sensors are commodity data feeds; the core differentiator is the bilingual AI reasoning engine. |
| **Data Sovereignty** | Claimed "zero data leaves the country" without qualification. | Explicitly states: **Offline Ollama/Deterministic mode is the default sovereign mode (zero data egress)**; cloud LLMs (Groq/Gemini) are optional. | Truth in engineering: cloud APIs transmit event text over the internet; local Ollama does not. |
| **Sensor Count** | Inconsistent: some docs said 3 sensors, LinkedIn draft said 4. | Standardized on **exactly 3 defensive sensors** (Honeypot, Abuse Guard, Scanner) + 1 Operator Console. | Eliminates judge confusion between sensors and user interfaces. |
| **Triage Latency** | Claimed "under 800 ms per alert" without empirical measurement. | **Measured 32.03 ms median steady-state latency** for deterministic RAG (2,111 ms cold-start); local neural LLM (Ollama CPU) median **70.55 s** (24.85 s concise). Ingestion decoupled to ~35 ms. | Replaces unverified estimate with empirical benchmarks and decoupled ingestion architecture. |
| **AI Hallucination** | Claimed "zero hallucination". | Replaced with **"grounded in retrieved MITRE ATT&CK & CVE intelligence with verified citation badges"**. | No LLM can guarantee zero hallucination; citing retrieved source documents is technically accurate. |
| **NVD / MITRE Sync** | Implied automated scheduled cron synchronization. | Accurately describes `knowledge/ingest.py` as a manual/startup ingestion script; cron sync placed on roadmap. | Accurate reflection of current codebase capabilities. |
| **Statistics** | Stated unsourced "85% of institutions cannot afford a SOC" and "$40k–$100k salary". | Softened to "many small organizations and public offices cannot afford dedicated SOC teams". | Prevents credibility loss during judge scrutiny. |
| **Commercial Model** | Quoted $1,200/node and $99/mo as established commercial pricing. | Explicitly labeled as an **unvalidated commercial hypothesis** formulated for hackathon judging criteria. | Honest acknowledgment of early-stage hackathon prototype maturity. |
| **Pitch Materials** | Markdown pitch outline only; no real PowerPoint file; no QR code. | Real 8-slide PowerPoint deck (`.pptx`) + embedded QR code pointing to repository. | Provides a polished, ready-to-present visual artifact. |

---

## 3. Real Test & Benchmark Results

### A. Pytest Suite Execution
- **Command**: `.venv\Scripts\python -m pytest`
- **Result**: `38 passed in 13.08s` (100% pass rate)
- **Coverage**:
  - `api/tests/`: Event ingestion, PII redaction, schema validation, rate limit middleware, opt-in header auth, JSON-grammar failover, grounding validation, and decoupled background LLM upgrading
  - `sensors/deception/tests/`: Simulated honeypot traps, isolated response generation, telemetry streaming
  - `sensors/ratelimiter/tests/`: Sliding-window token-bucket limiter, progressive HTTP 429 blocking
  - `sensors/discovery/tests/`: Target allowlist enforcement, non-allowlisted target rejection (HTTP 403)
  - `analyst/tests/`: Autonomous triage agent, correlation agent, bilingual narrative generation, MITRE/CVE RAG retrieval, and strict citation grounding

### B. Empirical Latency & Inference Benchmark
- **Deterministic RAG Engine Benchmark** (`scripts/benchmark_latency.py`):
  - **Sample Size**: 20 alerts
  - **Min Latency**: `30.82 ms`
  - **Median Latency**: `32.03 ms`
  - **Mean Latency**: `136.21 ms`
  - **Cold-Start (Alert 1)**: `2,111.45 ms` (database connection initialization & embedding store warm-up)
  - **Steady-State Latency (Alerts 2–20)**: `30.82 ms – 35.61 ms`
- **Real Neural LLM Benchmark — Ollama Llama 3.2 on CPU** (`scripts/benchmark_ollama.py`):
  - **Host Hardware**: AMD Ryzen 7 PRO 4750U (8 cores, 16 threads), 32 GB RAM (No discrete CUDA GPU).
  - **Sample Size**: 20 distinct alerts (5 demo scenarios + 15 novel unseen attack types).
  - **Cold-Start (Alert 1)**: `77,284.54 ms` (77.28 s)
  - **Steady-State Median (Alerts 2–20)**: `70,550.23 ms` (70.55 s)
  - **Min Latency**: `44,672.53 ms` (44.67 s)
  - **Max Steady Latency**: `110,056.05 ms` (110.06 s)
  - **Grounding Audit**: 60 total citations evaluated; validator verified 59 of 60 cited IDs and removed 1 unindexed sub-technique (`T1490.001`) before storage.
  - **Resilience Tests**:
    - Unreachable daemon: gracefully fell back in `2,461.44 ms`.
    - Forced timeout: gracefully fell back in `441.59 ms`.
    - Malformed non-JSON output: recovered with deterministic fallback in `1.87 ms`.
  - **Full Evidence Document**: [`docs/evidence/llm_runs.md`](evidence/llm_runs.md).

### C. Live End-to-End Campaign Replay
- **Command**: `python scripts/demo_replay.py`
- **Verification**:
  1. `Phase 1 (Recon)`: Honeypot traps port scan &rarr; Event ingested.
  2. `Phase 2 (Credential Stuffing)`: Decoy traps login probes &rarr; High severity assigned.
  3. `Phase 3 (Brute Force Burst)`: Threshold exceeded &rarr; Escalated to CRITICAL.
  4. `Phase 4 (API Abuse)`: Token bucket exhausted &rarr; HTTP 429 block recorded.
  5. `Phase 5 (CVE Match)`: Asset vulnerability matched against local CVE store.
  6. **Incident Aggregation**: Correlated into Incident `INC-2026-0001` with bilingual narratives in plain English and native Bengali, citing MITRE ATT&CK `[T1595.002]`, `[T1110.001]`, and `[T1499.002]`.

---

## 4. Manifest of Files Created or Modified

| File Path | Status | Purpose |
|---|---|---|
| [`README.md`](file:///c:/diu/README.md) | Modified | Added submission index, fixed Part B claims, added benchmark data & local DB instructions |
| [`.gitignore`](file:///c:/diu/.gitignore) | Modified | Added video exclusion rules (`*.mp4`, `*.mov`, `*.webm`) to prevent large binary git commits |
| [`api/app/database.py`](file:///c:/diu/api/app/database.py) | Modified | Added automatic graceful fallback to local SQLite when PostgreSQL is offline |
| [`scripts/benchmark_latency.py`](file:///c:/diu/scripts/benchmark_latency.py) | Created | Empirical 20-alert latency benchmark script with hardware specs and percentiles |
| [`scripts/generate_pitch_deck.py`](file:///c:/diu/scripts/generate_pitch_deck.py) | Created | Python automation script to generate the official 16:9 widescreen PowerPoint deck |
| [`docs/assets/repo_qr_code.png`](file:///c:/diu/docs/assets/repo_qr_code.png) | Created | High-contrast QR code image for deck and poster displays |
| [`docs/Prohori_AI_Pitch_Deck.pptx`](file:///c:/diu/docs/Prohori_AI_Pitch_Deck.pptx) | Created | Official 8-slide presentation file with dark SOC styling, notes, and QR code |
| [`docs/PITCH_DECK.md`](file:///c:/diu/docs/PITCH_DECK.md) | Modified | Rewritten to exact 8-slide format (< 15 words body text), rehearsal log, stage plan & mentor guide |
| [`docs/DEMO_VIDEO_SCRIPT.md`](file:///c:/diu/docs/DEMO_VIDEO_SCRIPT.md) | Modified | Restructured to 90% AI core focus (20s on sensors) + 75s backup recording protocol |
| [`docs/JUDGE_QA.md`](file:///c:/diu/docs/JUDGE_QA.md) | Created | Comprehensive, grounded answers to 8 tough judge questions |
| [`docs/LINKEDIN_POST.md`](file:///c:/diu/docs/LINKEDIN_POST.md) | Created | Draft LinkedIn submission post, asset checklist, retrospective story & Discord messages |
| [`docs/SUBMISSION_UPDATES.md`](file:///c:/diu/docs/SUBMISSION_UPDATES.md) | Created | This complete audit and verification report |

---

## 5. Operator Console Simplification & Accessibility Overhaul

During final preparation, the operator console underwent a complete simplification overhaul on branch `ui-simplify` to satisfy the **5-Second Judge Comprehension Rule**:

### A. Architectural Changes
1. **From 7-Column Table to 2-Column Focus**:
   - **Left Column (Alert List)**: Plain-language attack names ("Credential Stuffing Attack", "Log4j JNDI Injection Attack"), severity badges with distinct shapes + colors + text, real-time search, and severity dropdown filter.
   - **Right Column (Selected Alert Intelligence)**: What Happened narrative with bilingual EN/বাংলা toggle, Grounded Citations (`[T1110.001]`, `[CWE-307]`), Recommended Defense action, prominent **"Approve Defense"** button (44px target) with instant inline audit log record, and contextual **"Ask AI Analyst About This Threat"** chat with honest engine status badge (`Engine: Offline RAG` vs `LLM: ollama-local (llama3.2)`).
2. **Accessible "More ▾" Menu**:
   - Preserves all secondary capabilities without screen clutter: Audit Trail, 8-Slide Pitch Deck, Data Sovereignty Toggle (On-Prem vs Cloud), Interactive API Documentation link (`/docs`), and Keyboard Shortcuts Guide.
3. **100% Offline Font Bundling (Zero External Network Egress)**:
   - Eliminated external Google Fonts CDN links from `web/index.html`.
   - Downloaded and bundled local WOFF2 files into `web/public/fonts/` (`plus-jakarta-sans.woff2`, `jetbrains-mono.woff2`, `hind-siliguri-bengali.woff2`, `hind-siliguri-latin.woff2`).
   - Browser audit verifies **0 external network requests** to Google or third-party CDNs.
4. **Projector & High-Contrast Typography**:
   - Upgraded base font from 13px to **16px** with line-height **1.6** for high readability from 10 feet on conference projectors.
   - High-contrast text colors (`#f8fafc` primary on `#05080e` canvas = 18.2:1 contrast ratio, exceeding WCAG AAA).
   - High-contrast interactive focus rings (`:focus-visible` with 2px cyan outline).
5. **Mobile & Small Screen Responsiveness**:
   - On screens < 900px, automatically transitions into a segmented tab view (`[ Live Alerts (n) ]` vs `[ Threat Analysis ]`) with zero horizontal overflow and 44px minimum touch targets.
   - Selecting any alert in mobile view automatically flips to the Analysis tab for instant comprehension.

### B. Before vs. After Verification Metrics

| Metric | Before (Original UI) | After (Simplified UI) | Verification Evidence |
|---|---|---|---|
| **Layout** | 7-column table + 4 top KPI cards + drawer | Clean 2-column layout + More menu | Captured in `docs/screenshots/after/` |
| **External CDN Requests** | 10 requests to `fonts.googleapis.com` / `gstatic.com` | **0 (Zero)** external requests | `docs/screenshots/after/report.json` |
| **Base Font Size** | 13px (difficult on projectors) | **16px** (readable from 10 feet) | `web/src/index.css` |
| **Text Contrast Ratio** | ~4.2:1 on subtle text | **18.2:1** primary / **11.4:1** secondary | WCAG AAA compliant |
| **Production Bundle Size** | 308.2 kB JS / 7.8 kB CSS | **309.7 kB JS / 7.9 kB CSS** | `npm run build` |
| **Lint Status** | Unchecked | **0 warnings, 0 errors** | `npx oxlint` |
| **Keyboard Shortcuts** | Shift+P, Shift+A, Shift+S | **Shift+D, Shift+A, Shift+P, Shift+S, Shift+L, ?, Esc** | `ShortcutsModal.tsx` |

---

## 6. Items Requiring User Input (`[FILL]` Registry)

To maintain absolute integrity, no facts or identities were fabricated. Before submitting, replace the following placeholders with your actual details:

### A. Team & Organization Details
1. **GitHub Repository URL**:
   - **Live Repository**: [https://github.com/rahat4528/prohori-ai](https://github.com/rahat4528/prohori-ai) (Created as private repository and linked as `origin`).
2. **Team Member Names, Roles & Social Handles**:
   - Files: `docs/PITCH_DECK.md` (Section 5), `docs/LINKEDIN_POST.md` (Section 1)
   - Needs: Real names, academic enrollments (e.g., Daffodil International University / DIU), specific technical contributions, and LinkedIn handles.
3. **Congress Bonus Signals**:
   - File: `docs/PITCH_DECK.md` (Section 5)
   - Needs: Any specific Congress eligibility signals (e.g., student-led team, diverse backgrounds, first-time participants).

### B. Presentation Logistics & Mentor Data
4. **Allocated Presentation Slot Length**:
   - File: `docs/PITCH_DECK.md` (Header & Section 2)
   - Needs: Verify whether your competition presentation slot is 3 minutes (180s) or 5 minutes (300s).
5. **Rehearsal Timing Records**:
   - File: `docs/PITCH_DECK.md` (Section 2B)
   - Needs: Record actual stopwatch elapsed times for 3 to 5 rehearsal runs with your team.
6. **Mentor Feedback Record**:
   - Files: `docs/PITCH_DECK.md` (Section 4), `docs/LINKEDIN_POST.md` (Section 1 & 4)
   - Needs: Name and affiliation of any hackathon mentor or advisor who gave you input, plus their LinkedIn handle. (If you have not met a mentor yet, use the 3 pre-written interview questions in `docs/PITCH_DECK.md` Section 4B).

### C. Visual Media Attachments
7. **Social Media Screenshots**:
   - File: `docs/LINKEDIN_POST.md` (Section 2)
   - Needs: Capture 3-4 screenshots from your browser running `http://localhost:3000` (Hero Bengali reasoning, console overview, audit drawer) to attach to your post.
8. **Backup Video File**:
   - File: `docs/DEMO_VIDEO_SCRIPT.md` (Section 2)
   - Needs: Record the 75-second backup video using `Win + Alt + R` as detailed in the checklist and save a copy on a USB drive.

---

## 6. Known Technical Boundaries & Roadmap

| Feature Area | Current Hackathon Implementation | Future Production Roadmap |
|---|---|---|
| **Threat Intelligence Sync** | Curated static/startup ingestion script (`knowledge/ingest.py`) with pre-seeded MITRE & CVE records. | Automated background cron synchronization via NIST NVD API and MITRE TAXII 2.1 feeds. |
| **Log Ingestion Sources** | 3 lightweight built-in HTTP sensors (Honeypot, Abuse Guard, Scanner). | Native Syslog (RFC 5424), Windows Event Log (WEF), and Wazuh agent forwarding integrations. |
| **Model Availability** | Offline deterministic RAG + Ollama local LLM + optional Gemini/Groq APIs. | Fine-tuned 8B quantized bilingual security model deployed on edge hardware. |
| **Audit Verification** | SHA-256 hashed append-only relational table with strict timestamps. | Distributed ledger integration or RFC 6962 Certificate Transparency style Merkle tree proofs. |

