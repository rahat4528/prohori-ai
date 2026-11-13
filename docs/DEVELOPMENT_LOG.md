# Prohori AI ("প্রহরী") — Comprehensive Step-by-Step Development Log

**Team Orionids · Department of Computer Science & Engineering, Daffodil International University**  
**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**  
**Repository**: [https://github.com/rahat4528/prohori-ai](https://github.com/rahat4528/prohori-ai)

---

## Executive Summary

This document provides a complete, transparent, and reproducible engineering record of every step taken to build, optimize, harden, and deploy **Prohori AI ("প্রহরী")**. It details every architectural decision, bug discovery, performance optimization, and file modification across all 7 development phases.

---

## Phase 1: Foundation & Defensive Sensor Microservices

### 1.1 Architectural Vision
The primary design requirement for Prohori AI was to create a **self-hostable, bilingual (Bangla + English) AI SOC Analyst** tailored for institutions (hospitals, universities, local banks) that cannot afford a 24/7 dedicated security operations center or cloud egress.

### 1.2 Multi-Port Sensor Topology
To simulate a real-world enterprise attack surface without endangering production infrastructure, four decoupled microservices were created:
1. **Central Event Ingestion Bus (`api/app/main.py` on Port `8000`)**:
   - Built on FastAPI and Uvicorn for asynchronous I/O.
   - Declares strict Pydantic models for incoming telemetry (`source`, `severity`, `type`, `details`).
   - Integrated PII & Credential Scrubbing: All incoming passwords, JWT tokens, Bearer tokens, and email addresses are sanitized using regex replacements (`[REDACTED_CREDENTIAL]`, `[REDACTED_EMAIL]`) before persistence.
2. **Deception Honeypot Sensor (`sensors/deception/main.py` on Port `8081`)**:
   - Emulates vulnerable enterprise surfaces: diagnostic paths (`/.env`, `/.git`, `/wp-admin`) and authentication forms (`/api/v1/auth/login`).
   - Traps recon probes and credential spray attacks without executing shell commands or touching host files.
3. **API Abuse Guard & Rate Limiter (`sensors/ratelimiter/main.py` on Port `8082`)**:
   - Defensive reverse proxy enforcing a progressive token-bucket algorithm (warn &rarr; temp block &rarr; extended block).
   - Intercepts excessive request bursts, returns HTTP 429, and pushes containment events to the Event Bus.
4. **Asset Discovery & Vulnerability Scanner (`sensors/discovery/main.py` on Port `8083`)**:
   - Scans internal CIDR ranges for exposed ports.
   - Enforces an in-code allowlist: strictly returns `HTTP 403 Forbidden` if a scan targets non-allowlisted IPs.

### 1.3 Database Storage with Automatic Fallback
- Configured in [`api/app/database.py`](../api/app/database.py) using SQLAlchemy 2.0 with asynchronous drivers (`aiosqlite` and `asyncpg`).
- **Production Engine**: PostgreSQL 16 with `pgvector` for STIX 2.1 vector embeddings.
- **Resilient Fallback**: If PostgreSQL is unavailable on startup, the engine automatically catches connection exceptions and falls back to local embedded SQLite (`prohori.db`), ensuring zero downtime during air-gapped demo runs.

---

## Phase 2: AI Intelligence Core & Grounded RAG Reasoning

### 2.1 Knowledge Base Curation (`knowledge/retriever.py`)
- Curated STIX 2.1 knowledge base bundling MITRE ATT&CK enterprise techniques:
  - `T1110.001`: Password Guessing (Credential Access)
  - `T1499.002`: Service Exhaustion Flood (Impact / DoS)
  - `T1595.002`: Vulnerability Scanning (Reconnaissance)
  - `T1078`: Valid Accounts (Defense Evasion / Initial Access)
- Coupled with NIST NVD CVE records (`CVE-2023-38606`, `CVE-2023-44487`, `CVE-2023-46604`) and CWE definitions (`CWE-307`, `CWE-400`, `CWE-200`).

### 2.2 Dual-Plane Reasoning Engine
1. **Plane 1 — Deterministic Offline RAG Engine (`analyst/providers/offline.py`)**:
   - Executes rule-based classification and semantic mapping over retrieved MITRE/CVE records.
   - Verified steady-state latency: **32.03 ms median**.
   - Generates cited bilingual narratives in English and native Bengali (বাংলা).
2. **Plane 2 — Local Neural LLM via Ollama (`analyst/providers/ollama.py`)**:
   - Interfaces with local `llama3.2` (3B parameters) via HTTP on `127.0.0.1:11434`.
   - Guaranteed 100% data sovereignty: zero cloud telemetry egress.
   - Supports optional cloud acceleration via Google Gemini (`gemini-1.5-flash`) or Groq (`llama-3.3-70b-versatile`).

### 2.3 Incident Correlation & Human-in-the-Loop Countermeasures
- **Correlation Agent (`analyst/agents/correlation.py`)**: Correlates disparate sensor events sharing a common IP within a sliding time window, constructing multi-stage kill-chain campaigns.
- **Response Advisor (`analyst/agents/advisor.py`)**: Synthesizes defensive mitigation actions. Every action requires human approval (`requires_human_approval=True`).
- **HITL Approval Gate (`api/app/routes/audit.py`)**: Clicking "Approve Defense" adds the adversary IP to the rate limiter denylist and commits an immutable entry into the `audit_logs` table.

---

## Phase 3: Benchmarking, Bottleneck Decoupling & Grounding Validation

### 3.1 The Ingestion Latency Bottleneck Discovery
During live load testing on CPU hardware (AMD Ryzen 7 PRO 4750U), running the 3B neural model synchronously inside `POST /events` caused the endpoint to take **70 to 110 seconds** per alert. This blocked the HTTP client and froze live demonstrations.

### 3.2 The Asynchronous Decoupling Solution
- Modified `api/app/main.py`:
  - Split event handling into a two-stage pipeline.
  - **Stage 1 (Immediate)**: When an event arrives, immediate deterministic triage is executed in **~32ms**. The event is saved to the database with `analyst` metadata and broadcasted over `WS /stream` as `new_event`. The endpoint immediately returns `HTTP 201 Created`.
  - **Stage 2 (Background Asynchronous Upgrade)**: If a neural model is active, a background `asyncio.create_task` runs the heavier LLM analysis and broadcasts an `event_enriched` frame when complete.

### 3.3 Hallucination Stripping & Grounding Validation
During benchmark runs on 20 distinct alerts, the 3B model occasionally hallucinated citations (e.g., inventing sub-technique `T1490.001`).
- Implemented strict post-generation grounding validator in `analyst/agents/triage.py`: Every citation in the model output is validated against the known STIX document IDs in `kb_retriever.documents`. Any unindexed citation is discarded before saving.

---

## Phase 4: Frontend Redesign & Strict 90/10 Palette Enforcement

### 4.1 UI Simplification (2-Column Layout)
- Redesigned the operator console in React 19 + TypeScript + Vite from a complex 3-column layout into an intuitive 2-column layout designed for **5-second comprehension**:
  - **Left Column**: Live threat feed with plain-language titles, timestamps, and severity tags.
  - **Right Column**: Comprehensive selected threat intelligence panel showing What Happened, Technical Impact, Verified Citations, and the Human-in-the-Loop "Approve Defense" action.

### 4.2 Local Font Bundling (Air-Gapped Compliance)
- Removed external Google Fonts links (`fonts.googleapis.com`) from `web/index.html`.
- Downloaded and bundled local WOFF2 files into `web/public/fonts/` for `Hind Siliguri`, `JetBrains Mono`, and `Plus Jakarta Sans`.
- Result: 100% offline typography rendering with zero network requests.

### 4.3 Strict 90/10 Color Palette Enforcement
- **Approved Palette**:
  - Primary (Dominant): **Navy `#14213D`**
  - Secondary (Dominant): **Cream `#F4EDE0`**
  - Accent (~10%): **Coral `#FF6258`**
- Defined semantic CSS custom properties in `web/src/index.css` and refactored all components to eliminate hardcoded hex colors.
- Developed two automated auditing tools:
  - `scripts/check_palette.py`: Static AST regex auditor scanning all 19 frontend files.
  - `scripts/check_runtime_palette.py`: Playwright headless browser script computing runtime CSS styles across 375 rendered DOM elements.
- Result: **100% compliance** with measured pixel share of 96.71% dominant (Navy/Cream) and 3.29% accent (Coral).

---

## Phase 5: AI SOC Threat Chatbot Fix & Intent Parsing

### 5.1 Root Cause Investigation of Chatbot Repetition
Operators and mentors reported that clicking quick suggestion chips or typing custom questions in "Ask AI Analyst About This Threat" returned identical canned brute-force responses regardless of the question asked.

**Root Causes Identified**:
1. **Telemetry Contamination in Offline Engine**: In `analyst/ask.py`, recent telemetry was dumped into the prompt string. Because recent events included `"brute_force"`, `DeterministicOfflineProvider.generate()` always matched `if "brute_force" in prompt:`, overriding the operator's actual question.
2. **Missing Schema Contract**: The frontend sent `event_context` with the selected alert details, but `AskRequest` in `api/app/routes/analyst.py` did not declare the field, causing FastAPI to discard it.
3. **No Intent Classification**: The engine lacked logic to differentiate questions about firewall rules, attack vectors, or attacker IP.

### 5.2 Implementation of Dynamic Grounded Q&A
1. **Schema Extension**: Added `event_context: dict[str, Any] | None` to `AskRequest` and passed it through to `analyst_assistant.answer_question()`.
2. **Dynamic Intent-Based Reasoner (`analyst/providers/offline.py`)**:
   - **Firewall Intent**: Synthesizes exact `sudo iptables -A INPUT -s <IP> -j DROP`, `sudo ufw deny from <IP>`, and Cisco ACL rules targeting the attacker IP.
   - **Primary Vector Intent**: Explains the exact MITRE ATT&CK technique, tactic, and CWE with risk impact.
   - **Insider vs External Assessment**: Inspects the IP address against RFC 1918 private ranges (`10.x`, `192.168.x`, `172.16-31.x`) and warns of internal lateral movement.
   - **Attacker Profile**: Summarizes source IP, attempts count, username tried, and target surface.
   - **Remediation Protocol**: 4-stage containment and identity hardening protocol.
   - **Full Bilingual Parity**: Generates authoritative answers in English or natural Bengali (বাংলা).
3. **Client-Side Resilient Fallback (`web/src/utils/analystFallback.ts`)**:
   - Integrated client-side RAG fallback directly in the browser. If the backend is sleeping on Render free tier or unreachable, the frontend executes the exact same grounded intent logic locally, preventing console errors.
4. **Auto-Submitting Quick Chips**:
   - Refactored prompt chips in `SelectedAlertPanel.tsx` to automatically populate and trigger the query upon clicking.

---

## Phase 6: Cloud Deployment & Render Blueprint Hardening

### 6.1 Render Blueprint Deployment (`render.yaml`)
- Connected repository to Render Blueprint with ID: **`exs-dbrh0kec6qcc73dstli0`**.
- Provisioned two web services:
  - `prohori-api`: FastAPI backend and AI SOC core.
  - `prohori-honeypot`: Deception sensor automatically bound to `prohori-api`.

### 6.2 Render Build & Deployment Fixes
During initial Render deployment, the build failed with status `Failed deploy`. The following root causes were diagnosed and resolved:
1. **Missing Root Route (`GET /`)**:
   - *Issue*: Render pings `GET /` by default for HTTP health checks. FastAPI only had `GET /healthz`, returning `HTTP 404 Not Found` and failing the deploy.
   - *Fix*: Added `GET /` discovery endpoint in `api/app/main.py` returning `HTTP 200 OK` with service metadata and endpoint links.
2. **Explicit Health Check Configuration**:
   - *Fix*: Added `healthCheckPath: /healthz` to `prohori-api` and `healthCheckPath: /` to `prohori-honeypot` in `render.yaml`.
3. **Python Runtime Version Pinning**:
   - *Issue*: Render defaulted to an older platform Python version lacking Python 3.11+ features (`datetime.UTC`).
   - *Fix*: Created `.python-version` specifying `3.13.1` and added `PYTHON_VERSION: 3.13.1` in `render.yaml`.
4. **Binary Invocation via Python**:
   - *Fix*: Updated start command to `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT` ensuring Uvicorn runs under the correct environment interpreter.

---

## Phase 7: Verification, Test Suites & Clean-PC Guide

### 7.1 Automated Verification Results
- **Pytest**: **43 / 43 PASSED (100%)**
  - Unit tests for PII scrubbing, STIX 2.1 retrieval, triage, correlation, and response advice.
  - 5 dedicated tests for chatbot intents (firewall, vector, insider threat, Bengali queries, input validation).
- **Architectural E2E (`scripts/verify_e2e.py`)**: **15 / 15 PASSED (100%)**
- **Palette Linters**: **100% compliance** statically and at runtime.
- **Frontend Build (`npm run build`)**: Built in **396ms** with zero errors.

### 7.2 Local Reproduction Guide (`docs/HOW_TO_TEST_LOCALLY.md`)
Created a comprehensive, step-by-step guide enabling any teammate or judge on a clean computer to clone the repository, install dependencies, launch the system, and run the live demo with zero prior context.

---

## Summary of Key Repository Documents

| Document | Purpose & Contents |
|---|---|
| [`README.md`](../README.md) | Official project overview, architecture diagram, deployment matrix, and quickstart |
| [`docs/HOW_TO_TEST_LOCALLY.md`](HOW_TO_TEST_LOCALLY.md) | Step-by-step guide to run and test on any clean computer |
| [`docs/DEVELOPMENT_LOG.md`](DEVELOPMENT_LOG.md) | Complete chronological engineering record and decision history (this document) |
| [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) | Comprehensive cloud (Render/Vercel) and on-premises deployment guide |
| [`docs/PROJECT_SUMMARY.md`](PROJECT_SUMMARY.md) | High-level summary of tasks, technologies, hosting, and test results |
| [`docs/DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | Strict 90/10 color palette tokens, WCAG ratios, and pixel share analysis |
| [`docs/PITCH_DECK.md`](PITCH_DECK.md) | 8-slide presentation deck calibrated to measured live demo timings |
| [`render.yaml`](../render.yaml) | Declarative Render Blueprint specification (ID: `exs-dbrh0kec6qcc73dstli0`) |
| [`.python-version`](../.python-version) | Pinned Python runtime version (3.13.1) for Render deployments |

