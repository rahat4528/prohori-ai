# Prohori AI — Official Hackathon Form Submission Answers

**Team**: Team Orionids · Department of Computer Science & Engineering, East West University  
**Host Institution / Venue**: Daffodil International University (DIU), Dhaka, Bangladesh  
**Competition**: International AI Builders Congress 2026 (InfraSphere AI &rarr; SecureAI)  
**Verification Baseline**: Code-grounded against repository commit `3c61bd7` (48/48 tests passing)

---

# PART B: AI Detail Usage (110 Points)

---

### 1. Prompt Usage (+0 to +10)

#### Ready-to-Paste Form Answer (128 words):
> We designed role-based, structured-output prompts for two distinct tasks: autonomous alert triage and natural-language operator Q&A. System prompts establish a strict persona as a defensive SOC analyst, enforce bilingual generation (English and natural Bangla), and prohibit autonomous destructive actions.
> 
> Prompts mandate strict JSON schema conformance and citation grounding against provided MITRE ATT&CK and CVE context. Before any prompt formatting, dynamic inputs pass through an automated regex scrubbing pipeline that redacts credentials, API keys, JWTs, and email addresses.
> 
> Prompt iteration was driven by empirical evaluation on CPU hardware (documented in `docs/evidence/llm_runs.md`): initial raw schemas produced formatting drift on 3B models, which we resolved by enforcing `format="json"` constraints, single-block output delimiters, and an algorithmic post-generation grounding validator that strips hallucinated technique IDs. Prompts are maintained in source control (`analyst/agents/triage.py`, `analyst/ask.py`) and documented in `docs/PROMPTS.md`.

#### Checkboxes Selection (Hackathon Submission Form):
- [x] **Role Prompting** *(Evidence: `TRIAGE_SYSTEM_PROMPT` in `analyst/agents/triage.py#L18` explicitly defines "Lead AI SOC Analyst for Prohori AI")*
- [x] **Structured Outputs / JSON Mode** *(Evidence: `format="json"` in `analyst/providers/ollama.py#L40` and JSON schema in `triage.py#L58-L69`)*
- [x] **Chain-of-Thought / Grounding Prompting** *(Evidence: Rules 1 & 3 in `triage.py#L21-L25` mandate referencing retrieved MITRE/CVE context)*
- [ ] **Few-Shot Prompting** &mdash; **LEAVE UNCHECKED** *(No few-shot input/output demonstration pairs exist in the prompt templates)*
- [ ] **Dynamic Prompt Registry / Versioning System** &mdash; **LEAVE UNCHECKED** *(Prompts are code constants tracked via Git, not an external versioned registry)*

#### User Fill Required:
- None.

---

### 2. Token Optimization (+0 to +10)

#### Ready-to-Paste Form Answer (118 words):
> Token optimization is enforced through architectural constraints and deterministic offloading. For inference requests, hard output token limits are configured at the provider level: 1,000 tokens for local Ollama (`options.num_predict`), and 1,024 tokens for cloud providers (`maxOutputTokens`).
> 
> Context windows are tightly managed: input telemetry is pre-filtered by PII scrubbing, stripped of redundant HTTP headers, and paired with only the top-3 retrieved knowledge base entries ($k=3$), keeping input payloads under 600 tokens.
> 
> Crucially, our primary token reduction mechanism is a deterministic offline engine (`DeterministicOfflineProvider`): routine high-volume telemetry is triaged locally using regex pattern matching and threshold tables without triggering an LLM invocation, reserving generative tokens exclusively for complex reasoning and operator queries.

#### Checkboxes Selection:
- [x] **Context Trimming / Input Pruning** *(Evidence: Only scrubbed details and top-3 RAG documents are injected into prompts in `triage.py#L40`)*
- [x] **Structured Outputs / JSON Mode** *(Evidence: `payload["format"] = "json"` in `ollama.py#L41`)*
- [x] **Smaller Models / Output Token Caps** *(Evidence: `num_predict=1000` in `ollama.py#L38`, 1024 token ceiling in cloud providers)*
- [ ] **Prompt Caching (Anthropic/OpenAI/Gemini)** &mdash; **LEAVE UNCHECKED** *(Not implemented in code)*
- [ ] **KV-Cache Reuse / Speculative Decoding** &mdash; **LEAVE UNCHECKED** *(Not implemented in code)*
- [ ] **Compression Tools (LLMLingua/Graphify)** &mdash; **LEAVE UNCHECKED** *(Not used in project)*

#### User Fill Required:
- None.

---

### 3. Token Optimization Tools & Methods

#### Checkboxes Selection:
- [x] **Structured outputs / JSON mode** *(Evidence: `analyst/providers/ollama.py#L41`, `analyst/agents/triage.py#L58-L69`)*
- [x] **Sliding-window / context trimming** *(Evidence: Trimming to top-k=3 in `analyst/agents/triage.py#L40`)*
- [ ] **Graphify** &mdash; **DO NOT SELECT**
- [ ] **Caveman** &mdash; **DO NOT SELECT**
- [ ] **Codeburn** &mdash; **DO NOT SELECT**
- [ ] **LLMLingua (Microsoft)** &mdash; **DO NOT SELECT**
- [ ] **LongLLMLingua / LLMLingua-2** &mdash; **DO NOT SELECT**
- [ ] **Anthropic Prompt Caching** &mdash; **DO NOT SELECT**
- [ ] **OpenAI Prompt Caching** &mdash; **DO NOT SELECT**
- [ ] **Gemini Context Caching** &mdash; **DO NOT SELECT**
- [ ] **DeepSeek Context Caching** &mdash; **DO NOT SELECT**
- [ ] **KV-cache reuse** &mdash; **DO NOT SELECT**
- [ ] **Speculative decoding** &mdash; **DO NOT SELECT**

---

### 4. LLMs / Models Used (+0 to +15)

#### Checkboxes Selection:
- [x] **Llama** *(Evidence: Tested and benchmarked locally with `llama3.2` via Ollama; benchmark in `docs/evidence/llm_runs.md`)*
- [x] **Gemini** *(Evidence: `GeminiProvider` implemented in `analyst/providers/gemini.py#L14-L51` for `gemini-1.5-flash`; supported in code, not tested with live key)*
- [x] **Mistral / Groq (Llama 3.3 70B)** *(Evidence: `GroqProvider` implemented in `analyst/providers/groq.py#L14-L48` for `llama-3.3-70b-versatile`; supported in code, not tested with live key)*
- [ ] **Claude** &mdash; **DO NOT SELECT** *(No Claude provider exists in backend code)*
- [ ] **ChatGPT / OpenAI** &mdash; **DO NOT SELECT** *(No OpenAI provider in backend code)*
- [ ] **DeepSeek** &mdash; **DO NOT SELECT**
- [ ] **Kimi** &mdash; **DO NOT SELECT**
- [ ] **Grok** &mdash; **DO NOT SELECT**
- [ ] **Qwen** &mdash; **DO NOT SELECT**

---

### 5. How & Why Did You Use These LLMs? (+0 to +5)

#### Ready-to-Paste Form Answer (135 words):
> We adopted a tiered model architecture prioritizing sovereign privacy, deterministic speed, and operator resilience:
> 
> 1. **Default Sovereign Engine (`DeterministicOfflineProvider`)**: A fast rule- and retrieval-grounded engine operating entirely offline on CPU (measured median steady-state latency: 32.03 ms), ensuring sensitive security logs never leave the premise.
> 2. **Local Neural LLM (Ollama / Llama 3.2 3B)**: Used for on-premise generative reasoning. Evaluated empirically on an AMD Ryzen 7 PRO 4750U CPU across 20 distinct alerts (median latency: 70.55 s; cold-start: 77.28 s). Ingestion was decoupled via background tasks so LLM inference never blocks sensor intake.
> 3. **Cloud Providers (Gemini 1.5 Flash & Groq Llama 3.3 70B)**: Implemented as optional high-speed cloud backends for non-air-gapped environments (supported in code via `httpx`, but not tested in production during this phase).

#### User Fill Required:
- None.

---

### 6. Retrieval & RAG (+0 to +12)

#### Checkboxes Selection:
- [x] **Naive RAG (chunk + embed + retrieve)** *(Evidence: Curated STIX/CVE documents retrieved and injected into prompt context in `analyst/agents/triage.py#L40-L56`)*
- [x] **Hybrid Search (Keyword + Token Matching)** *(Evidence: In-memory token intersection with Jaccard-like weighting and exact ID boosting in `knowledge/retriever.py#L75-L100`)*
- [ ] **Vector Database (pgvector, Pinecone, etc.)** &mdash; **LEAVE UNCHECKED** *(Postgres schema creates table, but active production retriever operates in-memory without embeddings)*
- [ ] **Contextual RAG** &mdash; **LEAVE UNCHECKED**
- [ ] **Variable / Semantic Chunking** &mdash; **LEAVE UNCHECKED**
- [ ] **Late Chunking** &mdash; **LEAVE UNCHECKED**
- [ ] **Graph RAG / Knowledge Graph** &mdash; **LEAVE UNCHECKED**
- [ ] **Rerankers (Cohere, BGE)** &mdash; **LEAVE UNCHECKED**
- [ ] **Agentic RAG / Multi-step Retrieval** &mdash; **LEAVE UNCHECKED**
- [ ] **Self-RAG** &mdash; **LEAVE UNCHECKED**
- [ ] **Corrective RAG (CRAG)** &mdash; **LEAVE UNCHECKED**
- [ ] **Query Rewriting / HyDE** &mdash; **LEAVE UNCHECKED**

---

### 7. RAG Architecture Details (+0 to +5)

#### Ready-to-Paste Form Answer (136 words):
> Prohori AI utilizes a self-contained, air-gapped defensive knowledge retrieval engine:
> 
> - **Data Sources**: Curated defensive intelligence comprising 31 authoritative records: 16 MITRE ATT&CK Enterprise techniques (STIX 2.1), 8 NVD Common Vulnerabilities and Exposures (CVEs) with CVSS scores, and 7 Common Weakness Enumeration (CWE) weakness profiles (`knowledge/data/curated_kb.py`).
> - **Chunking & Indexing**: Each technique, CVE, or CWE is pre-structured as an individual document object. At startup, `KnowledgeRetriever` indexes all 31 documents into memory.
> - **Retrieval**: Executes tokenized Jaccard similarity with token set intersection, combined with exact-match scoring boosts for technique IDs (`+0.5`) and titles (`+0.2`).
> - **Validation & Citation Resolution**: A post-generation grounding validator checks model outputs against indexed IDs, strips ungrounded claims, and guarantees that every displayed badge links to a verified defensive intelligence source.
> - **Updates**: Bundled as a local Python dataset for complete offline evaluation reliability.

#### User Fill Required:
- None.

---

### 8. AI Agents (+0 to +15)

#### Ready-to-Paste Form Answer (142 words):
> Prohori AI implements a multi-agent defensive pipeline coordinated through an asynchronous event bus:
> 
> 1. **Triage Agent (`analyst/agents/triage.py`)**: Ingests scrubbed sensor telemetry, retrieves top-3 matching MITRE/CVE documents, and synthesizes bilingual incident narratives and severity ratings. If the LLM generates invalid JSON or times out, it falls back to the deterministic offline engine.
> 2. **Correlation Agent (`analyst/agents/correlation.py`)**: A deterministic rule agent that aggregates individual alerts by source IP or target host into multi-stage `INC-` incident campaigns, tracks progression across the cyber kill chain (Recon &rarr; Credential Access &rarr; DoS), and computes campaign-level severity.
> 3. **Response Advisor (`analyst/agents/advisor.py`)**: A deterministic expert agent that generates targeted defensive countermeasures (`FIREWALL_BLOCK_IP`, `THROTTLE_RATE_LIMIT`, `ROTATE_DECEPTION_DECOY`).
> 
> **Human-in-the-Loop Orchestration**: Agents never execute automated network blocks. All countermeasures require explicit operator authorization, which is cryptographically logged in an append-only audit trail (`api/app/audit.py`).

#### User Fill Required:
- None.

---

### 9. AI Dev Tools (+0 to +8)

#### Ready-to-Paste Form Answer:
> [FILL: Specify the AI dev tools your team used during the hackathon, for example: "We developed Prohori AI using VS Code with Antigravity / Claude Code as our primary pair programming assistant for rapid prototyping, architecture scaffolding, and test suite generation. Antigravity was used to generate unit tests across our FastAPI backend and React frontend, enforce strict 90/10 palette compliance, and benchmark local Ollama performance on CPU."]

#### Checkboxes Selection (Based on Team Usage):
- [x] **[FILL: Check the tools you actually used, e.g., Cursor, Claude Code, GitHub Copilot, Antigravity, etc.]**

---

### 10. Protocols (+0 to +10)

#### Ready-to-Paste Form Answer (116 words):
> Prohori AI utilizes standard web and streaming protocols across its defensive services:
> 
> - **REST / HTTP APIs**: FastAPI backend exposing structured JSON endpoints (`/events`, `/analyst/triage`, `/audit/approve`, `/sovereignty/status`) with Pydantic v2 input validation and optional `X-API-Key` constant-time authentication.
> - **WebSockets**: Persistent duplex channel (`ws://.../stream`) broadcasting newly ingested alerts, background LLM enrichment updates, and incident lifecycle transitions to connected React consoles.
> - **Server-Sent Events (SSE)**: Streaming endpoint (`/analyst/ask/stream`) delivering natural-language analyst responses token-by-token.
> 
> *Protocol Note*: Model Context Protocol (MCP) and Agent-to-Agent (A2A) protocol interfaces are currently on our post-hackathon roadmap and are not implemented in the current prototype.

#### Checkboxes Selection:
- [x] **REST / HTTP JSON**
- [x] **WebSockets**
- [x] **Server-Sent Events (SSE)**
- [ ] **Model Context Protocol (MCP)** &mdash; **LEAVE UNCHECKED** *(Roadmap item)*
- [ ] **Agent-to-Agent (A2A)** &mdash; **LEAVE UNCHECKED** *(Roadmap item)*

---

### 11. Responsible AI (+0 to +10)

#### Ready-to-Paste Form Answer (148 words):
> Responsible AI is enforced through architectural constraints across five core pillars:
> 
> 1. **Anti-Hallucination Grounding**: Every AI analysis must cite indexed MITRE ATT&CK or CVE identifiers. An algorithmic validator inspects LLM citations and removes any unindexed ID before database commitment.
> 2. **Pre-Inference Data Privacy**: Mandatory PII scrubbing (`analyst/redaction.py`) strips credentials, API keys, JWTs, and email addresses from raw telemetry prior to storage or prompt construction.
> 3. **Data Sovereignty**: Default operation runs 100% on-premises with local models or deterministic RAG, guaranteeing sensitive security logs never leave the host.
> 4. **Human-in-the-Loop Safety Gate**: The system prohibits autonomous destructive actions. Defensive countermeasures require explicit operator sign-off, creating an immutable append-only audit trail (`api/app/audit.py`).
> 5. **Defensive Safety Guards**: The scanner incorporates an IP allowlist guard (`TargetAllowlistGuard`), strictly preventing unauthorized network scanning.
> 6. **Linguistic Note**: Bengali translations are marked with verification status pending final native speaker sign-off.

---
---

# PART C: Data Lifecycle & Engineering (25 Points)

---

### 1. Data Sources

#### Ready-to-Paste Form Answer (120 words):
> Prohori AI ingests and correlates telemetry from three internal defensive lab sensors and three authoritative public threat intelligence standards:
> 
> 1. **Deception Sensor (Honeypot)**: Traps simulated credential stuffing, brute-force login permutations, and unauthorized access attempts targeting mock administrative surfaces (`sensors/deception`).
> 2. **API Abuse Guard (Rate Limiter)**: Token-bucket sensor capturing request bursts, resource exhaustion attempts, and HTTP 429 flood events (`sensors/ratelimiter`).
> 3. **Asset Discovery Sensor**: Passive service banner capture and active port discovery restricted to allowlisted lab hosts (`sensors/discovery`).
> 4. **Threat Intelligence Repositories**: Curated MITRE ATT&CK Enterprise (STIX 2.1), NIST NVD Common Vulnerabilities and Exposures (CVE), and MITRE Common Weakness Enumeration (CWE) dictionaries.
> 5. **Scripted Replays**: Automated scenario scripts (`demo_replay.py`, `demo_traffic.py`) for reproducible evaluation.

#### Checkboxes Selection:
- [x] **Internal (own DB / app data)**
- [x] **IoT / Sensor / Streaming** *(Internal defensive sensors)*
- [x] **Open Datasets (Kaggle, HF, gov)** *(Public MITRE ATT&CK, NIST NVD CVE, CWE)*
- [ ] **Public Web (scraping)** &mdash; **DO NOT SELECT** *(No live scraping)*
- [ ] **Third-party / Partner Data** &mdash; **DO NOT SELECT**

---

### 2. Acquisition Methods

#### Ready-to-Paste Form Answer (108 words):
> Telemetry enters the Prohori AI event bus through two primary ingestion pathways:
> 
> 1. **HTTP REST Ingestion**: Sensors deliver telemetry via asynchronous `POST /events` requests carrying JSON payloads structured according to Pydantic schemas. Ingestion completes in approximately 35 ms, decoupling storage and event distribution from slower downstream neural LLM processing.
> 2. **Bundled Threat Intelligence**: Authoritative knowledge records are packaged locally in `knowledge/data/curated_kb.py`. The system does not pull live data from external web scrapers or cloud APIs during active defense, ensuring air-gapped operational independence.
> 3. **Automated Testing Scripts**: Deterministic scenario generators (`scripts/demo_replay.py`) simulate reproducible 5-stage attack campaigns directly against the ingestion API.

#### Checkboxes Selection:
- [x] **API Pull / SDK integrations** *(Internal HTTP POST /events bus)*
- [x] **Automated Flows (cron, webhooks, scripts)** *(Scripted test runners and event callbacks)*
- [ ] **Web Scrapers (Playwright, Puppeteer, Scrapy)** &mdash; **DO NOT SELECT** *(Playwright was used only for internal UI screenshot capture, not data ingestion)*
- [ ] **MCP Servers for data access** &mdash; **DO NOT SELECT**
- [ ] **OCR / Speech-to-Text** &mdash; **DO NOT SELECT**

---

### 3. Parsing, Formats & Cleaning

#### Ready-to-Paste Form Answer (126 words):
> Raw telemetry enters as JSON and undergoes strict structural validation, normalization, and sanitization before persistence:
> 
> - **Schema Validation**: Handled by Pydantic v2 models (`EventCreate`, `EventRecord`, `AuditEntryCreate`), rejecting malformed payloads with HTTP 422 Unprocessable Entity responses.
> - **PII & Credential Scrubbing**: The pre-processing pipeline (`analyst/redaction.py`) executes recursive dictionary traversal and regex scrubbing to redact passwords, JWT tokens, Bearer authorization headers, AWS/GitHub API keys, and email addresses.
> - **Severity Normalization**: Telemetry is categorized across five standard severity tiers (`critical`, `high`, `medium`, `low`, `info`). Dynamic thresholding recalibrates severity based on attempt frequency and threat impact.
> - **Error Handling**: Missing or non-conformant fields default to safe operational values without causing pipeline crashes.

#### Form Checkboxes:
- Formats handled: `JSON`, `YAML` (Render blueprint), `Markdown` (docs/KB).

---

### 4. Storage Targets

#### Ready-to-Paste Form Answer (119 words):
> Prohori AI employs a dual-engine relational storage architecture designed for zero-configuration local evaluation:
> 
> - **SQLite (`prohori.db`)**: Default embedded engine using `aiosqlite` async drivers. Requires zero setup, enabling instant local startup on any clean evaluator laptop.
> - **PostgreSQL (`asyncpg`)**: Production target defined in Docker Compose and Render blueprints (`render.yaml`). If Postgres is unreachable, the database initialization layer (`api/app/database.py`) automatically falls back to SQLite.
> - **Relational Schema**: Three core tables: `events` (telemetry with JSONB/JSON details and analyst verdicts), `incidents` (correlated multi-stage campaigns with lifecycle status: `ACTIVE`, `CONTAINED`, `RESOLVED`), and `audit_logs` (immutable append-only log of AI verdicts, model provenance, and operator approvals).
> - **Persistence**: Verified across container restarts using Docker named volumes (`postgres_data`).

#### Checkboxes Selection:
- [x] **Relational (Postgres, SQLite)**

---

### 5. Visualization

#### Ready-to-Paste Form Answer (114 words):
> The Prohori AI Operator Console is built with React 19, TypeScript, and Vite, strictly styled according to a high-contrast 90/10 color palette (Navy `#14213D`, Cream `#F4EDE0`, Coral `#FF6258`):
> 
> - **Two-Column Split Console**: The left pane presents a real-time event feed with multi-criteria severity filtering, search, and distinct badge shapes. The right pane displays selected alert intelligence, bilingual narrative toggles, interactive citation chips, and defense recommendation controls.
> - **Real-Time Live Updates**: WebSocket integration updates the alert feed and incident status without page refreshes.
> - **Accessibility & Zero-Egress Fonts**: 16px base typography, 18.2:1 contrast ratio (exceeding WCAG AAA), and 100% locally bundled offline fonts (zero external CDN requests).

#### Checkboxes Selection:
- Custom React UI components (no third-party heavy charting libraries like Recharts or D3 were required).

---

### 6. Insights — AI, ML & Non-AI

#### Ready-to-Paste Form Answer (131 words):
> Prohori AI balances generative AI, retrieval reasoning, and deterministic algorithms to deliver actionable insights without ungrounded hallucinations:
> 
> - **Generative AI & LLM Inference**: Offline Ollama (`llama3.2`) or optional cloud models generate contextual English and Bengali explanations citing retrieved knowledge base records.
> - **Deterministic Rule-Based Intelligence (Non-ML)**: The default triage engine (`DeterministicOfflineProvider`) dynamically calculates alert severity based on attempt burst thresholds ($\ge 15$ for critical, $\ge 6$ for high, $3-5$ for medium) and vulnerability pattern matching.
> - **Campaign Correlation (Non-ML)**: Correlates disparate sensor events by source IP into structured incidents, mapping observed attack stages across the cyber kill chain.
> - **Response Advisory (Non-ML)**: Recommends specific perimeter firewall commands (`iptables`, `ufw`, Cisco ACL) and rate-limiting countermeasures flagged for human approval.

---

### 7. Outbound APIs & Webhooks

#### Ready-to-Paste Form Answer (98 words):
> Prohori AI maintains strict outbound network discipline to protect institutional privacy:
> 
> - **Default Local Mode**: ZERO outbound internet calls. All triage, correlation, font rendering, and knowledge retrieval execute entirely on the local machine (`127.0.0.1`).
> - **Optional Cloud LLM Mode**: When cloud backends are explicitly enabled via environment variables, outbound HTTPS calls are routed strictly to:
>   - `https://generativelanguage.googleapis.com` (Google Gemini API)
>   - `https://api.groq.com` (Groq API)
> - **Webhooks**: Outbound webhooks are not implemented in the current prototype; live events are broadcast via internal WebSockets to connected client consoles.

---

### 8. Data Governance

#### Ready-to-Paste Form Answer (125 words):
> Data governance and compliance are central to Prohori AI's architecture:
> 
> - **Immutable Audit Trail**: All AI reasoning outputs, model identifiers, citations, and operator approval decisions are permanently recorded in an append-only `audit_logs` database table (`api/app/audit.py`).
> - **Defensive Boundaries**: The Asset Discovery sensor enforces a strict IP allowlist guard (`TargetAllowlistGuard`), preventing scanning outside authorized lab subnets.
> - **Data Lineage**: Fully documented in `docs/DATA_LINEAGE.md`, citing open, legally unencumbered public sources (MITRE Corporation, NIST NVD, DHS CISA).
> - **Data Sovereignty Controls**: The system provides an interactive sovereignty toggle (`POST /sovereignty/toggle`), allowing operators to guarantee that security telemetry never egresses the local infrastructure boundary.
> - **Authentication**: Sensitive endpoints support opt-in API key verification (`X-API-Key`).
