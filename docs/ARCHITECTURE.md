# Prohori AI ("প্রহরী") — System Architecture & Design

**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**

Prohori AI is an AI-native, self-hostable Security Operations Center. It replaces passive visual alert dashboards with an **active AI SOC Analyst core** that performs real-time autonomous triage, MITRE ATT&CK / CVE correlation, and natural language explanations in **English and Bangla**, backed by an immutable audit trail and on-premise data sovereignty.

---

## 1. High-Level AI-Native Reference Architecture

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

## 2. Mapping to Congress AI-Native Layers

| Architecture Layer | Prohori Implementation | Point-Scoring Technical Value |
|---|---|---|
| **User Interaction** | React 19 + TypeScript + Vite (`web/`) | Dense, tactical SOC dark console. Projector-optimized contrast. |
| **Application Logic** | Python 3.11+ / FastAPI (`api/app/`) | Asynchronous, non-blocking ingestion and WebSocket broadcast bus. |
| **AI Intelligence** | Multi-Provider Engine (`analyst/providers/`) | Google Gemini free-tier, Groq Llama-3.3, local Ollama (Llama 3.2), deterministic offline RAG. |
| **Knowledge Retrieval** | pgvector + Curated STIX/NVD (`knowledge/`) | Retrieval-Augmented Generation (RAG) over MITRE ATT&CK techniques, CVEs, and CWEs. |
| **Agent Orchestration** | Autonomous Agents (`analyst/agents/`) | Triage, Correlation, and Response Advisor agents with Human-in-the-Loop gates. |
| **Data Infrastructure** | PostgreSQL + JSONB + pgvector | Unified telemetry store with relational integrity, JSONB metadata, and vector embeddings. |
| **Deployment & Security** | Docker Compose (`infra/`) + On-Premises Mode | One-command orchestration; strictly defensible lab scope; zero-cloud data sovereignty mode. |

---

## 3. Data Flow

1. **Telemetry Capture**: Sensors monitor defensive boundaries. The Honeypot detects unauthorized authentication probes; the Abuse Guard catches request flooding; the Asset Scanner identifies exposed ports.
2. **PII Sanitization**: Before any event is stored or transmitted to reasoning layers, the Redaction Engine strips passwords, bearer tokens, JWTs, and keys.
3. **Knowledge Augmentation (RAG)**: The event type and parameters query the offline MITRE ATT&CK and CVE database to find matching threat tactics.
4. **Autonomous Triage**: The AI Analyst generates structured verdicts citing MITRE technique IDs (e.g., `[T1110.001]`), reconciling raw sensor severities.
5. **Bilingual Synthesis**: High-fidelity narratives are produced simultaneously in fluent English and native Bengali (বাংলা).
6. **Live Streaming**: The enriched event is broadcast via WebSocket to connected operator consoles.
7. **Immutable Audit Log**: Every verdict, model choice, citation, and human approval is permanently appended to `audit_logs`.

---

## 4. Multi-Tier Deployment Topology

Prohori AI is architected for flexible deployment across edge, container, and cloud topologies:

1. **Local Sovereign On-Premises (Primary)**:
   - Zero external network egress; 100% air-gapped data sovereignty.
   - Microservices communicate over loopback (`127.0.0.1`): Operator Console (3000), Event API (8000), Honeypot (8081), Rate Limiter (8082), Scanner (8083), and Ollama Daemon (11434).
   - Storage: Embedded SQLite (`prohori.db`) via `aiosqlite`.
2. **Containerized Multi-Service Mesh (`infra/docker-compose.yml`)**:
   - 6 isolated containers: `prohori-db` (PostgreSQL 16 + pgvector), `prohori-api`, `prohori-deception-sensor`, `prohori-ratelimiter-guard`, `prohori-discovery-sensor`, and `prohori-web-console`.
3. **Cloud Distributed Architecture (Render & Vercel)**:
   - Backend & Sensors: Infrastructure-as-Code Render Blueprint (`render.yaml`).
   - Frontend: Vercel Single-Page Application (`vercel.json` & `web/vercel.json`).
   - Storage: Managed PostgreSQL via Supabase, Neon, Render, or Railway.

For detailed operational procedures, port allocations, and live links, consult [`docs/DEPLOYMENT.md`](DEPLOYMENT.md).


