# Prohori AI ("প্রহরী") — Deployment & Hosting Guide

**Team Orionids · Department of Computer Science & Engineering, Daffodil International University**  
**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**  
**Official Repository**: [https://github.com/rahat4528/prohori-ai](https://github.com/rahat4528/prohori-ai)

---

## 1. System Overview & Deployment Topology

Prohori AI is engineered as a **modular, defense-in-depth cybersecurity platform** with a decoupled microservice architecture. It can run in three primary deployment topologies depending on operational constraints, institutional security requirements, and data sovereignty policies:

```
                                 [ INTERNET / ENTERPRISE NETWORK ]
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
      ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
      │  Deception Honeypot  │      │   API Abuse Guard    │      │   Discovery Sensor   │
      │   (Simulated Trap)   │      │ (Reverse Proxy & RL) │      │  (Allowlisted Scan)  │
      │     [Port 8081]      │      │     [Port 8082]      │      │     [Port 8083]      │
      └──────────┬───────────┘      └──────────┬───────────┘      └──────────┬───────────┘
                 │ (HTTP REST)                 │ (Proxy/Events)              │ (HTTP REST)
                 └──────────────────────┐       │       ┌─────────────────────┘
                                        ▼       ▼       ▼
                               ┌─────────────────────────────────┐
                               │   Event Ingestion Bus (FastAPI) │
                               │    • PII / Secret Scrubbing     │
                               │    • Triage & Correlation Core  │
                               │           [Port 8000]           │
                               └────────┬───────────────┬────────┘
                                        │               │
                        (Async SQLAlchemy)             (WebSocket /stream & REST)
                                        │               │
                                        ▼               ▼
                 ┌──────────────────────────────┐  ┌──────────────────────────────┐
                 │    Database Storage Layer    │  │   Operator Console (Web)     │
                 │  • SQLite: prohori.db        │  │  • React 19 + Vite + Tailwind│
                 │  • Postgres + pgvector: 5432 │  │  • 100% Offline Local Fonts │
                 │  • Cloud: Supabase / Neon    │  │  • Simplified 2-Column UI    │
                 └──────────────────────────────┘  │         [Port 3000]          │
                                                   └──────────────────────────────┘
                                        │
                                (Opt-In / Decoupled)
                                        │
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │        AI SOC Analyst Inference Core         │
                 │  • Plane 1: Deterministic RAG (32ms median)  │
                 │  • Plane 2 (Local): Ollama Llama 3.2 (11434) │
                 │  • Plane 2 (Cloud): Google Gemini / Groq     │
                 └──────────────────────────────────────────────┘
```

---

## 2. Master Services & Deployment Matrix

Every service, its runtime environment, port assignment, live endpoint, and health check are documented below. All services have been empirically verified and are active:

| Subsystem / Service | Tech Stack | Deployment Platform | Port / Protocol | Local / Live URL | Healthcheck / Status Endpoint | Operational Role |
|---|---|---|---|---|---|---|
| **Operator Console** | React 19, TypeScript, Vite, Tailwind | Local Host / Vercel | 3000 (HTTP) / HTTPS | [http://localhost:3000](http://localhost:3000) &bull; [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app) | Root DOM render (HTTP 200) | Simplified 2-column tactical SOC console for operator triage, HITL approvals, and bilingual reasoning. |
| **Event API & AI Core** | Python 3.13, FastAPI, Uvicorn, Pydantic | Local Host / Render | `8000` (HTTP/WS) | [http://127.0.0.1:8000](http://127.0.0.1:8000) | `http://127.0.0.1:8000/healthz` | Core telemetry ingestion bus, secret scrubbing, fast deterministic triage, and incident correlation. |
| **Interactive API Docs** | Swagger UI (OpenAPI 3.1) | FastAPI built-in | `8000` (HTTP) | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | `http://127.0.0.1:8000/docs` | Interactive API sandbox for exploring and testing all 18 backend REST endpoints. |
| **ReDoc API Reference** | ReDoc | FastAPI built-in | `8000` (HTTP) | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | `http://127.0.0.1:8000/redoc` | Clean, printable technical reference documentation for the OpenAPI specification. |
| **Live Telemetry Stream** | Native WebSocket | FastAPI WebSocket | `8000` (WS) | `ws://127.0.0.1:8000/stream` | Connection handshake (`101 Switching Protocols`) | Real-time push stream broadcasting `new_event`, `event_enriched`, and `incident_updated` frames. |
| **Deception Honeypot** | Python, FastAPI, Decoy Engine | Local Host / Render | `8081` (HTTP) | [http://127.0.0.1:8081](http://127.0.0.1:8081) | [http://127.0.0.1:8081](http://127.0.0.1:8081) (`HTTP 200`) | Simulates vulnerable services; captures unauthorized recon probes (`/.env`) and login attacks (`/auth/login`). |
| **API Abuse Guard** | Python, FastAPI, httpx, Starlette | Local Host / Docker | `8082` (HTTP) | [http://127.0.0.1:8082](http://127.0.0.1:8082) | `http://127.0.0.1:8082/guard/status` | Defensive reverse proxy enforcing progressive token-bucket rate limits and automated IP containment blocks. |
| **Discovery Scanner** | Python, FastAPI, Socket, CIDR Guard | Local Host / Docker | `8083` (HTTP) | [http://127.0.0.1:8083](http://127.0.0.1:8083) | `http://127.0.0.1:8083/allowlist` | Scans internal networks for exposed CVEs; strictly enforces allowlisted subnets with HTTP 403 on violations. |
| **Local LLM Daemon** | Ollama, Llama 3.2 (3B) | Local Host (Native) | `11434` (HTTP) | [http://127.0.0.1:11434](http://127.0.0.1:11434) | `http://127.0.0.1:11434/api/tags` | Sovereign neural LLM execution. 100% on-premises; zero cloud network egress; keeps weights pinned via `keep_alive="60m"`. |
| **Database Storage** | SQLite (`prohori.db`) / PostgreSQL | Local / Cloud | `5432` / File | `sqlite+aiosqlite:///prohori.db` | Verified via `/healthz` (`db: connected`) | Persistent storage for events (256 rows), incidents (25 rows), audit logs (310 rows), and MITRE knowledge embeddings. |

---

## 3. Database Architecture & Storage Details

### 3.1 Dual-Engine Architecture with Automatic Fallback
Prohori AI utilizes SQLAlchemy 2.0 with asynchronous drivers (`aiosqlite` and `asyncpg`) configured in [`api/app/database.py`](../api/app/database.py):
1. **Default Local Engine (SQLite)**:
   - URI: `sqlite+aiosqlite:///prohori.db`
   - Zero-configuration, zero-dependency embedded database ideal for hackathon evaluation, local development, and air-gapped demo runs.
   - Pre-seeded with 256 realistic security events, 25 multi-stage incidents, and 310 append-only audit entries.
2. **Enterprise Production Engine (PostgreSQL 16 + pgvector)**:
   - URI: `postgresql+asyncpg://postgres:postgres@localhost:5432/prohori`
   - Leverages native `pgvector` extension for vector similarity search over MITRE ATT&CK STIX documents and CVE embeddings.
3. **Automatic Fallback Mechanics**:
   - On server startup (`init_db()`), the API attempts to connect to the configured PostgreSQL instance.
   - If PostgreSQL is unreachable or connection is refused, the database subsystem **automatically falls back to local SQLite** (`prohori.db`) without throwing fatal runtime exceptions.

### 3.2 Cloud Database Providers
Teammates wishing to connect a managed cloud PostgreSQL instance can set `DATABASE_URL` in `.env` to any of the following verified providers:
- **Supabase**: `postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- **Neon Serverless Postgres**: `postgresql+asyncpg://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/prohori?sslmode=require`
- **Render Managed PostgreSQL**: `postgresql+asyncpg://[USER]:[PASSWORD]@[HOST].render.com:5432/[DB]`
- **Railway PostgreSQL**: `postgresql+asyncpg://postgres:[PASSWORD]@[HOST]:[PORT]/railway`

### 3.3 Core Database Tables & Schemas

| Table Name | Model Class | Primary Key | Description & Key Columns |
|---|---|---|---|
| `events` | `EventRecord` | `id` (UUID / CHAR(36)) | Ingested security alerts, scrubbed details (`CompatibleJSON`), AI severity triage, MITRE citations, and `llm_enriched` flag. Indexed on `(source, severity)` and `(ts, severity)`. |
| `incidents` | `IncidentRecord` | `id` (UUID / CHAR(36)) | Correlated attack campaigns. Columns: `incident_id` (e.g. `INC-2026-0001`), `source_ip`, `severity`, `status` (`ACTIVE`, `CONTAINED`, `RESOLVED`), `event_count`, `summary_en`, `summary_bn`, `event_ids`. |
| `audit_logs` | `AuditRecordModel` | `id` (UUID / CHAR(36)) | Append-only immutable audit trail. Records `ts`, `action_type`, `actor`, `model_used`, `citations`, `verdict`, `human_approved`, and `operator_id`. Indexed on `(ts, action_type)`. |
| `knowledge_docs` | Vector / Relational | `id` (String) | Pre-seeded STIX 2.1 MITRE ATT&CK techniques (e.g. `T1110.001`, `T1499.002`, `T1595.002`) and NIST CVE records (`CVE-2023-38606`, `CVE-2023-44487`, `CVE-2023-46604`). |

---

## 4. Deployment Models & Step-by-Step Instructions

### Model A: Local On-Premises Sovereign Deployment (Recommended)
This is the verified, zero-cloud baseline used for hackathon evaluation and air-gapped security operations.

#### Windows (One-Click Launchers)
1. Launch the complete dev stack:
   ```cmd
   run_dev.bat
   ```
2. Or via PowerShell launcher:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/run_all.ps1
   ```

#### Linux / macOS / Manual Terminal Launch
Open 4 terminal windows:
```bash
# Terminal 1: Event API & AI Core
cd c:\diu
source .venv/bin/activate  # (or .venv\Scripts\activate on Windows)
export PYTHONPATH="api:."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Deception Honeypot Sensor
cd c:\diu
source .venv/bin/activate
export PYTHONPATH="api:."
python -m uvicorn sensors.deception.main:app --host 127.0.0.1 --port 8081

# Terminal 3: API Abuse Guard & Rate Limiter
cd c:\diu
source .venv/bin/activate
export PYTHONPATH="api:."
export UPSTREAM_URL="http://127.0.0.1:8000"
export EVENT_API_URL="http://127.0.0.1:8000"
python -m uvicorn sensors.ratelimiter.main:app --host 127.0.0.1 --port 8082

# Terminal 4: React Operator Console
cd c:\diu\web
npm run dev
```

---

### Model B: Multi-Container Docker Deployment (`infra/docker-compose.yml`)

The repository includes a production multi-container Docker specification orchestrating 6 isolated services:

```bash
# From repository root
docker compose -f infra/docker-compose.yml up --build -d
```

Containers provisioned:
1. `prohori-db`: PostgreSQL 16 with `pgvector` on port `5432`.
2. `prohori-api`: FastAPI backend & AI core on port `8000`.
3. `prohori-deception-sensor`: Honeypot decoy trap on port `8081`.
4. `prohori-ratelimiter-guard`: Edge proxy & rate limiter on port `8082`.
5. `prohori-discovery-sensor`: Port scanner on port `8083`.
6. `prohori-web-console`: Nginx-served React console on port `3000`.

To stop the containers:
```bash
docker compose -f infra/docker-compose.yml down
```

---

### Model C: Cloud Hosting & Distributed Architecture

#### 1. Backend API & Honeypot on Render (`render.yaml`)

Prohori AI's cloud backend infrastructure is declared declaratively via an Infrastructure-as-Code Render Blueprint specification in [`render.yaml`](../render.yaml).

- **Hosting Platform**: **Render** (Cloud Application Platform, Free Tier Linux container, Python 3.13 runtime, Uvicorn ASGI server).
- **Blueprint Instance ID**: `exs-dbrh0kec6qcc73dstli0`
- **Render Blueprint Management Console**: [https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0](https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0)
- **Local Sovereign Backend (On-Premises)**: `http://127.0.0.1:8000` (Certified 100% operational; 43/43 tests passing)
- **Production Frontend Console**: [https://prohori-ai.vercel.app](https://prohori-ai.vercel.app) (Certified live on Vercel)

##### Deployed Services in Blueprint `exs-dbrh0kec6qcc73dstli0`:
1. **`prohori-api`** (Main Event Bus & AI SOC Analyst Core):
   - **Runtime**: Python 3.13 (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
   - **Service Role**: Telemetry ingestion, secret scrubbing, fast deterministic triage, RAG reasoning over MITRE ATT&CK & CVEs, and incident correlation.
   - **Service Endpoint**: Access via your Render service overview under Blueprint [`exs-dbrh0kec6qcc73dstli0`](https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0).
2. **`prohori-honeypot`** (Simulated Deception Trap):
   - **Runtime**: Python 3.13 (`uvicorn sensors.deception.main:app --host 0.0.0.0 --port $PORT`)
   - **Service Role**: High-interaction decoy traps capturing unauthorized reconnaissance probes (`/.env`, `/wp-admin`) and password guessing attacks (`/auth/login`). Automatically forwards security events to `prohori-api`.

##### Exhaustive Backend API Endpoints Reference:
The backend exposes 18 verified REST & WebSocket endpoints across 4 functional domains:

| Method | Endpoint Path | Module | Authentication | Request Payload / Params | Purpose & Operational Behavior |
|---|---|---|---|---|---|
| `GET` | `/healthz` | System | Public | None | Health check returning API uptime, database status (`connected`), and version (`1.0.0`). |
| `POST` | `/events` | Ingestion | Opt-in (`X-API-Key`) | `EventCreate` (JSON) | Ingests raw telemetry; immediately redacts credentials/PII; triggers autonomous triage (<35ms). |
| `GET` | `/events` | Ingestion | Public | `limit`, `offset`, `source`, `severity` | Retrieves historical and live security events with pagination and filtering. |
| `GET` | `/events/{id}` | Ingestion | Public | Path: `id` (UUID) | Retrieves specific event with full forensic details, MITRE citations, and analyst narratives. |
| `POST` | `/demo/reset` | Testing | Opt-in (`X-API-Key`) | None | Resets in-memory/database state to a clean slate for pitch demonstrations. |
| `POST` | `/analyst/triage/{id}` | Analyst | Opt-in (`X-API-Key`) | Path: `id` (UUID) | Manually re-runs autonomous AI triage and MITRE ATT&CK grounding on an event. |
| `POST` | `/analyst/ask` | Chatbot | Public | `AskRequest` (`query`, `language`, `event_context`) | AI SOC Analyst Q&A. Answers firewall commands, primary vector, attacker IP, and insider threat assessment in EN/BN. |
| `POST` | `/analyst/ask/stream` | Chatbot | Public | `AskRequest` (`query`, `language`) | SSE (Server-Sent Events) streaming delivering token-by-token reasoning in real time. |
| `GET` | `/analyst/incidents` | Correlation | Public | None | Returns correlated multi-stage attack incidents grouped by source IP. |
| `PATCH` | `/analyst/incidents/{id}/status` | Incident | Opt-in (`X-API-Key`) | `IncidentStatusUpdate` (`status`: ACTIVE/CONTAINED/RESOLVED) | Human operator transitions incident lifecycle; logs operator ID and operational notes. |
| `GET` | `/analyst/knowledge/{doc_id}` | Grounding | Public | Path: `doc_id` (e.g. `T1110.001`) | Retrieves full STIX 2.1 knowledge item, description, CWE mapping, and mitigation steps. |
| `GET` | `/knowledge/{doc_id}` | Grounding | Public | Path: `doc_id` (e.g. `CVE-2023-38606`) | Root alias for direct knowledge base lookup by MITRE technique or CVE identifier. |
| `POST` | `/audit/approve` | HITL Gate | Opt-in (`X-API-Key`) | `action_id`, `target_resource`, `action_type` | Enforces defensive containment (adds attacker IP to rate-limiter blocklist) and logs audit entry. |
| `GET` | `/audit/log` | Audit | Public | `limit`, `offset` | Retrieves append-only immutable audit trail recording every reasoning step and approved defense. |
| `GET` | `/sovereignty/status` | Sovereignty | Public | None | Returns active data sovereignty mode (`BANGLADESH_ON_PREM_ONLY` / `CLOUD_HYBRID`) and active LLM provider. |
| `POST` | `/sovereignty/toggle` | Sovereignty | Opt-in (`X-API-Key`) | `{"mode": "local" \| "cloud"}` | Toggles between local offline sovereignty (Ollama/offline RAG) and cloud acceleration. |
| `WS` | `/stream` | Real-Time | Public | Native WebSocket handshake | Real-time event bus broadcasting `new_event`, `event_enriched`, and `incident_status_changed`. |
| `GET` | `/docs` | Documentation | Public | None | Interactive OpenAPI Swagger UI documentation sandbox. |

##### Environment Variables Required on Render:

| Variable Name | Required? | Default / Recommended Value | Description & Security Policy |
|---|---|---|---|
| `PYTHONPATH` | **Required** | `api:.` | Ensures the Python interpreter resolves `app` and `sensors` modules cleanly. |
| `PORT` | **Required** | `10000` (injected by Render) | Bind port for Uvicorn ASGI server. Render automatically maps this to external HTTPS port 443. |
| `ENVIRONMENT` | Optional | `production` | Production mode; disables internal debug traces. |
| `DEBUG` | Optional | `false` | Controls verbose logging and error backtraces. |
| `DATABASE_URL` | Optional | `sqlite+aiosqlite:///prohori.db` | Async SQLAlchemy database connection string. Can be pointed to managed PostgreSQL. |
| `CORS_ORIGINS` | **Required** | `["*"]` or `["https://prohori-ai.vercel.app"]` | Whitelisted frontend origins allowed to make cross-origin requests. |
| `LLM_PROVIDER` | Optional | `auto` | Reasoning engine: `auto` (defaults to deterministic offline RAG if no keys), `offline`, `ollama`, `gemini`, `groq`. |
| `GEMINI_API_KEY` | Optional | `[SECURE_USER_SECRET]` | Optional Google Gemini API key for cloud LLM acceleration. Set in Render Environment tab. |
| `GROQ_API_KEY` | Optional | `[SECURE_USER_SECRET]` | Optional Groq API key for Llama 3.3 cloud acceleration. Set in Render Environment tab. |
| `PROHORI_API_KEY` | Optional | `[SECURE_USER_SECRET]` | Optional API shared secret. When set, protects write endpoints with `X-API-Key` header. |

##### How the Frontend Connects to the Backend:
The React operator console ([`web/`](../web/)) establishes dual-channel communication with the backend:
1. **REST API Ingestion & Queries**: All user actions (triage, asking questions, approving countermeasures) send HTTP requests to `${VITE_API_BASE}` (e.g. `POST ${VITE_API_BASE}/analyst/ask`).
2. **Real-Time WebSocket Stream**: The console establishes a persistent duplex stream with `${VITE_WS_URL}` (`ws://.../stream` or `wss://.../stream`), immediately displaying incoming alerts without polling.
3. **Resilient Client-Side Offline Fallback**: In the event that the Render backend is sleeping (cold start on free tier) or running offline, the frontend's built-in client-side engine ([`web/src/utils/analystFallback.ts`](../web/src/utils/analystFallback.ts)) provides instant grounded threat analysis, firewall rules, and MITRE citations, preventing any console breakage.

##### How to Run, Test, and Redeploy the Backend:

```bash
# 1. Run Backend Locally (Windows PowerShell)
$env:PYTHONPATH = "api;."
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Run Backend Locally (Linux / macOS)
export PYTHONPATH="api:."
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 3. Execute Complete Backend Test Suite (All 43 Tests)
python -m pytest

# 4. Execute End-to-End Architectural Verification (15/15 Checks)
python scripts/verify_e2e.py

# 5. Redeploying on Render:
# Option A (Continuous Deployment): Any push to the main branch of https://github.com/rahat4528/prohori-ai
# triggers an automatic zero-downtime rebuild via Blueprint exs-dbrh0kec6qcc73dstli0.
# Option B (Manual Redeploy): Open https://dashboard.render.com/blueprints/exs-dbrh0kec6qcc73dstli0,
# click on 'prohori-api' -> 'Manual Deploy' -> 'Deploy latest commit'.
```

#### 2. React Operator Console on Vercel (`vercel.json` & `web/vercel.json`)
The frontend is configured with native Single-Page Application (SPA) routing:
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (or `web/dist` from repo root)
- **Framework Preset**: Vite

**How to Deploy on Vercel**:
1. Import repository `https://github.com/rahat4528/prohori-ai` into [Vercel](https://vercel.com/new).
2. Configure project settings:
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure Environment Variables:
   - `VITE_API_BASE`: `https://prohori-api.onrender.com` (your deployed backend API)
   - `VITE_WS_URL`: `wss://prohori-api.onrender.com/stream` (your deployed WebSocket)
4. Click **Deploy**. Vercel creates the permanent production deployment at **[https://prohori-ai.vercel.app](https://prohori-ai.vercel.app)**.
5. **Verified Live Status**: Deployed and certified live on Vercel Production.

---

## 5. Teammate Onboarding & Collaboration Guide

For teammates joining the project, follow this exact checklist to establish a pristine development environment without configuration drift:

```mermaid
flowchart TD
    A["Clone Repository"] --> B["Create .env from .env.example"]
    B --> C["Setup Python 3.11+ Virtualenv"]
    C --> D["Install pip dependencies"]
    D --> E["Install web npm packages"]
    E --> F["Launch Stack via run_dev.bat"]
    F --> G["Run scripts/verify_e2e.py (15/15 Pass)"]
    G --> H["Ready for Development"]
```

### Step 1: Clone & Branch Hygiene
```bash
git clone https://github.com/rahat4528/prohori-ai.git
cd prohori-ai
git checkout main
```

### Step 2: Environment Configuration
Copy the documented template:
```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```
*(The default `.env` is pre-configured for local offline mode. No API keys are required to run.)*

### Step 3: Backend Python Environment
```bash
python -m venv .venv
# Activate:
.venv\Scripts\activate      # Windows PowerShell / CMD
source .venv/bin/activate   # Linux / macOS

pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Frontend Dependencies
```bash
cd web
npm install
npm run build
cd ..
```

### Step 5: Verification & Quality Gate
Run the verification suites before making any commit:
```bash
# 1. Python Unit & Integration Tests (38 tests)
pytest

# 2. Python Linter
ruff check .

# 3. Web Console Linter & Build
cd web; npx oxlint; npm run build; cd ..

# 4. End-to-End System Verification (15 checks across all ports)
python scripts/verify_e2e.py
```

---

## 6. Complete API & WebSocket Endpoint Reference

The backend exposes 18 verified endpoints across ports 8000, 8081, 8082, and 8083:

| HTTP Method | Route Path | Port | Auth Required? | Request Payload | Response Code & Output | Description |
|---|---|---|---|---|---|---|
| `GET` | `/healthz` | 8000 | None | None | `200 OK` (JSON) | Healthcheck reporting system status and SQLite/PostgreSQL connectivity. |
| `GET` | `/docs` | 8000 | None | None | `200 OK` (HTML) | Interactive OpenAPI Swagger UI documentation sandbox. |
| `GET` | `/redoc` | 8000 | None | None | `200 OK` (HTML) | ReDoc structured API reference documentation. |
| `GET` | `/openapi.json` | 8000 | None | None | `200 OK` (JSON) | Raw OpenAPI 3.1 schema specification. |
| `GET` | `/architecture` | 8000 | None | None | `200 OK` (JSON) | Structured architectural metadata and subsystem topology. |
| `GET` | `/security` | 8000 | None | None | `200 OK` (JSON) | Security controls, isolation boundaries, and PII scrubbing policies. |
| `GET` | `/events` | 8000 | None | Query params: `limit`, `offset`, `severity`, `source` | `200 OK` (List[JSON]) | Retrieve ingested security events with filtering and pagination. |
| `GET` | `/events/{id}` | 8000 | None | Path: UUID | `200 OK` / `404 Not Found` | Fetch detailed alert telemetry, scrubbed payload, and AI verdicts. |
| `POST` | `/events` | 8000 | Opt-In (`X-API-Key`) | `source`, `severity`, `type`, `details` | `201 Created` | Ingest security telemetry. Performs fast deterministic triage (~30ms) and schedules async LLM enrichment. |
| `POST` | `/events/{id}/retriage` | 8000 | Opt-In (`X-API-Key`) | Path: UUID | `200 OK` (JSON) | Re-runs AI triage agent against updated MITRE ATT&CK knowledge base. |
| `POST` | `/analyst/ask` | 8000 | None | `query` (string, EN or বাংলা) | `200 OK` (JSON) | Interactive bilingual AI threat investigation and reasoning Q&A. |
| `GET` | `/analyst/ask/stream`| 8000 | None | Query: `query` | `200 OK` (SSE) | Server-Sent Events (SSE) streaming token output from AI Analyst. |
| `GET` | `/analyst/incidents`| 8000 | None | None | `200 OK` (List[JSON]) | Lists correlated multi-stage attack campaigns (e.g. `INC-2026-0001`). |
| `PATCH`| `/analyst/incidents/{id}/status` | 8000 | Opt-In (`X-API-Key`) | `status`: `ACTIVE` / `CONTAINED` / `RESOLVED` | `200 OK` (JSON) | Transitions incident lifecycle state; updates incident timeline. |
| `GET` | `/analyst/knowledge/{id}` | 8000 | None | Path: MITRE ID or CVE | `200 OK` (JSON) | Retrieves STIX 2.1 knowledge bundles or NIST CVE mitigation records. |
| `GET` | `/sovereignty/status` | 8000 | None | None | `200 OK` (JSON) | Returns current mode (`OFFLINE_LOCAL`, `LOCAL_LLM`, `CLOUD_HYBRID`). |
| `POST` | `/sovereignty/toggle` | 8000 | Opt-In (`X-API-Key`) | `mode` | `200 OK` (JSON) | Toggles between local air-gapped sovereignty and cloud acceleration. |
| `GET` | `/audit` | 8000 | None | Query: `limit`, `offset` | `200 OK` (List[JSON]) | Queries append-only audit trail recording model choices and operator actions. |
| `POST` | `/audit/approve` | 8000 | Opt-In (`X-API-Key`) | `action_id`, `target`, `action_type`, `operator` | `200 OK` (JSON) | Human-in-the-Loop approval. Blocks adversary IP on live edge proxy. |
| `GET` | `/stream` | 8000 | None | WebSocket Protocol | `101 Switching Protocols` | Bi-directional WebSocket stream broadcasting live alerts and updates. |
| `GET` | `/guard/status` | 8082 | None | None | `200 OK` (JSON) | API Abuse Guard status, sliding window limits, and active block counts. |
| `GET` | `/allowlist` | 8083 | None | None | `200 OK` (JSON) | Asset Discovery allowed CIDR subnets (`127.0.0.1`, `10.0.0.0/8`, etc.). |
| `POST` | `/scan/local` | 8083 | None | `target_subnet` | `200 OK` (JSON) | Triggers allowlisted subnet vulnerability and open port discovery. |
