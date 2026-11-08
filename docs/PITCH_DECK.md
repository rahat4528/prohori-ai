# Prohori AI ("প্রহরী") — Pitch Deck & Presentation Guide

**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**

---

### Slide 1: The Problem (0:00 - 0:30)
- **Title**: The Cybersecurity Crisis in Emerging Economies
- **Headline**: Bangladesh is digitizing at lightning speed, but 85% of SMEs, financial institutions, and government offices cannot afford a dedicated SOC team.
- **Pain Points**:
  - SOC analysts are scarce, burned out, and cost \$40,000–\$100,000/year each.
  - Alert fatigue: 1,000+ alerts daily; mean-time-to-understand (MTTU) is 45 minutes per alert.
  - **Data Sovereignty Trap**: Current cloud SOC solutions export sensitive national security logs to overseas cloud providers, violating emerging data-protection mandates.

---

### Slide 2: The Solution (0:30 - 1:00)
- **Title**: Prohori AI ("প্রহরী") — The Self-Hostable, Bilingual AI SOC Analyst
- **Headline**: A complete Security Operations Center in a box. Four defensive sensors feed one shared bus, where an autonomous AI SOC Analyst triages, correlates, and explains threats in plain English **and Bengali (বাংলা)**.
- **Key Differentiators**:
  - **Explainable & Cited**: Every verdict is grounded in MITRE ATT&CK & CVE RAG knowledge.
  - **Zero-Cloud Data Sovereignty**: Operates 100% on-premises with local models (Ollama / Llama 3.2).
  - **Human-in-the-Loop**: AI recommends containment; human operator approves with one click.

---

### Slide 3: Live Money-Shot Demo (1:00 - 2:00)
- **Demo Script**:
  1. Trigger benign credential burst against Honeypot (`scripts/demo_traffic.py`).
  2. Live WebSocket pushes alert to console: **"BRUTE FORCE SUSPECTED"**.
  3. In the "Ask the Analyst" panel, type: *"কী ঘটেছে? কতটা বিপজ্জনক?"*
  4. The AI Analyst answers instantly in native Bangla:
     > *"প্রহরী এআই ডিকয় সারফেসে একাধিক অননুমোদিত ক্রেডেনশিয়াল স্টাফিং শনাক্ত করেছে। এটি MITRE ATT&CK [T1110.001] এর সাথে মিলে যায়..."*
  5. Operator clicks **"Approve Firewall Block"** &rarr; verified in Immutable Audit Trail.

---

### Slide 4: AI Architecture & Technical Depth (2:00 - 2:30)
- **Title**: Multi-Agent Orchestration & RAG Grounding
- **Layers**:
  - **Defensive Sensors**: Honeypot Decoy (isolated), Abuse Guard (sliding-window 429 limiter), Allowlisted Asset Scanner.
  - **Data Layer**: FastAPI + PostgreSQL + pgvector for vector retrieval.
  - **Agent Intelligence**: Triage Agent, Correlation Agent, and Response Advisor.
  - **PII Redaction Layer**: Mandatory scrubbing of passwords, JWTs, and API tokens prior to LLM reasoning.

---

### Slide 5: Responsible AI & Data Sovereignty (Direct Rubric Points)
- **Compliance Matrix**:
  - **Ethical Boundary**: Enforced target allowlists in code; zero offensive scraping.
  - **Sovereignty**: Cloud egress disable toggle; runs offline during venue connectivity drops.
  - **Auditability**: Cryptographically sound append-only database of every reasoning step.
  - **Explainability**: Anti-hallucination policy requiring exact MITRE/CVE citations.

---

### Slide 6: Business Model & Commercial Viability
- **Market Size**:
  - 100,000+ Bangladeshi SMEs, 60+ commercial banks, and regional public sector organizations.
- **Monetization Streams**:
  - **Community Edition**: Free, self-hostable open-source engine (drives adoption).
  - **Enterprise On-Prem**: Annual node license (\$1,200/node/year) for banks & defense.
  - **Managed SOC SaaS**: \$99/month for SMEs with multi-tenant cloud telemetry.

---

### Slide 7: Global Scalability & Societal Impact
- **Impact**: Drops Mean-Time-To-Understand (MTTU) from 45 minutes to 3 seconds.
- **Local Capability Building**: Bridges the talent gap by allowing Bengali-speaking IT staff to operate an enterprise-grade SOC.
- **Scalability**: Stateless microservices, Docker-containerized, horizontally scaleable event bus capable of ingesting 10,000+ events/sec.

---

### Slide 8: Team & Execution Discipline
- **Roles**:
  - **Team Leader / Coordinator**: System vision, pitch coordination, demo script.
  - **AI / Data Scientist**: RAG knowledge base engineering, prompt design, grounding.
  - **Full-Stack / Frontend Lead**: Tactical SOC console, responsive UX, accessibility.
  - **Backend / Security Engineer**: Event API, defensive sensors, pgvector integration.
  - **Presentation & Compliance Lead**: Audit framework, documentation, commercial model.

