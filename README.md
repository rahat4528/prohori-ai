# Prohori AI ("প্রহরী") — Self-Hostable, AI-Native SOC

**Built by Team Orionids · International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**

[![Team](https://img.shields.io/badge/Team-Orionids-blueviolet.svg)](#team-orionids)
[![Live Console](https://img.shields.io/badge/Vercel-prohori--ai.vercel.app-14213D?logo=vercel&logoColor=F4EDE0)](https://prohori-ai.vercel.app)
[![Render Backend](https://img.shields.io/badge/Render-Blueprint%20exs--dbrh0kec6qcc73dstli0-46E3B7?logo=render&logoColor=14213D)](https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0)
[![Palette](https://img.shields.io/badge/Design%20System-Strict%2090%2F10%20Palette-FF6258)](#6-strict-9010-color-system--palette-enforcement)
[![Tests](https://img.shields.io/badge/pytest-43%20passed-brightgreen.svg)](#testing--verification)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![pgvector](https://img.shields.io/badge/PostgreSQL-pgvector-336791.svg)](https://github.com/pgvector/pgvector)
[![Data Sovereignty](https://img.shields.io/badge/Data%20Sovereignty-On--Prem-success.svg)](#data-sovereignty--local-llm-mode)

> **Prohori (প্রহরী = sentinel)** is engineered by **Team Orionids** as a self-hostable, bilingual (Bangla + English) AI SOC analyst built to protect institutions that cannot afford a dedicated 24/7 security operations center. 
> Three lightweight defensive sensors feed one unified event bus, where an **AI SOC Analyst core** autonomously triages, correlates, and explains threats in plain English and native Bengali (বাংলা).
> In default offline mode (Ollama / Llama 3.2 or deterministic offline RAG), all telemetry remains 100% on-premises, ensuring sensitive organizational security logs **never leave the local infrastructure**.

---

## 🚀 Hackathon Submission Index & Artifacts

All congress submission documents, pitch materials, and defense guides are indexed below:

| Document / Asset | Description | Direct Link |
|---|---|---|
| **How to Test Locally (Clean PC)** | **Step-by-step beginner guide to clone, run, and test on any clean computer** | [`docs/HOW_TO_TEST_LOCALLY.md`](docs/HOW_TO_TEST_LOCALLY.md) |
| **Start Here (10-Min Checklist)** | 4-step actionable checklist to finalize team names, review, video & submission | [`docs/START_HERE.md`](docs/START_HERE.md) |
| **Design System & 90/10 Palette** | Strict Navy/Cream/Coral color tokens, WCAG ratios & pixel share | [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) |
| **Project Summary & Master Report** | Complete summary of features, changes, hosting, test results & reproducibility | [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md) |
| **Deployment & Hosting Guide** | Complete cloud & on-prem deployment topology, live URLs, and database setup | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| **Submission Updates** | Complete audit of review items, before/after fixes, benchmark data & roadmap | [`docs/SUBMISSION_UPDATES.md`](docs/SUBMISSION_UPDATES.md) |
| **Judge Q&A Defense** | Grounded answers to the 8 toughest judge questions | [`docs/JUDGE_QA.md`](docs/JUDGE_QA.md) |
| **Pitch Deck (Markdown)** | Official 8-slide presentation deck with rehearsal timing & stage plan | [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md) |
| **Pitch Deck (PowerPoint)** | 16:9 widescreen dark-mode presentation file with embedded QR code | [`docs/Prohori_AI_Pitch_Deck.pptx`](docs/Prohori_AI_Pitch_Deck.pptx) |
| **Demo & Video Script** | 3-minute pitch script (90% AI core focus) + 75s backup recording protocol | [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md) |
| **LinkedIn & Social Draft** | Ready-to-publish post, community retrospectives, and media checklist | [`docs/LINKEDIN_POST.md`](docs/LINKEDIN_POST.md) |
| **Repository QR Code** | High-contrast QR code for instant mobile deck-to-repo access | [`docs/assets/repo_qr_code.png`](docs/assets/repo_qr_code.png) |

---

## 1. System Architecture

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
            └────────────────────┬────────────────────┘           │
                                 ▼                                 │
                     Postgres + pgvector Database                 │
                     (Events + ATT&CK / CVE / CWE Store)          │
                     (Auto SQLite fallback in local dev)          │
                                 │                                 │
            ┌────────────────────▼────────────────────┐           │
            │        AI SOC ANALYST (Core Engine)     │           │
            │   • Autonomous Triage Agent (Severity)  │           │
            │   • Correlation Agent (Kill Chain)      │           │
            │   • Grounded RAG (MITRE & CVE citations)│           │
            │   • Bilingual Narrator (English & বাংলা)│           │
            │   • Response Advisor (HITL Countermeasures)│        │
            │   • Local-LLM Mode (Data Sovereignty)   │           │
            └────────────────────┬────────────────────┘           │
                                 ▼                                 │
               WebSocket /stream │ HTTP REST                      │
                                 ▼                                 │
                   OPERATOR CONSOLE (React 19 + Vite)             │
                   • Simplified 2-column layout (5s comprehension)│
                   • Plain-language live threat alert feed        │
                   • Grounded intelligence panel (EN / বাংলা)     │
                   • Human-in-the-Loop "Approve Defense" action   │
                   • Inline "Ask AI Analyst" threat chat          │
                   • Append-only immutable audit trail            │
```

---

## 2. Key Capabilities & Technical Differentiation

1. **AI SOC Analyst Core (90% Value Focus)**:
   - Ingests raw telemetry, performs autonomous severity reconciliation, and generates natural-language incident narratives in **plain English and native Bengali (বাংলা)**.
   - Grounded in retrieved **MITRE ATT&CK** (`T1110.001`, `T1499.002`, `T1595.002`) and NIST NVD CVE records. Every claim shows its verified citation badges.
   - Measured steady-state triage latency:
     - **Deterministic Offline RAG**: **32.03 ms** median (cold start: 2,111.45 ms).
     - **Local Neural LLM (Ollama Llama 3.2 on CPU)**: **70.55 s** median (cold start: 77.28 s) across 20 distinct alerts with citation grounding (the validator verified 59 of 60 cited IDs; 1 unindexed sub-technique was removed before storage; see [`docs/evidence/llm_runs.md`](docs/evidence/llm_runs.md)).
     - Tested on local hardware (AMD Ryzen 7 PRO 4750U, 8 cores / 16 threads, 32 GB RAM, single run, unreviewed Bangla). Event ingestion is decoupled via immediate deterministic triage (~30–50 ms), allowing background neural LLM reasoning without blocking ingestion.

2. **National Data Sovereignty & Offline Operational Mode**:
   - **Default Sovereign Mode**: Operates 100% on-premises via local Ollama (`llama3.2`) or our Deterministic Offline RAG engine. Requires zero external API keys, zero cloud connectivity, and zero bytes leaving the local machine (`127.0.0.1:11434`).
   - **Real LLM Mode & Cloud Flexibility**: Generative reasoning runs locally by default via Ollama. Cloud acceleration can optionally be enabled by setting `GEMINI_API_KEY` or `GROQ_API_KEY` (cloud latency: not measured; requires user API key). When cloud mode is enabled, event text, after redaction, is sent to the chosen provider over HTTPS.

3. **Mandatory PII & Secret Scrubbing**:
   - Centralized redaction engine scrubs passwords, API keys, JWT tokens, Bearer tokens, and emails *before* data reaches any model or database. Note: secrets and personal data are redacted before prompting; prompt injection is not fully mitigated.

4. **Strict Defensive Safety & Sensor Isolation**:
   - **Simulated Deception Honeypot (Port 8081)**: Fully isolated trap; never executes arbitrary shell commands and touches no host files.
   - **API Abuse Guard (Port 8082)**: Progressive sliding-window rate limiter (warn &rarr; temp block &rarr; extended block) returning HTTP 429.
   - **Target Allowlist Guard (Port 8083)**: Enforced in code; strictly refuses port scans against non-allowlisted targets with HTTP 403.
   - **Opt-In API Authentication**: Configurable via `PROHORI_API_KEY`. Protects `POST /events`, `POST /audit/approve`, and `POST /sovereignty/toggle` with `X-API-Key` header; runs in open demo mode with a startup warning if unset.

5. **Human-in-the-Loop (HITL) & Append-Only Audit Log**:
   - Containment countermeasures require explicit operator review.
   - When an operator clicks "Approve Defense", the action adds the adversary IP to the live API Abuse Guard denylist, simulates perimeter firewall enforcement, and records the event in the append-only audit log database.

---

## 3. Deployment Architecture, Hosting Platforms & Live Services

Prohori AI supports three primary deployment configurations: **Local On-Premises Sovereign Deployment** (our primary, zero-cloud baseline), **Multi-Container Docker Deployment**, and **Cloud Distributed Hosting** via Render and Vercel. For an exhaustive operational breakdown, see the dedicated [**Deployment & Hosting Guide**](docs/DEPLOYMENT.md).

### 3.1 Master Services & Deployment Matrix

Every service, its runtime environment, port assignment, live endpoint, and health check are documented below. All services have been empirically verified and are active:

| Subsystem / Service | Tech Stack | Deployment Platform | Port / Protocol | Local / Live URL | Healthcheck / Status Endpoint | Operational Role |
|---|---|---|---|---|---|---|
| **Operator Console** | React 19, TypeScript, Vite, Tailwind | Local Host / Vercel | `3000` (HTTP) / HTTPS | [http://localhost:3000](http://localhost:3000) &bull; [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app) | Root DOM render (`HTTP 200`) | Simplified 2-column tactical SOC console for operator triage, HITL approvals, and bilingual reasoning. |
| **Event API & AI Core** | Python 3.13, FastAPI, Uvicorn, Pydantic | Local Host / Render | `8000` (HTTP/WS) | [http://127.0.0.1:8000](http://127.0.0.1:8000) | [http://127.0.0.1:8000/healthz](http://127.0.0.1:8000/healthz) | Core telemetry ingestion bus, secret scrubbing, fast deterministic triage, and incident correlation. |
| **Interactive API Docs** | Swagger UI (OpenAPI 3.1) | FastAPI built-in | `8000` (HTTP) | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive API sandbox for exploring and testing all 18 backend REST endpoints. |
| **ReDoc API Reference** | ReDoc | FastAPI built-in | `8000` (HTTP) | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Clean, printable technical reference documentation for the OpenAPI specification. |
| **Live Telemetry Stream** | Native WebSocket | FastAPI WebSocket | `8000` (WS) | `ws://127.0.0.1:8000/stream` | Connection handshake (`101 Switching Protocols`) | Real-time push stream broadcasting `new_event`, `event_enriched`, and `incident_updated` frames. |
| **Deception Honeypot** | Python, FastAPI, Decoy Engine | Local Host / Render | `8081` (HTTP) | [http://127.0.0.1:8081](http://127.0.0.1:8081) | [http://127.0.0.1:8081](http://127.0.0.1:8081) (`HTTP 200`) | Simulates vulnerable services; captures unauthorized recon probes (`/.env`) and login attacks (`/auth/login`). |
| **API Abuse Guard** | Python, FastAPI, httpx, Starlette | Local Host / Docker | `8082` (HTTP) | [http://127.0.0.1:8082](http://127.0.0.1:8082) | [http://127.0.0.1:8082/guard/status](http://127.0.0.1:8082/guard/status) | Defensive reverse proxy enforcing progressive token-bucket rate limits and automated IP containment blocks. |
| **Discovery Scanner** | Python, FastAPI, Socket, CIDR Guard | Local Host / Docker | `8083` (HTTP) | [http://127.0.0.1:8083](http://127.0.0.1:8083) | [http://127.0.0.1:8083/allowlist](http://127.0.0.1:8083/allowlist) | Scans internal networks for exposed CVEs; strictly enforces allowlisted subnets with HTTP 403 on violations. |
| **Local LLM Daemon** | Ollama, Llama 3.2 (3B) | Local Host (Native) | `11434` (HTTP) | [http://127.0.0.1:11434](http://127.0.0.1:11434) | [http://127.0.0.1:11434/api/tags](http://127.0.0.1:11434/api/tags) | Sovereign neural LLM execution. 100% on-premises; zero cloud network egress; keeps weights pinned via `keep_alive="60m"`. |
| **Database Storage** | SQLite (`prohori.db`) / PostgreSQL | Local / Cloud | `5432` / File | `sqlite+aiosqlite:///prohori.db` | Verified via `/healthz` (`db: connected`) | Persistent storage for events (256 rows), incidents (25 rows), audit logs (310 rows), and MITRE knowledge embeddings. |

---

### 3.2 Database Architecture & Storage Details

Prohori AI utilizes SQLAlchemy 2.0 with asynchronous drivers (`aiosqlite` and `asyncpg`) configured in [`api/app/database.py`](api/app/database.py):

1. **Default Local Engine (SQLite)**:
   - URI: `sqlite+aiosqlite:///prohori.db`
   - Zero-configuration, zero-dependency embedded database pre-seeded with 256 realistic security events, 25 multi-stage incidents, and 310 append-only audit entries.
2. **Enterprise Production Engine (PostgreSQL 16 + pgvector)**:
   - URI: `postgresql+asyncpg://postgres:postgres@localhost:5432/prohori`
   - Leverages native `pgvector` extension for vector similarity search over MITRE ATT&CK STIX documents and CVE embeddings.
3. **Automatic Fallback Mechanics**:
   - On server startup (`init_db()`), the API attempts to connect to the configured PostgreSQL instance.
   - If PostgreSQL is unreachable or connection is refused, the database subsystem **automatically falls back to local SQLite** (`prohori.db`) without throwing fatal runtime exceptions.
4. **Cloud PostgreSQL Options**:
   - Teammates can connect managed cloud PostgreSQL instances by setting `DATABASE_URL` in `.env`:
     - **Supabase**: `postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
     - **Neon Serverless Postgres**: `postgresql+asyncpg://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/prohori?sslmode=require`
     - **Render Managed PostgreSQL**: `postgresql+asyncpg://[USER]:[PASSWORD]@[HOST].render.com:5432/[DB]`
     - **Railway PostgreSQL**: `postgresql+asyncpg://postgres:[PASSWORD]@[HOST]:[PORT]/railway`

#### Core Database Tables & Schemas
- **`events`**: Ingested security telemetry, scrubbed payloads, AI severity triage, MITRE citations, and `llm_enriched` status flag.
- **`incidents`**: Correlated attack campaigns with lifecycle states (`ACTIVE`, `CONTAINED`, `RESOLVED`), IP correlation, and bilingual summaries.
- **`audit_logs`**: Append-only database audit trail recording every reasoning step, model choice, citation, and Human-in-the-Loop decision.
- **`knowledge_docs`**: Pre-seeded STIX 2.1 MITRE ATT&CK techniques (`T1110.001`, `T1499.002`, `T1595.002`) and NIST CVE records (`CVE-2023-38606`, `CVE-2023-44487`, `CVE-2023-46604`).

---

### 3.3 Deployment Models & Step-by-Step Instructions

#### Model A: Local On-Premises Sovereign Deployment (Recommended)
This is the verified, zero-cloud baseline used for hackathon evaluation and air-gapped security operations. For a complete beginner guide on a clean PC, see [`docs/HOW_TO_TEST_LOCALLY.md`](docs/HOW_TO_TEST_LOCALLY.md).

- **Windows One-Click Launcher**:
  ```cmd
  run_dev.bat
  ```
- **PowerShell Launcher**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/run_all.ps1
  ```
- **Manual Launch (Terminal by Terminal)**:
  ```bash
  # Terminal 1: Event API & AI Core
  .venv\Scripts\activate
  $env:PYTHONPATH="api;."
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

  # Terminal 2: Deception Honeypot Sensor
  python -m uvicorn sensors.deception.main:app --port 8081

  # Terminal 3: API Abuse Guard & Rate Limiter
  $env:PYTHONPATH="api;."
  $env:UPSTREAM_URL="http://127.0.0.1:8000"
  $env:EVENT_API_URL="http://127.0.0.1:8000"
  python -m uvicorn sensors.ratelimiter.main:app --port 8082

  # Terminal 4: React Operator Console
  cd web
  npm run dev
  ```

#### Model B: Multi-Container Docker Deployment (`infra/docker-compose.yml`)
The repository includes a production multi-container Docker specification orchestrating 6 isolated services:
```bash
# Start all microservices (DB with pgvector, API, Honeypot, Abuse Guard, Scanner, Web Console)
docker compose -f infra/docker-compose.yml up --build -d
```
- **Operator Console**: [http://localhost:3000](http://localhost:3000)
- **Event API & Interactive Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Deception Honeypot**: [http://localhost:8081](http://localhost:8081)
- **API Abuse Guard Proxy**: [http://localhost:8082](http://localhost:8082)
- **Asset Discovery Sensor**: [http://localhost:8083](http://localhost:8083)

#### Model C: Cloud Hosting & Distributed Architecture

1. **Backend API & Honeypot on Render (`render.yaml`)**:
   - **Hosting Platform**: **Render** (Cloud Application Platform, Linux Container, Python 3.13, Uvicorn ASGI).
   - **Infrastructure-as-Code Blueprint**: [`render.yaml`](render.yaml) automatically provisions `prohori-api` (Event API & AI Analyst) and `prohori-honeypot` (Deception Sensor) on Render Free Tier.
   - **Render Blueprint Instance ID**: `exs-dbrh0kec6qcc73dstli0`
   - **Render Blueprint Management Console**: [https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0](https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0)
   - **Local Sovereign URL**: `http://127.0.0.1:8000` (Health: `http://127.0.0.1:8000/healthz` — 100% verified locally).
   - **Backend API Endpoints (18 Verified Endpoints)**:
     - `GET /healthz` · Health check and database connection status (`HTTP 200`).
     - `POST /events` · Ingest raw sensor telemetry with automatic secret scrubbing and instant deterministic triage.
     - `GET /events` & `GET /events/{id}` · Query historical events with pagination, source, and severity filters.
     - `POST /analyst/triage/{id}` · On-demand autonomous AI triage and MITRE ATT&CK grounding.
     - `POST /analyst/ask` · Natural-language security Q&A (firewall commands, primary vector, attacker IP, insider assessment in EN/BN).
     - `POST /analyst/ask/stream` · SSE streaming delivering token-by-token reasoning in real time.
     - `GET /analyst/incidents` & `PATCH /analyst/incidents/{id}/status` · Correlated incident lifecycle management (`ACTIVE` &rarr; `CONTAINED` &rarr; `RESOLVED`).
     - `GET /knowledge/{doc_id}` & `GET /analyst/knowledge/{doc_id}` · STIX 2.1 MITRE & CVE knowledge grounding.
     - `POST /audit/approve` & `GET /audit/log` · Human-in-the-Loop containment enforcement and immutable append-only audit trail.
     - `GET /sovereignty/status` & `POST /sovereignty/toggle` · Data sovereignty mode toggle (`BANGLADESH_ON_PREM_ONLY` / `CLOUD_HYBRID`).
     - `WS /stream` · Duplex WebSocket push stream for live console event broadcasting.
     - `GET /docs` · Interactive Swagger UI documentation sandbox.
   - **Environment Variables**:
     - `PYTHONPATH`: `api:.`
     - `PORT`: `$PORT` (Render auto-injects 10000; maps to HTTPS 443)
     - `ENVIRONMENT`: `production` · `DEBUG`: `false`
     - `DATABASE_URL`: `sqlite+aiosqlite:///prohori.db` (or managed PostgreSQL `postgresql+asyncpg://...`)
     - `CORS_ORIGINS`: `["*"]` or `["https://prohori-ai.vercel.app"]`
     - `LLM_PROVIDER`: `auto` (falls back to deterministic offline RAG if no cloud keys)
     - `GEMINI_API_KEY` / `GROQ_API_KEY`: Optional secrets for cloud LLM acceleration.
     - `PROHORI_API_KEY`: Optional shared secret protecting write endpoints with `X-API-Key`.
   - **How Frontend Connects**:
     - Remote Vercel console (`https://prohori-ai.vercel.app`) communicates via `VITE_API_BASE` and `VITE_WS_URL`.
     - Built-in resilient client-side offline RAG engine (`web/src/utils/analystFallback.ts`) ensures the console provides instant cited answers even during cold starts or disconnected scenarios.
   - **How to Run, Test, and Redeploy**:
     - Run: `$env:PYTHONPATH="api;."; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
     - Test: `python -m pytest` (43 passed) · `python scripts/verify_e2e.py` (15/15 passed)
     - Redeploy: Push to `main` branch of `https://github.com/rahat4528/prohori-ai` triggers automatic zero-downtime rebuild via Blueprint `exs-dbrh0kec6qcc73dstli0`. Manual redeploy available in Render Blueprint console.

2. **React Operator Console on Vercel (`vercel.json` & `web/vercel.json`)**:
   - Configured with native Single-Page Application (SPA) rewrite rules routing `/(.*)` to `/index.html`.
   - To deploy: Import `https://github.com/rahat4528/prohori-ai` into [Vercel](https://vercel.com/new). Set Root Directory to `web`, Build Command to `npm run build`, and Output Directory to `dist`.
   - Set Environment Variables:
     - `VITE_API_BASE`: Set to your deployed Event API URL (e.g. `https://prohori-api.onrender.com`).
     - `VITE_WS_URL`: Set to your deployed WebSocket URL (e.g. `wss://prohori-api.onrender.com/stream`).
   - **Live Production URL**: [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app) (Verified & Deployed to Vercel Production).

3. **Cloud LLM Configuration (Google Gemini & Groq)**:
   - To enable cloud-augmented triage alongside default local sovereignty:
     ```bash
     # In .env or hosting environment variables:
     GEMINI_API_KEY=your_gemini_api_key_here
     GEMINI_MODEL=gemini-1.5-flash
     # Or Groq:
     GROQ_API_KEY=your_groq_api_key_here
     GROQ_MODEL=llama-3.3-70b-versatile
     ```
   - *When cloud API keys are present and Sovereignty Mode is toggled off, Prohori sends redacted telemetry over HTTPS. In offline sovereignty mode, it runs 100% locally with zero cloud egress.*

---

### 3.4 Teammate Onboarding & Collaboration Guide

For teammates collaborating on the project, follow these exact steps to ensure a synchronized environment:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rahat4528/prohori-ai.git
   cd prohori-ai
   git checkout ui-simplify
   ```
2. **Configure Environment**:
   ```bash
   # Windows:
   copy .env.example .env
   # Linux / macOS:
   cp .env.example .env
   ```
3. **Install Python Backend Dependencies**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate      # Windows (or source .venv/bin/activate on Linux/macOS)
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. **Install Web Console Dependencies & Build**:
   ```bash
   cd web
   npm install
   npm run build
   cd ..
   ```
5. **Verify the Installation**:
   ```bash
   # Run the 15-point architectural verification suite:
   python scripts/verify_e2e.py
   # Run the full test suite (38 tests):
   pytest
   ```
For complete technical details, see the dedicated [**Deployment & Hosting Guide**](docs/DEPLOYMENT.md).

---

## 4. Live Demonstration Scripts

We provide two automated scripts to demonstrate the end-to-end intelligence pipeline:

### 1. Bulletproof 60-Second Replay Sequence
```bash
python scripts/demo_replay.py
```
Pushes a staged 5-phase attack campaign:
`Recon Probe` &rarr; `Credential Stuffing` &rarr; `Brute Force Burst` &rarr; `API Abuse Block` &rarr; `CVE Match` &rarr; `Correlated Incident (INC-2026-0001)`.

### 2. Live Interactive Traffic Generator
```bash
python scripts/demo_traffic.py
```
Fires real HTTP attacks against your local honeypot and rate limiter, tripping decoy traps and generating HTTP 429 rate limit blocks.

---

## 5. Testing & Verification

Comprehensive test suites covering the Event API, Deception sensor, Rate Limiter, AI Analyst, Allowlist Guard, and Data Sovereignty mode:

```bash
pytest api/tests sensors/deception/tests sensors/ratelimiter/tests analyst/tests sensors/discovery/tests -v
```

**Results**: `38 passed in ~13.08s` (100% pass rate).

---

## 6. Strict 90/10 Color System & Palette Enforcement

Prohori AI implements a mathematically disciplined 90/10 color system designed for high-stress security environments:
- **Primary Dominant (~60%)**: Navy `#14213D` (RGB: `20, 33, 61`)
- **Secondary Dominant (~30%)**: Cream `#F4EDE0` (RGB: `244, 237, 224`)
- **Accent (~10%)**: Coral `#FF6258` (RGB: `255, 98, 88`)

Empirical pixel share: **96.71% dominant (Navy + Cream)**, **3.29% accent (Coral)**. Contrast ratios: Navy on Cream **13.72:1** (WCAG AAA), Navy on Coral **5.43:1** (WCAG AA). For complete details, see [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

### Automated Palette Enforcement Linters
Run both linters locally to guarantee zero unauthorized colors in source code or rendered DOM:

```bash
# 1. Static source linter (scans all TSX, CSS, HTML for hex and RGB violations)
.venv\Scripts\python scripts/check_palette.py

# 2. Runtime computed-style inspector (Playwright DOM evaluation across all 215+ elements)
.venv\Scripts\python scripts/check_runtime_palette.py

# 3. Measure rendered pixel share across resolutions
.venv\Scripts\python scripts/measure_pixel_share.py docs/screenshots/after_palette/dashboard_1920x1080_en.png
```

---

## 7. Commercial Model Hypothesis

> [!NOTE]
> Commercial pricing represents an **unvalidated business hypothesis** formulated for hackathon judging criteria, pending direct discovery with enterprise customers.

| Tier | Deployment | Target Users | Indicative Pricing |
|---|---|---|---|
| **Community Edition** | Self-hosted Docker / OSS | SMEs, Universities, Devs | **$0 / Free** (Open Source) |
| **Enterprise On-Prem** | Clustered On-Premises | Commercial Banks, RMG Exporters, Govt | **$1,200 / node / year** (Hypothesis) |
| **Managed SOC SaaS** | Multi-tenant Cloud | Distributed Startups, Remote Orgs | **$99 / month** (Hypothesis) |

---

## 7. Knowledge Base & Threat Feeds

- **Current Implementation**: Pre-seeded with curated MITRE ATT&CK STIX bundles, NIST CVEs, and CWE records via `knowledge/ingest.py`.
- **Roadmap**: Automated scheduled synchronization with the live NIST NVD API and MITRE TAXII 2.1 feeds.

---

## 8. Responsible AI & Defensive Scope

Prohori AI is engineered solely for defensive cybersecurity operations within authorized organizational networks. It strictly enforces:
1. Target allowlisting in code to prevent unauthorized scanning.
2. Simulated deception environments that never execute arbitrary shell commands.
3. Strict Human-in-the-Loop gating on all countermeasure actions.
4. Append-only audit logging for verifiable operational transparency.

---

## 9. Team Orionids

Prohori AI was built by **Team Orionids** (Undergraduate Engineers from the **Department of Computer Science & Engineering, Daffodil International University**) for the **International AI Builders Congress 2026** (Track: InfraSphere AI &rarr; SecureAI).

- **Team**: Team Orionids (Daffodil International University, CSE)
- **Official Single Source of Truth**: [`docs/TEAM.md`](docs/TEAM.md)
- **Roster**:
  - **Member 1**: `[FILL: name]` | `[FILL: role]` | `[FILL: credibility line]`
  - **Member 2**: `[FILL: name]` | `[FILL: role]` | `[FILL: credibility line]`
  - **Member 3**: `[FILL: name]` | `[FILL: role]` | `[FILL: credibility line]`
- **Vision**: Sovereign, explainable, and accessible cybersecurity defense for emerging digital economies.
- **Documentation**: See [`docs/TEAM.md`](docs/TEAM.md), [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md), and [`docs/SUBMISSION_UPDATES.md`](docs/SUBMISSION_UPDATES.md).

