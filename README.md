# Prohori AI ("প্রহরী") — Self-Hostable, AI-Native SOC

**Built by Team Orionids · International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**

[![Team](https://img.shields.io/badge/Team-Orionids-blueviolet.svg)](#team-orionids)
[![Tests](https://img.shields.io/badge/pytest-32%20passed-brightgreen.svg)](#testing--verification)
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
                   • Real-time color-coded event feed             │
                   • "Ask the Analyst" reasoning panel            │
                   • Attack campaign timeline                     │
                   • Human-in-the-Loop approval drawer            │
                   • Immutable audit log                          │
```

---

## 2. Key Capabilities & Technical Differentiation

1. **AI SOC Analyst Core (90% Value Focus)**:
   - Ingests raw telemetry, performs autonomous severity reconciliation, and generates natural-language incident narratives in **plain English and native Bengali (বাংলা)**.
   - Grounded in retrieved **MITRE ATT&CK** (`T1110.001`, `T1499.002`, `T1595.002`) and NIST NVD CVE records. Every claim shows its verified citation badges.
   - Measured steady-state triage latency: **~30.44 ms** (offline RAG) with a first-alert cold-start of 2,098 ms on local commodity hardware (AMD Ryzen 7 PRO 4750U, 32 GB RAM).

2. **National Data Sovereignty & Offline Operational Mode**:
   - **Default Out-of-the-Box Mode**: Operates 100% on-premises via our Deterministic Offline RAG engine (deterministic rule-guided triage + indexed STIX 2.1 knowledge retrieval; ~50 ms steady-state latency). Requires zero external API keys, zero internet, and no GPU hardware. Zero bytes leave the local host.
   - **Real LLM Mode**: Full generative reasoning can be enabled by setting `GEMINI_API_KEY` (Google Gemini), `GROQ_API_KEY` (Llama 3.3 70B on Groq), or running a local Ollama daemon (`ollama run llama3.2`). When cloud mode is enabled, event text, after redaction, is sent to the chosen provider over HTTPS.

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

## 3. Quickstart Guide

### Option A: Running with Docker Compose (Production / Full Stack)

```bash
# Clone and enter the repository
cd c:\diu

# Start all microservices (DB with pgvector, API, Honeypot, Abuse Guard, Scanner, Web Console)
docker compose -f infra/docker-compose.yml up --build
```
Once started:
- **Operator Console**: [http://localhost:3000](http://localhost:3000)
- **Event API & Interactive Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Deception Honeypot**: [http://localhost:8081](http://localhost:8081)
- **API Abuse Guard Proxy**: [http://localhost:8082](http://localhost:8082)
- **Asset Discovery Sensor**: [http://localhost:8083](http://localhost:8083)

---

### Option B: Running Locally (Fast Development Mode)

The API includes automatic fallback to local SQLite (`prohori.db`) if a PostgreSQL server is not running locally.

**One-Click Windows Launcher**:
```cmd
run_dev.bat
```
*Or via PowerShell script*:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_all.ps1
```

*Or manually in separate terminals*:
```bash
# 1. Activate Python virtual environment & start Event API
.venv\Scripts\activate
$env:PYTHONPATH="api;."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start the Deception Honeypot (second terminal)
python -m uvicorn sensors.deception.main:app --port 8081

# 3. Start the React Operator Console (third terminal)
cd web
npm run dev
```

---

### Option C: Frontend Deployment to Vercel

The operator console includes native Vercel deployment configuration (`web/vercel.json` and root `vercel.json`):

1. **Import Repository**: Connect `https://github.com/rahat4528/prohori-ai` to Vercel.
2. **Root Directory**: Set root to `web/` (or leave default root).
3. **Environment Variables**:
   - `VITE_API_BASE`: Set to your deployed Event API URL (e.g., `https://prohori-api.onrender.com`).
   - `VITE_WS_URL`: Set to your deployed WebSocket URL (e.g., `wss://prohori-api.onrender.com/stream`).
4. **Deploy**: Build command `npm run build` generates production assets with zero client-side routing issues.

---

### Cloud LLM Configuration (Google Gemini)

To enable cloud-augmented triage alongside default local sovereignty:
```bash
# In .env or shell environment
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
*When `GEMINI_API_KEY` is present, Prohori uses Gemini 1.5 Flash in cloud mode. In offline / sovereignty mode, it runs 100% locally with zero cloud egress.*

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

**Results**: `32 passed in ~4.39s` (100% pass rate).

---

## 6. Commercial Model Hypothesis

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
- **Vision**: Sovereign, explainable, and accessible cybersecurity defense for emerging digital economies.
- **Documentation**: See [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md) and [`docs/SUBMISSION_UPDATES.md`](docs/SUBMISSION_UPDATES.md) for full team rosters and presentation guides.

