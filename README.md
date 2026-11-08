# Prohori AI ("প্রহরী") — Self-Hostable, AI-Native SOC

**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**

[![Tests](https://img.shields.io/badge/pytest-32%20passed-brightgreen.svg)](#testing--verification)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![pgvector](https://img.shields.io/badge/PostgreSQL-pgvector-336791.svg)](https://github.com/pgvector/pgvector)
[![Data Sovereignty](https://img.shields.io/badge/Data%20Sovereignty-On--Prem-success.svg)](#data-sovereignty--local-llm-mode)

> **Prohori (প্রহরী = sentinel)** is a self-hostable, AI-native Security Operations Center. 
> Four defensive sensors feed one unified event bus, where an **AI SOC Analyst core** autonomously triages, correlates, and explains threats in plain language (**English and Bengali / বাংলা**), grounded in an offline RAG knowledge base of MITRE ATT&CK&reg; and CVE intelligence. 
> Everything runs on-premises with local models (Ollama / Llama 3.2), ensuring sensitive security logs **never leave the country**.

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
                                 │                                 │
            ┌────────────────────▼────────────────────┐           │
            │        AI SOC ANALYST (Core Engine)     │           │
            │   • Autonomous Triage Agent (Severity)  │           │
            │   • Correlation Agent (Kill Chain)      │           │
            │   • RAG over MITRE ATT&CK, CVE, & CWE   │           │
            │   • Bilingual Narrator (English & বাংলা)│           │
            │   • Response Advisor (HITL Countermeasures)│        │
            │   • Local-LLM Mode (Data Sovereignty)   │           │
            └────────────────────┬────────────────────┘           │
                                 ▼                                 │
               WebSocket /stream │ HTTP REST                      │
                                 ▼                                 │
                   OPERATOR CONSOLE (React + Vite)                │
                   • Real-time color-coded event feed             │
                   • "Ask the Analyst" reasoning panel            │
                   • Attack campaign timeline                     │
                   • Human-in-the-Loop approval drawer            │
                   • Immutable audit log                          │
```

---

## 2. Key Capabilities & Technical Differentiation

1. **AI SOC Analyst (Not a Surface Dashboard)**:
   - Evaluates incoming raw events, performs autonomous severity reconciliation, and generates natural-language incident narratives in **English and native Bengali (বাংলা)**.
   - Grounded under **MITRE ATT&CK** (`T1110.001`, `T1499.002`, `T1595.002`) and NIST NVD CVEs. Every claim is cited; zero hallucination.

2. **Data Sovereignty & Offline Operational Mode**:
   - Supports **Ollama (Llama 3.2 / Qwen)** and a deterministic offline RAG engine.
   - Built-in data sovereignty switch blocks cloud egress, guaranteeing that sensitive telemetry never leaves the organization.

3. **Mandatory PII & Secret Scrubbing**:
   - Centralized redaction engine scrubs passwords, API keys, JWT tokens, Bearer tokens, and emails *before* data reaches any model.

4. **Strict Defensive Safety & Isolation**:
   - **Simulated Deception Honeypot**: Fully isolated; never executes commands or touches host filesystems.
   - **API Abuse Guard**: Progressive sliding-window rate limiter (warn &rarr; temp block &rarr; extended block) returning HTTP 429.
   - **Target Allowlist Guard**: Enforced in code; strictly refuses port scans against non-allowlisted targets with HTTP 403.

5. **Human-in-the-Loop (HITL) & Immutable Audit Trail**:
   - Countermeasures require operator approval. Every action is permanently recorded in an append-only audit database.

---

## 3. Quickstart Guide

### Option A: Running with Docker Compose (Recommended)

```bash
# Clone and enter the repository
cd c:\diu

# Start all microservices (DB with pgvector, API, Honeypot, Abuse Guard, Scanner, Web Console)
docker compose -f infra/docker-compose.yml up --build
```
Once started:
- **Operator Console**: [http://localhost:3000](http://localhost:3000)
- **Event API & Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Simulated Deception Honeypot**: [http://localhost:8081](http://localhost:8081)
- **API Abuse Guard Proxy**: [http://localhost:8082](http://localhost:8082)
- **Asset Discovery Sensor**: [http://localhost:8083](http://localhost:8083)

---

### Option B: Running Locally (Fast Development Mode)

```bash
# 1. Activate Python virtual environment
.venv\Scripts\activate

# 2. Start the Event API
$env:PYTHONPATH="api;."
uvicorn app.main:app --port 8000 --reload

# 3. Start the Deception Honeypot (in second terminal)
uvicorn sensors.deception.main:app --port 8081

# 4. Start the React Operator Console (in third terminal)
cd web
npm run dev
```

---

## 4. Live Demonstration Scripts

We provide two automated scripts to demonstrate the end-to-end intelligence pipeline:

### 1. Bulletproof 60-Second Replay Sequence
```bash
python scripts/demo_replay.py
```
Pushes a staged 5-phase attack campaign:
`Recon Probe` &rarr; `Credential Stuffing` &rarr; `Brute Force Burst` &rarr; `API Abuse Block` &rarr; `CVE Match` &rarr; `Correlated Incident`.

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

**Results**: `32 passed in ~6.5s` (100% pass rate).

---

## 6. Free-Tier Service Matrix

| Service | Role | Cost | Why Chosen |
|---|---|---|---|
| **Python / FastAPI** | Event bus & async WebSocket | \$0.00 (Open Source) | Recommended by Congress guidelines |
| **PostgreSQL + pgvector** | Events & RAG embeddings | \$0.00 (Free Tier / Local) | Single service for relational + vectors |
| **React 19 + Vite** | High-density SOC console | \$0.00 (Open Source) | Modern, high performance, projector-ready |
| **Ollama / Llama 3.2** | Data sovereignty LLM | \$0.00 (Local / Offline) | Zero data leaves the machine |
| **Google Gemini / Groq** | Cloud LLM alternative | \$0.00 (Free Tier APIs) | High-speed response generation |
| **MITRE ATT&CK & NVD** | Threat knowledge base | \$0.00 (Public Domain) | Verified, grounded threat data |

---

## 7. Documentation Index

- [System Architecture](docs/ARCHITECTURE.md)
- [Data Lineage & Knowledge Base Specification](docs/DATA_LINEAGE.md)
- [Security & Defensive Scope Enforcement](docs/SECURITY.md)
- [Pitch Deck (8-Slide Congress Rubric)](docs/PITCH_DECK.md)
- [3-Minute Pitch Script & Backup Shot List](docs/DEMO_VIDEO_SCRIPT.md)

---

## 8. Responsible AI & Ethical Scope Statement

Prohori AI is engineered solely for defensive cybersecurity operations within authorized university lab and enterprise networks. It strictly enforces:
1. Target allowlisting to prevent unauthorized scanning.
2. Simulated deception environments that never execute arbitrary shell commands.
3. Strict Human-in-the-Loop gating on all countermeasure actions.
4. Cryptographic, append-only audit logging for verifiable operational transparency.

