# Prohori AI ("প্রহরী") — Comprehensive Project Summary & Operational Report

**Team Orionids · Department of Computer Science & Engineering, Daffodil International University**  
**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**  
**Official Repository**: [https://github.com/rahat4528/prohori-ai](https://github.com/rahat4528/prohori-ai)

---

## 1. Completed Tasks & Features

Prohori AI is an AI-native, bilingual (Bangla + English), self-hostable Security Operations Center built to protect institutions lacking dedicated 24/7 security personnel. All core technical features have been built, integrated, and verified:

1. **Unified Event Ingestion Bus (FastAPI)**:
   - High-throughput asynchronous REST API (`POST /events`, `GET /events`, `GET /events/{id}`).
   - Schema validation via Pydantic models enforcing source type, severity level, and structured payload fields.
   - Decoupled ingestion architecture: Ingestion immediately runs deterministic triage (~30–50ms) and returns `HTTP 201 Created`, while neural LLM enrichment runs asynchronously in the background.
2. **Defensive Telemetry Sensors (3 Microservices)**:
   - **Simulated Deception Honeypot (Port 8081)**: Traps web reconnaissance probes targeting sensitive diagnostic endpoints (`/.env`, `/wp-admin`) and captures repeated credential stuffing bursts on fake login forms (`/api/v1/auth/login`).
   - **API Abuse Guard Reverse Proxy (Port 8082)**: Protective edge filter enforcing sliding-window rate limits (10 requests / 10s default), issuing progressive `HTTP 429` rate limit containment blocks, and managing an active in-memory denylist.
   - **Asset Discovery & Vulnerability Scanner (Port 8083)**: Scans allowlisted subnets for open services and matches discovered banners against NIST CVE records (e.g., OpenSSH Terrapin `CVE-2023-38606`). Strictly rejects non-allowlisted targets with `HTTP 403 Forbidden`.
3. **Dual-Plane AI SOC Analyst Core**:
   - **Plane 1 (Deterministic Offline RAG)**: Retrieval-augmented threat classification grounded against curated MITRE ATT&CK STIX 2.1 bundles and NIST CVE records. Measured steady-state latency: **32.03 ms median**.
   - **Plane 2 (Neural Generative LLM via Ollama Llama 3.2)**: Generates human-like threat explanations and interactive Q&A in plain English and native Bengali (বাংলা). Configured with strict JSON grammar failover and `keep_alive="60m"`.
4. **Human-in-the-Loop (HITL) Containment Gate**:
   - Defensive countermeasure recommendations require explicit operator sign-off.
   - Clicking **"Approve Defense"** (`POST /audit/approve`) adds the adversary IP to the live rate-limiter denylist, automatically transitions matching active incidents to `CONTAINED`, and logs an immutable entry in the audit log.
5. **Interactive Bilingual Threat Chat ("Ask the Analyst")**:
   - Real-time threat Q&A (`POST /analyst/ask` and SSE stream `GET /analyst/ask/stream`) allowing operators to ask questions in English or Bengali (e.g., *"কী ঘটেছে? কতটা বিপজ্জনক?"*).
6. **Append-Only Database Audit Trail**:
   - Immutable audit table (`audit_logs`) recording every reasoning step, model choice, citation, and operator approval for verifiable governance.
7. **Simplified 2-Column Tactical Operator Console (React 19 + Vite)**:
   - Designed for 5-second comprehension: Left = live alert feed; Right = selected threat intelligence panel (What Happened, Impact, Countermeasures, and Approve Defense).
   - Bundled local WOFF2 typography (`Hind Siliguri`, `JetBrains Mono`, `Plus Jakarta Sans`) with zero external Google Fonts or CDN egress.
   - Global keyboard shortcuts: `Shift+D` (Run Demo), `Shift+A` (Audit Log), `Shift+P` (Pitch Deck), `Shift+S` (Sovereignty Toggle), `?` (Shortcuts Help).
8. **Opt-In Header Authentication**:
   - Protects write endpoints (`POST /events`, `POST /audit/approve`, `POST /sovereignty/toggle`) via `X-API-Key: <PROHORI_API_KEY>`. Defaults to open demo mode with a console warning when unset.

---

## 2. Changes & Improvements Made

Following mentor evaluations and internal engineering audits, the following major improvements were executed:

1. **Ingestion Bottleneck Decoupling**:
   - *Problem*: Running `POST /events` with local CPU Ollama synchronously blocked the HTTP connection for ~80.2s, freezing stage demonstrations.
   - *Fix*: Decoupled ingestion into a two-stage pipeline. Immediate fast deterministic triage returns in ~35ms, persists the event, and emits `new_event` over WebSocket. The neural LLM enriches the record asynchronously and emits `event_enriched`.
2. **Grounding Validation & Hallucination Removal**:
   - *Problem*: The 3B model invented an unindexed sub-technique (`T1490.001`).
   - *Fix*: Implemented strict post-generation grounding validator in `analyst/agent.py` that verifies every cited ID against the knowledge base and strips invented citations prior to database persistence.
3. **JSON-Grammar Failover in Ollama Provider**:
   - *Problem*: 3 of 20 benchmark alerts encountered syntax errors when token budgets truncated JSON output.
   - *Fix*: Added Pydantic schema validation with automatic fallback to deterministic RAG templates whenever LLM JSON decoding fails.
4. **Latency Optimization Measurements**:
   - Pinned model weights in memory using `keep_alive="60m"` in `analyst/providers/ollama.py`, saving ~3.2s per invocation. Measured concise prompt configuration (`num_predict=500`), achieving a ~47% speedup (47.16s &rarr; 24.85s).
5. **Offline Typography & Zero CDN Egress**:
   - Removed external Google Fonts stylesheet links from `web/index.html`. Bundled local WOFF2 font files into `web/public/fonts/`, enabling 100% offline rendering without internet connectivity.
6. **Honest Claims & Terminology Standardization**:
   - Removed ungrounded claims (`"sub-5ms"`, `"Gemini ~1.2s"`, `"Groq ~0.8s"`, `"0 hallucinations"`).
   - Replaced `"cryptographic audit log"` with `"append-only audit log"` across all files, reflecting that database rows are immutable and append-only without a blockchain/HMAC hash chain.
   - Accurately documented that "Approve Defense" updates the software rate-limiter denylist and marks incidents `CONTAINED`; physical perimeter firewall drop is simulated at this software layer.

---

## 3. Technology Stack & Versions Used

| Subsystem / Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime Environment** | Python | `3.13.15` / `3.11+` | Backend services, AI analyst agents, and defensive sensors |
| **Frontend Framework** | React | `19.3.1` | Operator console user interface |
| **Frontend Build Tool** | Vite | `8.3.6` | Client-side bundler and development server |
| **Language (Web)** | TypeScript | `~7.0.2` | Static typing across React components |
| **Web Styling** | Tailwind CSS / Lucide | `lucide-react 1.70.0` | Dark SOC theme, high-contrast badges, and tactical icons |
| **Web Typography** | Local WOFF2 | Custom Bundles | Hind Siliguri (Bengali), JetBrains Mono, Plus Jakarta Sans |
| **Backend Framework** | FastAPI | `0.115.11` | Asynchronous REST endpoints, OpenAPI docs, and WebSocket stream |
| **ASGI Web Server** | Uvicorn | `0.34.0` | High-performance async server running services across 4 ports |
| **Database ORM** | SQLAlchemy | `2.0.38` | Asynchronous ORM supporting SQLite and PostgreSQL |
| **Async SQLite Driver**| aiosqlite | `0.21.0` | Zero-configuration local database engine |
| **Async Postgres Driver**| asyncpg | `0.30.0` | Production PostgreSQL driver supporting `pgvector` |
| **Local LLM Engine** | Ollama | `0.5.12+` | Local neural LLM runtime executing `llama3.2:latest` (3B) |
| **HTTP Client** | httpx | `0.28.1` | Inter-service sensor telemetry and LLM communication |
| **Data Validation** | Pydantic | `2.10.6` | Strict event schema, triage, and audit validation |
| **Testing Framework** | Pytest | `9.2.0` | 38 automated unit, sensor, security, and integration tests |
| **Python Linter** | Ruff | `0.17.4` | Code style enforcement and import ordering |

---

## 4. Hosting & Deployment Topology

| Service | Hosting Platform | Host / Port | Live / Local Endpoint | Healthcheck Endpoint |
|---|---|---|---|---|
| **Operator Console** | Local / Vercel | localhost:3000 / HTTPS | [http://localhost:3000](http://localhost:3000) &bull; [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app) | Root DOM render (HTTP 200) |
| **Event API & AI Core** | Local / Render | `127.0.0.1:8000` | [http://127.0.0.1:8000](http://127.0.0.1:8000) | [http://127.0.0.1:8000/healthz](http://127.0.0.1:8000/healthz) |
| **Interactive Swagger** | FastAPI built-in | `127.0.0.1:8000` | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) |
| **ReDoc API Reference**| FastAPI built-in | `127.0.0.1:8000` | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) |
| **Live WebSocket Stream**| FastAPI WebSocket | `127.0.0.1:8000` | `ws://127.0.0.1:8000/stream` | Protocol handshake (`101 Switching`) |
| **Deception Honeypot** | Local / Render | `127.0.0.1:8081` | [http://127.0.0.1:8081](http://127.0.0.1:8081) | [http://127.0.0.1:8081](http://127.0.0.1:8081) (`HTTP 200`) |
| **API Abuse Guard** | Local / Docker | `127.0.0.1:8082` | [http://127.0.0.1:8082](http://127.0.0.1:8082) | [http://127.0.0.1:8082/guard/status](http://127.0.0.1:8082/guard/status) |
| **Discovery Scanner** | Local / Docker | `127.0.0.1:8083` | [http://127.0.0.1:8083](http://127.0.0.1:8083) | [http://127.0.0.1:8083/allowlist](http://127.0.0.1:8083/allowlist) |
| **Local LLM Daemon** | Local Native Host | `127.0.0.1:11434` | [http://127.0.0.1:11434](http://127.0.0.1:11434) | [http://127.0.0.1:11434/api/tags](http://127.0.0.1:11434/api/tags) |
| **Database Storage** | SQLite / Postgres | File / 5432 | `sqlite+aiosqlite:///prohori.db` | Verified via `/healthz` (`db: connected`) |

### Cloud Hosting Blueprints:
1. **Render Infrastructure Blueprint (`render.yaml`)**:
   - **Hosting Platform**: **Render** (Cloud Application Platform, Linux container, Python 3.13, Uvicorn ASGI).
   - **Blueprint Instance ID**: `exs-dbrh0kec6qcc73dstli0`
   - **Management Console**: [https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0](https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0)
   - Automatically provisions `prohori-api` (FastAPI backend & AI Analyst) and `prohori-honeypot` (deception sensor) on the free tier.
   - Deployed via Render Dashboard &rarr; **New +** &rarr; **Blueprint** &rarr; Connect `https://github.com/rahat4528/prohori-ai`.
2. **Vercel Frontend Hosting (`vercel.json` & `web/vercel.json`)**:
   - Single-Page Application (SPA) configuration routing `/(.*)` to `/index.html`.
   - **Live Production URL**: [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app)
   - **Status**: Deployed to production by Rahat via GitHub integration on Vercel. Automatic CI/CD configured on pushes to main.

---

## 5. Git Commit & Modification History

The repository has been updated through clean, conventional commits. All changes from `ui-simplify` have been merged into `main` and pushed to `https://github.com/rahat4528/prohori-ai`:

```
* 279a1e6 docs(claims): align audit log terminology, replace cryptographic claims and add start-here checklist
* b18d2b8 docs(deploy): add deployment guide and master hosting matrix in readme and architecture
* f0d931f docs: report benchmark honestly with grouped latencies and remove unmeasured claims
* 43ce67c test(benchmark): record cheap latency optimizations and 3B model review caveats
* d486c13 feat(api): decouple event ingestion with immediate deterministic triage and async llm upgrade
* e6ef5c6 docs(signoff): certify gate 1 real llm inference with empirical execution evidence
* bbfaeff chore: clean script lints and regenerate widescreen pitch deck pptx
* 38ec227 docs: update documentation and judge defense with real measured benchmark numbers
* 282a6e7 test(benchmark): execute 20-alert ollama benchmark and record real evidence
* e0892ad chore(scripts): track playwright demo recording script outside ignored backup directory
* db73e3d chore(config): document all 22 environment settings with safe defaults and descriptions
* eb87090 feat(analyst): enforce json-grammar and strict grounding validation with deterministic fallback
* 8411fd5 test(e2e): update web console check for local bundled woff2 font verification
* 499b93e style: sort imports in screenshot capture suite
* cc100d2 docs: update submission index, video guide, bangla review and signoff gates
* d9176d1 test(e2e): capture multi-resolution before and after screenshots
* 25515a4 feat(web): integrate simplified layout and keyboard shortcuts in App
* 0c6c718 feat(web): implement simplified 2-column operator console components
* 689fdac feat(web): bundle local fonts and eliminate external CDN font egress
* 9e42f93 docs(claims): replace speaker note phrase with strict grounding in deck and pptx
```

---

## 6. How to Build, Run & Test the Project

### Prerequisites
- Python 3.11+ (Python 3.13 recommended)
- Node.js 18+ and npm
- Ollama (optional, for local neural LLM execution; offline deterministic engine runs with zero external tools)

### Step-by-Step Local Setup
```bash
# 1. Clone repository and enter directory
git clone https://github.com/rahat4528/prohori-ai.git
cd prohori-ai

# 2. Configure environment settings from template
copy .env.example .env    # On Windows
cp .env.example .env      # On Linux / macOS

# 3. Create and activate Python virtual environment
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # Linux / macOS

# 4. Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Install frontend dependencies and build assets
cd web
npm install
npm run build
cd ..

# 6. Launch complete stack (Windows launcher)
run_dev.bat
# Or via PowerShell script:
powershell -ExecutionPolicy Bypass -File scripts/run_all.ps1
```

---

## 7. Exact Commands to Reproduce All Tests

Open a PowerShell terminal from the project root with `.venv` active:

```powershell
# 1. Run full unit and integration test suite (38 tests)
.venv\Scripts\python -m pytest

# 2. Run comprehensive 15-point end-to-end architectural test
.venv\Scripts\python scripts/verify_e2e.py

# 3. Run all 19 REST and documentation API endpoint checks
.venv\Scripts\python scripts/test_all_endpoints.py

# 4. Run Python static linter
.venv\Scripts\python -m ruff check .

# 5. Run Web Console build and TypeScript check
cd web; npm run build; cd ..

# 6. Run dependency security audits
.venv\Scripts\python -m pip_audit
cd web; npm audit; cd ..

# 7. Execute live 5-stage attack campaign simulation
.venv\Scripts\python scripts/demo_replay.py
```

---

## 8. Test Results: Passed & Failed Breakdown

| Test Command / Check | Total Items | Passed | Failed | Skipped | Status |
|---|:---:|:---:|:---:|:---:|:---:|
| `pytest` | 43 | **43** | 0 | 0 | **PASS (100%)** |
| `scripts/verify_e2e.py` | 15 | **15** | 0 | 0 | **PASS (100%)** |
| `scripts/test_all_endpoints.py` | 19 | **19** | 0 | 0 | **PASS (100%)** |
| `ruff check .` | 102 files | **102** | 0 | 0 | **PASS (0 errors)** |
| `npm run build` | 2,068 modules | **2,068** | 0 | 0 | **PASS (Built in 396ms)** |
| `scripts/check_palette.py` | 19 source files | **19** | 0 | 0 | **PASS (100% 90/10 compliance)** |
| `scripts/check_runtime_palette.py` | 375 DOM elements | **375** | 0 | 0 | **PASS (100% runtime compliance)** |
| `pip-audit` | 42 packages | **42** | 0 | 0 | **PASS (0 vulnerabilities)** |
| `npm audit` | 134 packages | **134** | 0 | 0 | **PASS (0 vulnerabilities)** |
| `scripts/demo_replay.py` | 5 stages | **5** | 0 | 0 | **PASS (100%)** |

**Summary**: **Zero failing automated tests**. All 43 pytest items (including dedicated AI chatbot intent and validation suites), 15 end-to-end checks, 19 endpoint tests, and security audits passed.

---

## 9. Remaining Issues & Unfinished Work (Human Checklist)

All automated software engineering is complete. Exactly 4 human-only items remain, outlined in [`docs/START_HERE.md`](START_HERE.md) (~10 minutes total):

1. **Fill Official Team Roster (~2 min)**:
   - File: [`docs/TEAM.md`](TEAM.md)
   - Task: Replace `[FILL]` with the names, roles, and credentials of your 3 team members, and enter your allocated pitch duration.
2. **Native Bengali Speaker Sign-Off (~3 min)**:
   - File: [`docs/BANGLA_REVIEW.md`](BANGLA_REVIEW.md)
   - Task: Have a teammate who reads native Bangla inspect the 10 sample rows and complete the signature block at the bottom.
3. **Record 75-Second Backup Video (~3 min)**:
   - Guide: [`docs/BACKUP_VIDEO_GUIDE.md`](BACKUP_VIDEO_GUIDE.md)
   - Task: Use Windows Game Bar (`Win + Alt + R`) to record a clean screen capture of `http://localhost:3000` during `scripts/demo_replay.py` and save to `docs/backup/prohori_demo_backup.mp4`.
4. **Repository Visibility Decision (~2 min)**:
   - The repository is currently **PRIVATE**. If the hackathon requires public code submission, run:
     ```powershell
     gh repo edit rahat4528/prohori-ai --visibility public --yes
     ```
     Otherwise, invite judges as collaborators:
     ```powershell
     gh api -X PUT /repos/rahat4528/prohori-ai/collaborators/[JUDGE_USERNAME] -f permission=pull
     ```

### Final Verdict:
**NOT READY FOR HACKATHON**  
*(Pending human completion of the 4 checklist items above; software implementation is 100% complete and certified).*

