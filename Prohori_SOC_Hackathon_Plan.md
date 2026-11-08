# Prohori AI — Winning Plan for the International AI Builders Congress 2026

**Team competition · Domain: InfraSphere AI → SecureAI · Working title: Prohori AI ("প্রহরী" = sentinel)**

A self-hostable, AI-native Security Operations Center. Four defensive sensors feed one shared event stream; an **LLM + agent "AI SOC Analyst"** triages, correlates, and explains every event in plain language (English **and Bangla**), grounded in a RAG knowledge base of MITRE ATT&CK and CVE data. Everything can run on a single box with a local model, so sensitive security logs never leave the country — your data-sovereignty story, built in.

---

## 1. Why this wins (and why the raw blueprint would not)

The original Mini SOC is solid engineering but it is **surface AI** — the guide's single most common losing mistake ("a chatbot with no real intelligence," "AI as a gimmick"). Judges score each team independently against a 100-point rubric, and two of the five components (40 of 100 points) reward a *genuine AI reasoning core*. A dashboard that only colours events red/green cannot score in the 16–20 "breakthrough" band.

**The reframe:** keep the scanner, honeypot, rate limiter, and dashboard — but make them *sensors*, not the product. The product is the **AI SOC Analyst**: an agentic layer that reads the raw event stream and produces analyst-grade output — *what happened, how serious, how it correlates with other events, what to do next* — with citations to a real knowledge base. That single change moves you from "security dashboard" to "AI-native SecureAI platform."

---

## 2. Rubric-driven design (build to the score sheet)

Each component is 20 pts. This table is your north star — every feature below exists to move a specific number.

| Component (20 pts) | What judges reward | What Prohori ships to earn it |
|---|---|---|
| **Innovation & AI-Native Design** | Non-obvious, transformative use of AI | The AI SOC Analyst: autonomous triage + natural-language incident narratives + correlation across sensors. Not "a chatbot bolted on." |
| **Technical Excellence & Architecture** | Architecture quality, AI integration depth, **explainability** of the intelligence core | Clean sensor→Event API→store→AI→dashboard pipeline; RAG grounding so every verdict is *explainable and cited*, not hallucinated; MCP/agent orchestration. |
| **Business Value & Commercial Viability** | Measurable value + monetizable path | SOC analysts are scarce and expensive; Prohori is an affordable, self-hostable SOC-in-a-box for Bangladeshi SMEs, banks, and gov offices. Clear SaaS + on-prem license model. |
| **Global Scalability & Real-World Impact** | Scales to millions + societal benefit | Stateless API, container-per-sensor, queue-ready event bus; cybersecurity is a universal need. Local jobs/capability narrative. |
| **Responsible AI, Data Sovereignty & Presentation** | Fairness, privacy, governance, **data ownership**, clarity | Local-LLM mode (logs never leave the machine), PII redaction before the LLM sees anything, human-in-the-loop on any response action, audit log. Communicated in a tight demo. |

**Scoring note:** the guide gives bonus signals for **at least one female team member**, **Bangla/localization**, and **NRB/diaspora advisor**. All three are cheap points — secure them early. Bangla is both a bonus *and* a core feature here (the Analyst explains threats in Bangla).

---

## 3. The architecture (AI-native reference, mapped to the Congress's own layers)

```
          ┌─────────── DEFENSIVE SENSORS (your own lab only) ───────────┐
          │                                                              │
   Asset Discovery      Deception Sensor      API Abuse Guard            │
   (allowlisted scan)   (simulated honeypot)  (rate limiter)            │
          │                    │                     │                   │
          └──────────┬─────────┴──────────┬──────────┘                   │
                     ▼                     ▼                             │
            ┌────────────────────────────────────┐                      │
            │   EVENT API  (FastAPI)              │ ◄── rate limiter      │
            │   one shared event schema           │     protects this too │
            └───────────────┬────────────────────┘                      │
                            ▼                                            │
                   Postgres + pgvector (events + RAG knowledge base)     │
                            │                                            │
            ┌───────────────▼────────────────────┐                      │
            │   AI SOC ANALYST  (the product)     │                      │
            │   • triage agent (severity + why)   │                      │
            │   • correlation agent (link events) │                      │
            │   • RAG over MITRE ATT&CK + CVE/CWE  │                      │
            │   • response-advisor (HITL)         │                      │
            │   • Bangla / English narrator       │                      │
            │   • local-LLM mode (sovereignty)    │                      │
            └───────────────┬────────────────────┘                      │
                            ▼                                            │
              WebSocket ──► DASHBOARD (React)  ◄── judges see this first │
```

**Maps 1:1 to the guide's AI-Native Reference Architecture:** User Interaction (React dashboard) · Application Logic (FastAPI + edge) · AI Intelligence (LLM) · Knowledge Retrieval (pgvector RAG) · Agent Orchestration (MCP/agents) · Data Infrastructure (Postgres + vector) · Deployment (containerized/serverless). Put this diagram on your `/architecture` slide verbatim — it signals you read their blueprint.

---

## 4. Stack & services — chosen to earn points *and* stay free

Memory constraint respected: **every service is free-tier, no paid plans, no paid domains.** These are also the exact tools the Congress guide names as "preferred," which is itself a soft signal to judges.

| Layer | Pick | Why it scores / why it's free |
|---|---|---|
| Event API & agents | **Python + FastAPI** | Congress-recommended; async; clean WebSocket support |
| Database + RAG | **Supabase** (Postgres + **pgvector**) free tier | Named in the guide's reference architecture; one service gives you relational + vector store |
| LLM (demo default) | **Groq** free API (Llama 3.x) *or* **Google Gemini** free tier | Fast enough for a live demo; both have real free tiers |
| LLM (sovereignty mode) | **Ollama** local (Llama 3.2 / Qwen) | Runs offline → your data-sovereignty + "no-internet-at-venue" fallback in one |
| Knowledge base | **MITRE ATT&CK** (STIX, free) + **NVD CVE** feed (free, cacheable) + **CWE** | Real data, not hardcoded — kills the "fake data" losing mistake |
| Agent orchestration | **MCP** (Model Context Protocol) | Explicitly praised in the guide; lets you say "MCP-based agent orchestration" truthfully |
| Frontend | **React + Vite + Recharts/Tailwind** | Congress-recommended; fast, clean, dark-theme SOC look |
| Packaging | **Docker Compose** | One-command demo; isolates the honeypot sensor safely |
| Hosting (if deploying) | **Render** / **Fly.io** free web service + **Vercel** free frontend | Free tiers; or just run locally via Compose for the live demo |
| Pitch deck / docs | Slides + Docs (export to PDF/PPTX) | For `/pitchdeck` and `/presentation` deliverables |

**Deliberately NOT "AI-slop frontend":** no generic purple-gradient landing page. Build a real **operator console** — dense, dark, information-first: live feed, severity lanes, a world map of source IPs, an incident timeline, and an **"Ask the Analyst"** panel where a judge types *"explain the last critical event"* and gets a grounded, cited Bangla/English answer live. That interaction is your whole pitch in ten seconds.

---

## 5. Scope control — MVP vs. stretch (the guide's #7 mistake is overbuilding)

**Must-have MVP (this is a complete, winnable product on its own):**
1. Event API + shared schema + Postgres/pgvector
2. **Two** sensors wired end-to-end: Deception Sensor (honeypot) + API Abuse Guard (rate limiter) — these generate live events reliably on demand during a demo
3. **AI SOC Analyst**: triage + natural-language narrative + RAG citations + Bangla toggle
4. Dashboard: live feed, counters, "Ask the Analyst" panel

**Second priority:** Asset Discovery sensor (allowlisted lab scan) + CVE matching, correlation agent, IP map.

**Stretch (only if ahead):** local-LLM sovereignty toggle live on stage, response-advisor with human-in-the-loop approve button, audit report page.

**Cut order under time pressure (pre-decided, so you don't panic):** world map → asset-discovery CVE enrichment → response-advisor. **Never cut** the live feed or the AI Analyst — they are the score.

---

## 6. Build timeline (adapt the blueprint's 48h to the AI-native priority)

| Window | Focus | Done =|
|---|---|---|
| 0–3 h | Repo, event schema, FastAPI skeleton, Supabase + pgvector, Docker Compose | events POST and persist |
| 3–8 h | Deception Sensor + API Abuse Guard emitting real events | dashboard feed shows live events |
| 8–16 h | **AI SOC Analyst core**: ingest event → triage → RAG over ATT&CK/CVE → narrative | typed question returns a grounded, cited answer |
| 16–24 h | Dashboard: live feed, counters, "Ask the Analyst", Bangla toggle | judge-ready console |
| 24–30 h | Asset Discovery (allowlisted) + CVE match + correlation agent | 3rd sensor + linked events |
| 30–36 h | Local-LLM sovereignty mode, PII redaction, audit log | sovereignty demo works offline |
| 36–42 h | IP map, polish, dark-theme pass, seed/replay script for reliable demo | one-click demo replay |
| 42–48 h | Pitch deck, README, **record a backup demo video**, rehearse the 3-min pitch | you can win even if wifi dies |

---

## 7. The 3-minute pitch (their exact structure: Problem → Solution → Demo → AI → Impact)

- **0:00–0:30 Problem.** Bangladesh is digitizing fast; SMEs, banks, and gov offices face constant attacks but can't afford scarce SOC analysts. Logs are sensitive and shouldn't leave the country.
- **0:30–1:00 Solution.** Prohori — a self-hostable AI SOC that watches your systems and gives you an AI analyst that explains threats in Bangla and English.
- **1:00–2:00 Demo (the money shot).** Trigger a live event against your *own* honeypot/rate limiter → judges watch it hit the feed → you type *"কী ঘটেছে? কতটা বিপজ্জনক?"* ("what happened? how dangerous?") → the Analyst answers in Bangla with an ATT&CK citation and a recommended action.
- **2:00–2:30 AI approach.** LLM triage + MCP agents + RAG over MITRE ATT&CK/CVE; explainable, cited, not hallucinated; local-LLM mode for data sovereignty.
- **2:30–3:00 Impact.** Affordable SOC-in-a-box; builds local cyber capability; scales globally; privacy-first. KPI: mean-time-to-understand an alert drops from minutes to seconds.

---

## 8. Team roles (mandatory in your submission)

Assign all five; one person may hold two. Secure a female member and, if possible, an NRB/diaspora advisor early (both are documented bonus signals).

| Role | Owns |
|---|---|
| Team Leader / Coordinator | Vision, milestones, the demo script |
| Business Analyst / Data Scientist | Problem/KPIs, the ATT&CK/CVE knowledge base, Analyst prompt design |
| UI/UX / Frontend | The operator console, Bangla UI, accessibility, low-bandwidth |
| Backend / Data Engineer | Event API, sensors, pgvector RAG, agent orchestration |
| Presentation / Communication Lead | Pitch deck, demo narration, docs, audit page |

---

## 9. Responsible AI & data sovereignty (a scored component — write it down, don't wing it)

- **Legally sourced data only:** MITRE ATT&CK, NVD, CWE are public. No scraping of private systems.
- **Defensive scope, enforced in code:** asset discovery runs only against a **target allowlist**; anything off-list is refused. Honeypot is **fully simulated and isolated** (no host/network access, never executes commands).
- **Privacy:** PII/secret redaction *before* any data reaches the LLM. In sovereignty mode, nothing leaves the box.
- **Human-in-the-loop:** the Analyst *recommends*; a human approves any response action. No autonomous blocking in the demo.
- **Explainability:** every verdict cites its knowledge-base source, so judges can verify it's grounded, not invented.
- **Auditability:** an append-only audit log of what the AI saw, concluded, and recommended.

---

## 10. Risks & fallbacks

- **No internet at venue / LLM API down:** run Ollama local mode + cached ATT&CK/CVE. (This *is* the sovereignty feature — turn the risk into a selling point.)
- **Live attack demo fails:** ship a **seed/replay script** that pushes a scripted event sequence, so the dashboard and Analyst always have data on stage.
- **Running out of time:** cut per the pre-decided order in §5. Record a backup demo video by hour 42.
- **"Is this just a chatbot?" from a judge:** answer with the architecture diagram — sensors → event bus → RAG-grounded agents → explainable output — and show a citation.

---

*Next: the split Claude build-prompt pack (separate file) — sequential, scoped prompts so the build agent doesn't hallucinate across modules.*
