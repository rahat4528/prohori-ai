# Prohori AI — Judge Q&A Defense & Technical FAQ

**Team**: Team Orionids  
**Event**: International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI  

This document prepares Team Orionids for the toughest technical, operational, and commercial questions from hackathon judges, grounded directly in the tested codebase.

---

### Question 1: "Does any data actually leave the machine?"
**Honest Answer:**
> *"In our default and local sovereignty mode, absolutely zero bytes of telemetry leave the machine. We run local Ollama (Llama 3.2) or our built-in deterministic offline RAG engine.
> However, we also provide optional cloud provider integrations (Google Gemini 1.5 Flash and Groq Llama 3.3) for operators who want high-throughput cloud inference. When a cloud API key is configured and Sovereignty Mode is toggled off, telemetry prompts are sent to those third-party APIs after undergoing mandatory PII/secret scrubbing. The operator always controls this via the header Sovereignty toggle and environment configuration."*

---

### Question 2: "What is your real analysis latency? Isn't an LLM too slow for real-time SOC alerting?"
**Honest Answer:**
> *"We benchmarked this directly on an AMD Ryzen 7 PRO 4750U (8 cores, 16 threads, 32GB RAM) over 20 live incoming alerts:
> - **Steady-state median latency:** **30.44 ms** per alert (with the deterministic offline RAG engine).
> - **Mean latency:** **134.03 ms** (accounting for initial cold-start connection pooling).
> - **Worst-case / Cold-start:** **2,098.63 ms** (first alert warming up SQLite/Postgres connection and knowledge embeddings).
> In local Ollama mode with Llama 3.2, token generation takes approximately 350–700 ms.
> Crucially, our architecture decouples high-speed event ingestion (handled asynchronously by FastAPI in sub-5ms) from AI reasoning: the AI Analyst only triages elevated signals or aggregates them into multi-stage attack incidents, preventing inference bottlenecks."*

---

### Question 3: "Why native Bengali (বাংলা)? How do you evaluate its quality and avoid mistranslations?"
**Honest Answer:**
> *"During an active security breach, cognitive load on on-duty IT officers is extreme. Translating complex technical concepts in high-stress moments causes delayed incident response.
> For technical identifiers (IPs, CVE IDs, MITRE techniques like `[T1110.001]`, port numbers), we strictly preserve standard English terms. The narrative context, attack progression, and recommended mitigations are explained in natural, fluent Bengali.
> In our offline engine, we ground translations in verified cybersecurity lexicons curated for Bangladeshi organizations. In LLM mode, our system prompt enforces bilingual parity and forbids conversational filler."*

---

### Question 4: "What parts of the system are real vs. simulated / mocked?"
**Honest Answer:**
> *"Let's be 100% transparent:
> - **Real & Production-Ready:** The FastAPI ingestion bus, SQLite / PostgreSQL with pgvector schema, the real-time WebSocket broadcaster, the PII/secret scrubbing regex pipeline, the RAG retrieval engine over 14 MITRE techniques & 8 CVEs, the immutable audit trail database, and the React 19 console with live SSE typewriter streaming.
> - **Deliberately Scoped / Simulated:** The 3 defensive sensors are lab-grade sensors. The Deception Honeypot traps real HTTP authentication bursts and path probes, but is strictly isolated and never executes shell commands. The Asset Discovery Scanner performs real socket connections and banner grabs, but has a hardcoded IP allowlist (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`) so it cannot be abused for offensive scanning.
> - **Roadmap:** Automated continuous cron synchronization with the live NIST NVD API is currently a roadmap feature; today, knowledge updates are ingested via a manual script (`python knowledge/ingest.py`)."*

---

### Question 5: "How do you handle False Positives and prevent the AI from taking destructive actions?"
**Honest Answer:**
> *"Prohori is built on the principle of Human-in-the-Loop (HITL) defensive guardrails. The AI Analyst **never** executes automated perimeter drops or destructive actions autonomously.
> When an anomaly is detected, the Response Advisor formulates a risk-graded recommendation (e.g. temporary IP rate limit or firewall block). The human operator must review the grounded evidence and click 'Approve Countermeasure'.
> Every approval is permanently recorded in an append-only `audit_logs` table containing the timestamp, human operator ID, model version, and exact MITRE citations."*

---

### Question 6: "Can an attacker compromise your AI Analyst using Prompt Injection?"
**Honest Answer:**
> *"We enforce multi-stage defense-in-depth against prompt injection:
> 1. **Structured Data Isolation:** Incoming telemetry (user agents, usernames, query paths) is parsed into strict Pydantic schemas and placed in JSON data blocks rather than instruction headers.
> 2. **Pre-Inference Sanitization:** Our redaction engine scrubs suspicious tokens, secrets, and raw control characters before the prompt is formatted.
> 3. **Strict Grounding:** The LLM is instructed to reject instructions contained within telemetry details and only categorize them against retrieved MITRE/CVE vectors.
> 4. **Zero Execution Privilege:** Even if an attacker somehow caused the model to hallucinate a command, Prohori has zero execution shell access."*

---

### Question 7: "What is your business model? Are your pricing numbers validated?"
**Honest Answer:**
> *"Our pricing figures ($1,200/node/year for enterprise on-premises and $99/month for SaaS) are **initial commercial hypotheses**, not yet customer-validated.
> Our go-to-market strategy has two clear tiers:
> 1. **Community Edition (Open Source, Free):** Self-hostable core for universities, startups, and non-profits to build developer trust and grassroots adoption.
> 2. **Enterprise Support & Compliance Node:** Paid annual licensing for commercial banks, telecom operators, and government departments needing regulatory compliance certification, custom fine-tuned on-prem models, and 24/7 SLA support."*

---

### Question 8: "How does Prohori compare to established tools like Wazuh or Splunk?"
**Honest Answer:**
> *"Wazuh and Splunk are exceptional log aggregation and rule-matching engines, but they require seasoned, expensive SOC analysts to configure YAML rules and interpret cryptic alerts.
> Prohori is an **AI-native analyst layer**. Instead of handing an IT officer 500 alert rows, Prohori correlates them into a multi-stage attack chain, explains the adversary's intent in plain Bengali and English with MITRE citations, and drafts an immediate containment action. It is designed specifically for organizations that cannot afford a 5-person 24/7 SOC team."*

