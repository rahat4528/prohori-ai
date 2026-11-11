# Prohori AI — Judge Q&A Defense & Technical FAQ

**Team**: Team Orionids  
**Event**: International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI  

This document prepares Team Orionids for the toughest technical, operational, and commercial questions from hackathon judges, grounded directly in the tested codebase.

---

### Question 1: "Does any data actually leave the machine?"
**Honest Answer:**
> *"In our default and local sovereignty mode, absolutely zero bytes of telemetry leave the machine. We run our built-in deterministic offline RAG engine (or local Ollama with Llama 3.2).
> However, we also provide optional cloud provider integrations (Google Gemini 1.5 Flash and Groq Llama 3.3) for operators who want high-throughput cloud inference. When a cloud API key is configured and Sovereignty Mode is toggled off, event text, after redaction, is sent to the chosen provider over HTTPS. The operator always controls this via the header Sovereignty toggle and environment configuration."*

---

### Question 2: "Is it fast enough? What is your real analysis latency?"
**Honest Answer:**
> *"It depends on the engine mode, which is why our architecture decouples event ingestion:
> - **Line-Rate Ingestion & Deterministic Triage (Default):** **32.03 ms** median steady-state latency (tested over 20 live alerts on an AMD Ryzen 7 PRO 4750U, cold start: 2,111.45 ms). Incoming sensor events appear on the console in sub-second time.
> - **Local Neural LLM (Ollama Llama 3.2 on CPU):** **70.55 s** median steady-state latency (min: 44.67 s, max steady: 110.06 s; cold start: 77.28 s). With prompt optimization (limiting output to 1 concise sentence), this drops to **24.85 s**.
> - **Decoupled Architecture:** Ingestion never waits for the LLM. The deterministic engine provides instant triage in 32 ms, and if local Ollama is active, it enriches the incident in the background and upgrades the console via WebSocket (`event_enriched`).
> - **Cloud Mode (Optional):** Cloud latency requires an API key and is currently **not measured** on this host."*

---

### Question 3: "Where is the AI if the default out-of-the-box mode is deterministic?"
**Honest Answer:**
> *"We believe in engineering honesty over marketing hype:
> 1. **Default Mode (Retrieval-Grounded Expert System):** Out of the box, Prohori runs a deterministic RAG engine. It indexes MITRE ATT&CK techniques, CVEs, and CWEs in vector/relational stores, performs rule-guided triage, and synthesizes grounded bilingual explanations in ~32 ms. It requires zero GPU, zero downloads, and zero cloud keys.
> 2. **Neural AI Layer (Ollama / Cloud):** When enabled, local Ollama (`llama3.2`) or cloud providers perform generative reasoning, synthesizing novel narratives and conversational threat Q&A (`/analyst/ask`).
> 3. **Honest Console Badge:** The operator console explicitly labels the source of every explanation: `Engine: Offline RAG (deterministic-offline-rag)` vs `LLM: ollama-local (llama3.2)`. We never pretend our deterministic rules are a neural model."*

---

### Question 4: "How good is the LLM's Bangla? How do you evaluate it?"
**Honest Answer:**
> *"Here is the unvarnished reality:
> - **Measured Output:** In our 20-alert benchmark, Ollama `llama3.2` generated Bengali narratives across all runs, but lightweight 3B models frequently exhibit awkward literal phrasing or non-standard security terms when translating technical English concepts into Bengali.
> - **Evaluation Status:** The LLM's Bengali text is **currently unreviewed by a human native speaker**. We do not certify linguistic fluency with automated tools.
> - **Verification Gate:** We assembled a 10-scenario human evaluation pack in [`docs/BANGLA_REVIEW.md`](BANGLA_REVIEW.md) (with rows 6–10 populated directly from real LLM runs). Gate 2 of our final sign-off remains unticked until a native Bengali teammate evaluates each row and signs the review block."*

---

### Question 5: "What parts of the system are real vs. simulated / mocked?"
**Honest Answer:**
> *"Let's be 100% transparent:
> - **Real & Production-Ready:** The FastAPI ingestion bus, SQLite / PostgreSQL with pgvector schema, the real-time WebSocket broadcaster, the PII/secret scrubbing regex pipeline, the RAG retrieval engine over 14 MITRE techniques & 8 CVEs, the immutable audit trail database, and the React 19 console with live SSE typewriter streaming.
> - **Deliberately Scoped / Simulated:** The 3 defensive sensors are lab-grade sensors. The Deception Honeypot traps real HTTP authentication bursts and path probes, but is strictly isolated and never executes shell commands. The Asset Discovery Scanner performs real socket connections and banner grabs, but has a hardcoded IP allowlist (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`) so it cannot be abused for offensive scanning.
> - **Roadmap:** Automated continuous cron synchronization with the live NIST NVD API is currently a roadmap feature; today, knowledge updates are ingested via a manual script (`python knowledge/ingest.py`)."*

---

### Question 6: "How do you handle False Positives and prevent the AI from taking destructive actions?"
**Honest Answer:**
> *"Prohori is built on the principle of Human-in-the-Loop (HITL) defensive guardrails. The AI Analyst **never** executes automated perimeter drops or destructive actions autonomously.
> When an anomaly is detected, the Response Advisor formulates a risk-graded recommendation (e.g. temporary IP rate limit or firewall block). The human operator must review the grounded evidence and click 'Approve Countermeasure'.
> Every approval is permanently recorded in an append-only `audit_logs` table containing the timestamp, human operator ID, model version, and exact MITRE citations."*

---

### Question 7: "Can an attacker compromise your AI Analyst using Prompt Injection?"
**Honest Answer:**
> *"We enforce multi-stage defense-in-depth against prompt injection:
> 1. **Structured Data Isolation:** Incoming telemetry (user agents, usernames, query paths) is parsed into strict Pydantic schemas and placed in JSON data blocks rather than instruction headers.
> 2. **Pre-Inference Sanitization:** Our redaction engine scrubs suspicious tokens, secrets, and raw control characters before the prompt is formatted.
> 3. **Strict Grounding:** The LLM is instructed to reject instructions contained within telemetry details and only categorize them against retrieved MITRE/CVE vectors.
> 4. **Zero Execution Privilege:** Even if an attacker somehow caused the model to hallucinate a command, Prohori has zero execution shell access.
> *Note on Residual Risk:* Secrets and personal data are redacted before prompting; prompt injection is not fully mitigated against sophisticated adversarial inputs."*

---

### Question 8: "What is your business model? Are your pricing numbers validated?"
**Honest Answer:**
> *"Our pricing figures ($1,200/node/year for enterprise on-premises and $99/month for SaaS) are **initial commercial hypotheses**, not yet customer-validated.
> Our go-to-market strategy has two clear tiers:
> 1. **Community Edition (Open Source, Free):** Self-hostable core for universities, startups, and non-profits to build developer trust and grassroots adoption.
> 2. **Enterprise Support & Compliance Node:** Paid annual licensing for commercial banks, telecom operators, and government departments needing regulatory compliance certification, custom fine-tuned on-prem models, and 24/7 SLA support."*

---

### Question 9: "How does Prohori compare to established tools like Wazuh or Splunk?"
**Honest Answer:**
> *"Wazuh and Splunk are exceptional log aggregation and rule-matching engines, but they require seasoned, expensive SOC analysts to configure YAML rules and interpret cryptic alerts.
> Prohori is an **AI-native analyst layer**. Instead of handing an IT officer 500 alert rows, Prohori correlates them into a multi-stage attack chain, explains the adversary's intent in plain Bengali and English with MITRE citations, and drafts an immediate containment action. It is designed specifically for organizations that cannot afford a 5-person 24/7 SOC team."*

