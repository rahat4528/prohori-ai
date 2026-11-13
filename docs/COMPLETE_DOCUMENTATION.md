# Prohori AI ("প্রহরী") — Complete Project & Engineering Manual

**Team Orionids · Department of Computer Science & Engineering, Daffodil International University**  
**International AI Builders Congress 2026 · Track: InfraSphere AI &rarr; SecureAI**  
**GitHub Repository**: [https://github.com/rahat4528/prohori-ai](https://github.com/rahat4528/prohori-ai)  
**Live Production Console**: [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app)  
**Render Cloud Blueprint**: [https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0](https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0)  

---

## Table of Contents
1. [Step-by-Step Project Details & Architecture](#1-step-by-step-project-details--architecture)
2. [Complete Implementation History & Development Log](#2-complete-implementation-history--development-log)
3. [Setup Instructions (Local & Clean PC)](#3-setup-instructions-local--clean-pc)
4. [Testing Procedures & Verification Suites](#4-testing-procedures--verification-suites)
5. [Deployment Information (Render, Vercel & Docker)](#5-deployment-information-render-vercel--docker)

---

## 1. Step-by-Step Project Details & Architecture

### 1.1 What is Prohori AI?
**Prohori (প্রহরী = sentinel / guardian)** is an autonomous, self-hostable, bilingual (Bangla + English) AI Security Operations Center (SOC) analyst engineered specifically for institutions that cannot afford a dedicated 24/7 security engineering staff or multi-tenant commercial cloud SIEMs.

It combines:
1. **Three Lightweight Defensive Sensors** running in lab environments to capture real-time attack traffic.
2. **Central Event Ingestion Bus (FastAPI on Port 8000)** with mandatory PII and credential scrubbing.
3. **Dual-Plane Reasoning Core**: Sub-50ms deterministic RAG triage + background deep neural LLM reasoning (Ollama Llama 3.2 on CPU, or cloud Gemini/Groq).
4. **MITRE ATT&CK & CVE Grounding**: STIX 2.1 techniques (`T1110.001`, `T1499.002`, `T1595.002`) and NIST CVE records (`CVE-2023-38606`, `CVE-2023-44487`, `CVE-2023-46604`).
5. **Human-in-the-Loop (HITL) Containment Gate**: AI recommends actions; humans approve before firewall rules are enacted.
6. **Append-Only Immutable Audit Log**: Forensic tamper-evident record of all AI reasoning, citations, and operator approvals.
7. **Strict 90/10 Design System**: Navy `#14213D` (60%), Cream `#F4EDE0` (30%), Coral `#FF6258` (10%) with 13.7:1 WCAG AAA contrast and zero external font egress.
8. **Native Bilingual Bengali (বাংলা) & English Parity**: All verdicts, technical analyses, and mitigations natively rendered in both languages.

### 1.2 Multi-Port Defensive Sensor Topology

```
                  ┌──────────────── DEFENSIVE LAB SENSORS ────────────────┐
                  │                                                       │
           Asset Discovery       Deception Sensor       API Abuse Guard   │
           (allowlisted scan)    (simulated honeypot)   (rate limiter)    │
           [Port 8083]           [Port 8081]            [Port 8082]       │
                  │                     │                      │          │
                  └──────────┬──────────┴───────────┬──────────┘          │
                             ▼                      ▼                     │
                    ┌─────────────────────────────────────────┐           │
                    │       EVENT INGESTION BUS (FastAPI)     │ ◄── abuse │
                    │       • Strict unified event schema     │     guard │
                    │       • PII & Credential scrubbing      │           │
                    │       • Deduplication & rate control    │           │
                    └────────────────────┬────────────────────┘           │
                                         ▼                                 │
                             Postgres + pgvector Database                 │
                             (Events + ATT&CK / CVE Store)                │
                             (Auto SQLite fallback in dev)                │
                                         │                                 │
                    ┌────────────────────▼────────────────────┐           │
                    │        AI SOC ANALYST (Core Engine)     │           │
                    │   • Dual-Engine: RAG (<50ms) + Neural   │           │
                    │   • Correlation Agent (Kill Chain)      │           │
                    │   • Grounded RAG (MITRE ATT&CK / CVE)   │           │
                    │   • Bilingual Narrator (English & বাংলা)│           │
                    │   • Threat Chatbot (Firewall Gen)       │           │
                    │   • Human-in-the-Loop Countermeasures   │           │
                    │   • 100% On-Premises Data Sovereignty   │           │
                    └────────────────────┬────────────────────┘           │
                                         ▼                                 │
                       WebSocket /stream │ HTTP REST                      │
                                         ▼                                 │
                           OPERATOR CONSOLE (React 19 + Vite)             │
                           • Strict 90/10 Palette (Navy/Cream/Coral)      │
                           • 2-column layout (5-second comprehension)     │
                           • Live alert stream with severity badges       │
                           • Grounded intelligence panel (EN / বাংলা)     │
                           • Interactive Threat Chatbot with chips        │
                           • One-click HITL "Approve Defense" action      │
                           • Append-only immutable audit trail drawer     │
```

- **Port 8000 — Event API & AI SOC Core (`api/app/main.py`)**: Central ingest bus, database connector, WebSocket stream (`/stream`), and Swagger UI (`/docs`).
- **Port 8081 — Deception Honeypot Sensor (`sensors/deception/main.py`)**: Simulated decoy trap exposing vulnerable paths (`/.env`, `/auth/login`). Captures unauthorized recon and credential stuffing without touching host files.
- **Port 8082 — API Abuse Guard (`sensors/ratelimiter/main.py`)**: Defensive reverse proxy enforcing a progressive sliding-window token bucket (warn &rarr; temp block &rarr; extended block) returning HTTP 429.
- **Port 8083 — Asset Discovery Sensor (`sensors/discovery/main.py`)**: Network reconnaissance sensor that checks local CIDRs for exposed vulnerabilities, strictly enforcing allowlists with HTTP 403.
- **Port 3000 — Operator Console (`web/src/App.tsx`)**: React 19 + Vite dashboard with 2-column tactical layout, instant EN/BN language toggle, and live threat feed.

---

## 2. Complete Implementation History & Development Log

### Phase 1: Foundation & Defensive Sensor Microservices
- Designed decoupled sensor topology across ports 8000, 8081, 8082, and 8083.
- Implemented asynchronous database layer supporting PostgreSQL 16 (`pgvector`) with automatic zero-configuration fallback to embedded SQLite (`prohori.db`).
- Built central PII & credential scrubbing engine redacting passwords, API keys, JWT tokens, Bearer tokens, and emails prior to storage or prompting.

### Phase 2: AI Intelligence Core & Grounded RAG Reasoning
- Curated STIX 2.1 knowledge base bundling MITRE ATT&CK enterprise techniques (`T1110.001`, `T1499.002`, `T1595.002`) and NIST CVE records.
- Implemented Dual-Plane Reasoning:
  - **Plane 1 (Deterministic Offline RAG)**: Sub-50ms rule-based classification over STIX documents.
  - **Plane 2 (Local Neural LLM)**: Ollama Llama 3.2 on CPU (`127.0.0.1:11434`) with `keep_alive="60m"` weight pinning.
- Built correlation engine aggregating events into attack campaigns (`incidents` table) and response advisor generating HITL containment actions.

### Phase 3: Benchmarking, Bottleneck Decoupling & Grounding Validation
- **Bottleneck Identified**: Running 3B neural model synchronously in `POST /events` caused 70–110s latency per alert on standard CPU.
- **Solution**: Decoupled ingestion pipeline. Immediate deterministic triage runs in **~32ms** (returning HTTP 201 Created and broadcasting `new_event`), while neural reasoning runs in a background task (`asyncio.create_task`) and emits `event_enriched`.
- **Hallucination Prevention**: Implemented post-generation citation validator in `analyst/agents/triage.py` that verifies every cited ID against the STIX knowledge base, discarding unindexed references.

### Phase 4: Frontend Redesign & Strict 90/10 Palette Enforcement
- Simplified operator console to a clean 2-column layout designed for **5-second comprehension**.
- Bundled offline local WOFF2 fonts (`Hind Siliguri`, `JetBrains Mono`, `Plus Jakarta Sans`) into `web/public/fonts/`, removing all external CDN font requests for true air-gap compliance.
- Applied mathematically strict 90/10 color system:
  - **Navy `#14213D`** (Primary Dominant)
  - **Cream `#F4EDE0`** (Secondary Dominant)
  - **Coral `#FF6258`** (10% Accent for CTAs and active states)
- Built automated static (`check_palette.py`) and Playwright runtime (`check_runtime_palette.py`) color linters to guarantee 100% compliance.

### Phase 5: AI SOC Threat Chatbot Fix & Intent Parsing
- **Problem**: Chatbot returned identical canned responses regardless of operator queries due to prompt contamination and missing intent parsing.
- **Fix**: Added `event_context` schema to `AskRequest`, removed hardcoded prompt triggers, and implemented dynamic intent parsing in `analyst/providers/offline.py`:
  - **Firewall Intent**: Generates exact `iptables -A INPUT -s <IP> -j DROP` and `nft add rule ...` rules.
  - **Primary Vector Intent**: Explains MITRE technique, entry vector, and impact.
  - **Insider vs External**: Inspects IP against RFC 1918 private subnets.
- Added client-side offline RAG engine in `web/src/utils/analystFallback.ts` ensuring the web console operates flawlessly even if the backend is offline.

### Phase 6: Cloud Deployment & Render Blueprint Hardening
- Authored declarative Infrastructure-as-Code blueprint [`render.yaml`](../render.yaml) (ID: `exs-dbrh0kec6qcc73dstli0`).
- Diagnosed and fixed initial Render build issues:
  - Added `GET /` discovery endpoint in `api/app/main.py` for default health checks.
  - Added explicit `healthCheckPath: /healthz` in `render.yaml`.
  - Pinned Python runtime to 3.13.1 via `.python-version`.
  - Explicitly invoked start command via `python -m uvicorn`.

### Phase 7: Local Reproduction & All-in-One Automation
- Created automated Windows all-in-one launcher [`start_all.bat`](../start_all.bat) and [`scripts/run_all.ps1`](../scripts/run_all.ps1).
- Handled Windows PowerShell `ExecutionPolicy` restrictions, ensuring clean execution on any Windows machine.
- Authored step-by-step local testing guide [`docs/HOW_TO_TEST_LOCALLY.md`](HOW_TO_TEST_LOCALLY.md).

---

## 3. Setup Instructions (Local & Clean PC)

### 3.1 Prerequisites Check
Ensure these free tools are installed:
1. **Git**: [https://git-scm.com/](https://git-scm.com/) (`git --version`)
2. **Python 3.11+**: [https://www.python.org/](https://www.python.org/) *(Check "Add python.exe to PATH" during install)*
3. **Node.js 18+**: [https://nodejs.org/](https://nodejs.org/) (`node --version` and `npm --version`)

### 3.2 Step 1: Clone or Pull the Repository
```powershell
# If cloning for the first time:
git clone https://github.com/rahat4528/prohori-ai.git
cd prohori-ai

# If you already cloned it before, make sure to pull the latest changes:
cd prohori-ai
git pull origin main
```

> ⚠️ **CRITICAL RULE**: Always make sure your terminal is inside the `prohori-ai` directory (`C:\Users\YourName\prohori-ai>`), not your user home folder!

---

### 3.3 Step 2: Choose Your Launch Method

#### ⚡ Method A: Automated One-Click Launcher (Windows — Easiest)
Simply double-click `start_all.bat` in File Explorer, or run in terminal:
```cmd
.\start_all.bat
```
- Automatically creates `.venv` and installs dependencies (`pip install -r requirements.txt`).
- Automatically copies `.env.example` to `.env`.
- Automatically installs frontend packages (`npm install` inside `web`).
- Spawns all 4 services in dedicated terminal windows.
- Opens your browser to `http://localhost:3000` automatically!

---

#### ⚡ Method B: Automated PowerShell Launcher (Windows)
In PowerShell inside the `prohori-ai` folder:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_all.ps1
```

---

#### 🛠️ Method C: Manual Startup (Terminal by Terminal)

If you prefer running each service manually, open 4 separate terminals:

> **Important Windows PowerShell Fix**: If you see `.venv\Scripts\Activate.ps1 cannot be loaded because running scripts is disabled on this system`, run this once:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

##### One-time dependency setup (Terminal 1):
```powershell
cd prohori-ai
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
cd web
npm install
cd ..
```

##### Launching the 4 microservices:
- **Terminal 1: Event API & AI SOC Core (Port 8000)**
  ```powershell
  cd prohori-ai
  .\.venv\Scripts\Activate.ps1
  $env:PYTHONPATH="api;."
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```

- **Terminal 2: Deception Honeypot Sensor (Port 8081)**
  ```powershell
  cd prohori-ai
  .\.venv\Scripts\Activate.ps1
  $env:PYTHONPATH="api;."
  python -m uvicorn sensors.deception.main:app --host 127.0.0.1 --port 8081 --reload
  ```

- **Terminal 3: API Abuse Guard Rate Limiter (Port 8082)**
  ```powershell
  cd prohori-ai
  .\.venv\Scripts\Activate.ps1
  $env:PYTHONPATH="api;."
  $env:UPSTREAM_URL="http://127.0.0.1:8000"
  $env:EVENT_API_URL="http://127.0.0.1:8000"
  python -m uvicorn sensors.ratelimiter.main:app --host 127.0.0.1 --port 8082 --reload
  ```

- **Terminal 4: React Operator Console (Port 3000)**
  ```powershell
  cd prohori-ai\web
  npm run dev
  ```

---

## 4. Testing Procedures & Verification Suites

### 4.1 Automated Test Execution

```bash
# 1. Run full Pytest suite (43 passed):
pytest api/tests sensors/deception/tests sensors/ratelimiter/tests analyst/tests sensors/discovery/tests -v

# 2. Run 15-Point End-to-End Architectural Verification:
python scripts/verify_e2e.py

# 3. Run Static Palette Compliance Linter:
python scripts/check_palette.py

# 4. Run Frontend TypeScript Compilation & Production Build:
cd web && npm run build
```

**Verified Test Results**:
```
api/tests/test_api.py ...........                                         [ 25%]
sensors/deception/tests/test_deception.py .....                          [ 37%]
sensors/ratelimiter/tests/test_ratelimiter.py ......                      [ 51%]
analyst/tests/test_analyst.py ..............                              [ 83%]
sensors/discovery/tests/test_discovery.py .......                         [100%]

43 passed in 7.64s (100% pass rate)
```

### 4.2 Interactive Attack Simulation Scripts

1. **Deterministic 60-Second Replay**:
   ```bash
   python scripts/demo_replay.py
   ```
   Simulates a 5-phase intrusion: Recon Probe &rarr; Credential Stuffing &rarr; Brute Force Burst &rarr; API Abuse Block &rarr; CVE Match &rarr; Correlated Incident (`INC-2026-0001`).

2. **Live HTTP Attack Traffic Generator**:
   ```bash
   python scripts/demo_traffic.py
   ```
   Fires real HTTP requests against your local honeypot (8081) and rate limiter (8082), tripping decoy traps and generating HTTP 429 blocks.

---

## 5. Deployment Information (Render, Vercel & Docker)

### 5.1 Render Blueprint Deployment (`render.yaml`)
- **Blueprint Instance ID**: `exs-dbrh0kec6qcc73dstli0`
- **Dashboard URL**: [https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0](https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0)
- **Services Deployed**:
  1. `prohori-api`: FastAPI backend and AI SOC core.
  2. `prohori-honeypot`: Deception sensor bound to `prohori-api`.
- **Environment Variables**:
  - `PYTHONPATH`: `api:.`
  - `PORT`: `10000` (mapped to HTTPS 443)
  - `DATABASE_URL`: `sqlite+aiosqlite:///prohori.db` (or managed PostgreSQL `postgresql+asyncpg://...`)
  - `CORS_ORIGINS`: `["*"]` or `["https://prohori-ai.vercel.app"]`
  - `LLM_PROVIDER`: `auto`

### 5.2 Vercel Production Frontend Deployment
- **Live URL**: [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app)
- **Framework**: Vite + React 19 + TypeScript
- **Routing**: Single-Page Application rewrites (`/(.*)` &rarr; `/index.html`) configured in `vercel.json` and `web/vercel.json`.
- **Offline Resilience**: Built-in client-side offline RAG engine (`web/src/utils/analystFallback.ts`) ensures instant threat analysis, MITRE citations, and firewall rule generation even during backend cold starts.

### 5.3 Docker Compose Production Specification (`infra/docker-compose.yml`)
```bash
docker compose -f infra/docker-compose.yml up --build -d
```
Orchestrates 6 isolated containers:
- `db`: PostgreSQL 16 with `pgvector`
- `api`: Event Ingestion Bus and AI Core (`http://localhost:8000`)
- `honeypot`: Deception Sensor (`http://localhost:8081`)
- `ratelimiter`: API Abuse Guard (`http://localhost:8082`)
- `scanner`: Asset Discovery Sensor (`http://localhost:8083`)
- `web`: Operator Console (`http://localhost:3000`)

### 5.4 Master API Endpoints Matrix (18 Endpoints)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API discovery and platform version metadata |
| `GET` | `/healthz` | System health check and database connection status (`HTTP 200`) |
| `POST` | `/events` | Ingest raw sensor telemetry with secret scrubbing and instant triage |
| `GET` | `/events` | Query historical security events with pagination and filters |
| `GET` | `/events/{id}` | Retrieve full forensic event details |
| `POST` | `/analyst/triage/{id}` | On-demand autonomous AI triage and MITRE ATT&CK technique mapping |
| `POST` | `/analyst/ask` | Natural-language security Q&A with firewall command generation |
| `POST` | `/analyst/ask/stream` | Real-time Server-Sent Events (SSE) streaming reasoning tokens |
| `GET` | `/analyst/incidents` | Query correlated attack campaigns and lifecycle states |
| `PATCH`| `/analyst/incidents/{id}/status` | Update incident lifecycle (`ACTIVE` &rarr; `CONTAINED` &rarr; `RESOLVED`) |
| `GET` | `/knowledge/{doc_id}` | Retrieve STIX 2.1 MITRE technique or NIST CVE vulnerability card |
| `GET` | `/analyst/knowledge/{doc_id}` | Contextual knowledge retrieval for operator research |
| `POST` | `/audit/approve` | Human-in-the-Loop containment approval and active firewall blocking |
| `GET` | `/audit` | Inspect immutable append-only audit trail entries |
| `GET` | `/sovereignty/status` | Query current data sovereignty mode (`BANGLADESH_ON_PREM_ONLY`) |
| `POST` | `/sovereignty/toggle` | Toggle sovereignty mode between on-premises and cloud-hybrid |
| `POST` | `/demo/reset` | Clean demo state and reseed standard forensic attack telemetry |
| `WS` | `/stream` | Duplex WebSocket stream broadcasting real-time security events |
