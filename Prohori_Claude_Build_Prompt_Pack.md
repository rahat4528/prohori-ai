# Prohori AI — Claude Build Prompt Pack (split to prevent hallucination)

**How to use this:** run these prompts **in order**, one per turn, in Claude Code (or this harness). Each is self-contained and scoped to one module so the agent never has to hold the whole system in its head at once. At the start of each prompt, **load the listed skills** (type `/` or call the Skill tool with the slug). Finish each part, verify it runs, commit, then move to the next. Don't paste two parts in one message.

**Golden rules to repeat to the agent (keep hallucination down):**
- Build only what the current part asks. Do not scaffold future modules early.
- Everything is **defensive and lab-scoped**: discovery runs only against an allowlist of the team's own hosts; the honeypot is **fully simulated and isolated** (no host/network access, never executes real commands). Refuse anything outside this scope.
- All services must be **free-tier only**. No paid plans, no paid domains.
- If something is ambiguous, ask one question — do not invent an API, a library version, or a data source.
- Every event conforms to the shared schema. If a change needs the schema, update it in one place.

---

## PROMPT 0 — Project context & guardrails (paste once, at the very start)

> **Skills to load:** `engineering:system-design`, `engineering:architecture`
>
> You are helping build **Prohori AI**, an AI-native, self-hostable Security Operations Center for a university hackathon (International AI Builders Congress 2026, InfraSphere AI → SecureAI domain). It is a **defensive** project demonstrated only against our own lab machines.
>
> **The product is the AI SOC Analyst** — an LLM + agent layer that reads a stream of security events from four defensive sensors and produces analyst-grade, *explainable, cited* output in English and Bangla. The sensors (asset discovery, simulated honeypot, API rate limiter, and the dashboard) are supporting parts, not the point.
>
> **Hard constraints:**
> - Free-tier services only: Python/FastAPI, Supabase (Postgres + pgvector), Groq or Gemini free API for the LLM (Ollama for a local/offline mode), React + Vite frontend, Docker Compose.
> - Defensive scope enforced in code: discovery only against a configured **target allowlist**; honeypot is simulated and container-isolated and never executes real commands.
> - One shared event schema across all modules (defined in Prompt 1).
> - Explainability is a judging requirement: the Analyst must cite its knowledge-base source for every verdict and must not state threat facts it cannot ground.
>
> **Do not write any code yet.** Confirm you understand the scope, then propose a repo/folder structure (monorepo: `api/`, `sensors/`, `analyst/`, `web/`, `infra/`, `knowledge/`) and the list of modules we'll build in order: (1) Event API + schema + store, (2) Deception + Rate-limit sensors, (3) AI SOC Analyst + RAG, (4) Dashboard, (5) Asset discovery + correlation, (6) Sovereignty mode + audit. Wait for my go-ahead.

---

## PROMPT 1 — Event API, shared schema, data store

> **Skills to load:** `docker-skills:docker-project-foundations`, `docker-skills:docker-compose-patterns`
>
> Build **only** the Event API and the data layer. Nothing else.
>
> 1. FastAPI app in `api/`. Endpoints: `POST /events` (ingest one event), `GET /events` (filter by source/severity/time, paginated), `GET /events/{id}`, and a `GET /healthz`.
> 2. Define the **shared event schema** as a Pydantic model and persist it to Postgres. Fields: `id` (uuid), `ts` (ISO 8601), `source` (`scanner|honeypot|ratelimiter|analyst`), `severity` (`info|low|medium|high|critical`), `type` (string), `details` (JSONB), plus `analyst` (nullable JSONB, filled later by the AI). Export this model as the single source of truth other modules import.
> 3. Use **Supabase Postgres** with the **pgvector** extension enabled (we'll use vectors in Prompt 3 — create the extension now, no embeddings yet).
> 4. A `WebSocket /stream` endpoint that broadcasts each newly ingested event to connected clients.
> 5. `docker-compose.yml` in `infra/` running the API and a local Postgres (with pgvector) for development, plus a `.env.example`. Keep secrets out of the repo.
>
> Add a `scripts/seed_events.py` that posts a few sample events of each source/severity so the pipeline is testable. Verify: `docker compose up`, post a seed event, see it in `GET /events` and on the WebSocket. Then stop — do not build sensors yet.

---

## PROMPT 2 — Defensive sensors: Deception sensor + API Abuse Guard

> **Skills to load:** `docker-skills:docker-build-strategies`, `docker-skills:docker-compose-patterns`
>
> Build **two** sensors that emit events to the Event API using the shared schema. Both are defensive and run in isolated containers.
>
> **A. Deception Sensor (simulated honeypot)** in `sensors/deception/`:
> - Presents a **fully simulated** fake login surface (e.g., a fake admin HTTP login page) that accepts any credentials after a short delay and returns a **simulated, static** response. It must **never execute any real command**, never touch the host filesystem or network, and run in a container with no host access.
> - On each interaction, emit an event: source `honeypot`, type e.g. `login_attempt`, details = `{ source_ip, username_tried, password_tried, user_agent, ts }`. Tag obvious patterns (repeated attempts → `brute_force_suspected`).
> - Document clearly in code comments that this is a deception sensor for our own lab only.
>
> **B. API Abuse Guard (rate limiter)** in `sensors/ratelimiter/`:
> - A token-bucket or sliding-window limiter (in-memory is fine for the demo) that protects the Event API itself. On a blocked request, return `429` with `Retry-After` and emit an event: source `ratelimiter`, type `blocked_request`, details = `{ source_ip, path, window, count }`.
> - Escalation: warn → temporary block → longer block for repeat offenders. Include a simple allow/deny list.
>
> Add `scripts/demo_traffic.py` that generates benign test traffic against **our own** endpoints to make both sensors fire on demand during a demo. Wire both into `docker-compose.yml`. Verify events reach `GET /events` and the WebSocket. Do not build the Analyst yet.

---

## PROMPT 3 — The AI SOC Analyst core + RAG knowledge base (the differentiator)

> **Skills to load:** `engineering:architecture`, `data:build-dashboard` *(for the data/query patterns)*
>
> This is the product. Build the **AI SOC Analyst** in `analyst/`.
>
> 1. **Knowledge base (RAG):** in `knowledge/`, write an ingestion script that loads **MITRE ATT&CK** (public STIX bundle) and a cached subset of **NVD CVE** + **CWE** entries, chunks them, embeds them, and stores vectors in **pgvector**. Keep the raw files in a local cache so it works **offline** (no-internet fallback). Use a free embedding option (e.g., a sentence-transformers model locally, or the free-tier embeddings of the chosen provider).
> 2. **Triage agent:** given a new event, classify severity (reconciling the sensor's raw severity), and write a one-paragraph **natural-language narrative**: what happened, why it matters, confidence. It must **retrieve from the KB first** and **cite the source** (ATT&CK technique ID / CVE ID). If it can't ground a claim, it says so rather than inventing.
> 3. **Correlation agent:** given recent events, link related ones (same source IP, same campaign) into an "incident" and summarize the chain.
> 4. **Response-advisor:** suggests defensive next steps (e.g., "block IP at the edge," "rotate the honeypot") as *recommendations only* — flagged for human approval, never auto-executed.
> 5. **Bilingual output:** every narrative available in **English and Bangla** via a language flag.
> 6. Orchestrate these as tools/agents (MCP-style). LLM = Groq or Gemini free tier by default; keep the provider behind an interface so we can swap in **Ollama local** in Prompt 6.
> 7. Expose: `POST /analyst/triage/{event_id}`, `POST /analyst/ask` (free-text question like "explain the last critical event" → grounded, cited answer), and have triage auto-run on ingest, writing results back into the event's `analyst` field.
>
> **Before any LLM call, redact PII/secrets from `details`.** Verify: post a honeypot event → triage returns a cited Bangla + English narrative → `POST /analyst/ask` answers a plain-language question with a citation. Do not build the frontend yet.

---

## PROMPT 4 — Operator console (dashboard) — not an "AI-slop" landing page

> **Skills to load:** `anthropic-skills:frontend-design`, `dataviz`
>
> Build the **React + Vite** operator console in `web/`. This is dense, dark-theme, information-first — a real SOC console, **not** a marketing landing page. No hero gradients, no filler.
>
> Panels:
> - **Live event feed** (via the `/stream` WebSocket) with severity colour lanes.
> - **Top counters:** events by severity, honeypot hits, blocked requests, open incidents.
> - **"Ask the Analyst"** panel — the centerpiece: a text box where a judge types a question and gets the grounded, **cited** answer streamed back, with an **EN / বাংলা** toggle.
> - **Incident timeline** (events per minute) and a **recent incidents** list from the correlation agent.
> - **Event detail drawer:** raw event + the Analyst's narrative + citations + recommended (human-approval) actions.
>
> Use `dataviz` guidance for the charts (consistent, accessible, dark-mode-correct palette). Use Recharts or similar. Keep it fast and legible on a projector. Verify the whole pipeline live: trigger demo traffic → events stream in → ask the Analyst → cited bilingual answer appears. Commit a working end-to-end demo.

---

## PROMPT 5 — Asset Discovery sensor (allowlisted) + CVE enrichment + correlation polish

> **Skills to load:** `engineering:code-review`, `engineering:testing-strategy`
>
> Build the third sensor in `sensors/discovery/` — **defensive asset discovery against our own lab only.**
>
> 1. Input: an IP/hostname/CIDR **that must be on a configured target allowlist**. Enforce the allowlist in code: anything off-list is refused with a clear error and an audit entry. This guard is mandatory and non-negotiable.
> 2. Discover reachable services on **our own** allowlisted hosts and record host, port, state, and service/version banner into events (source `scanner`, type `open_port` / `service_identified`).
> 3. **CVE enrichment:** match identified service versions against the cached NVD data from Prompt 3 and attach matches + a CVSS-derived severity. Emit `cve_match` events. Cache locally so it works offline.
> 4. Feed these into the correlation agent so discovery findings link with honeypot/rate-limit activity into richer incidents.
>
> Add tests (per `testing-strategy`) for the allowlist guard especially — prove off-list targets are refused. Run `code-review` over the sensor before finishing. Wire into Compose. Verify against your own lab host only.

---

## PROMPT 6 — Data-sovereignty mode (local LLM) + PII redaction + audit log

> **Skills to load:** `engineering:architecture`, `engineering:deploy-checklist`
>
> Harden the privacy/sovereignty story — a directly scored judging component.
>
> 1. **Local-LLM mode:** implement the provider interface's **Ollama** backend (e.g., Llama 3.2 / Qwen) so the entire Analyst runs offline with no data leaving the machine. A single config flag switches between cloud free-tier and local. Confirm triage + ask both work with internet disconnected.
> 2. **PII/secret redaction:** centralize the redaction step so *nothing* reaches any LLM (cloud or local) before scrubbing. Add tests with sample secrets.
> 3. **Audit log:** append-only log of every Analyst action — input event, retrieved citations, verdict, recommendation, model used, timestamp. Expose `GET /audit` and a read-only audit view in the dashboard.
> 4. **Human-in-the-loop:** ensure no response action can execute automatically; the dashboard "approve" button is the only path, and approvals are audited.
>
> Run the `deploy-checklist` skill and produce a short readiness checklist. Verify the full offline demo path works (this doubles as the no-internet-at-venue fallback).

---

## PROMPT 7 — Demo reliability, docs, pitch deck, backup video

> **Skills to load:** `engineering:documentation`, `anthropic-skills:pptx` *(or make Slides)*, `anthropic-skills:pdf`
>
> Make it demo-proof and submission-ready.
>
> 1. **Replay script:** `scripts/demo_replay.py` that pushes a scripted, realistic event sequence (recon → brute force → rate-limit block → CVE match) so the dashboard and Analyst always have a compelling story even if the live attack demo misbehaves.
> 2. **README** (per `documentation`): architecture diagram (reuse the one from the plan), setup, `docker compose up`, the demo script, the defensive-scope + responsible-AI statement, and the free-tier service list.
> 3. **Pitch deck** for `/pitchdeck` and a `/presentation` page following the guide's structure: Problem → Solution → Demo → AI approach → Impact → Business model → Scalability. Y-Combinator-style, tight.
> 4. **`/architecture`, `/data`, `/security`, `/audit` pages or doc sections** describing the pipeline, data sources + lineage (ATT&CK/NVD/CWE), security controls, and the one-click audit — these map to the Congress's required submission components.
> 5. Write the **3-minute pitch script** verbatim and a shot list for a **backup demo video**; record it.
>
> Verify every claim in the deck is actually true in the build (no fabricated demos — that's a disqualifier). Final commit.

---

## Skill → part quick reference

| Part | Primary skills |
|---|---|
| 0 Context | system-design, architecture |
| 1 Event API | docker-project-foundations, docker-compose-patterns |
| 2 Sensors | docker-build-strategies, docker-compose-patterns |
| 3 AI Analyst + RAG | architecture, data:build-dashboard |
| 4 Dashboard | frontend-design, dataviz |
| 5 Discovery + CVE | code-review, testing-strategy |
| 6 Sovereignty + audit | architecture, deploy-checklist |
| 7 Docs + deck | documentation, pptx/pdf (or Slides) |

**Commit discipline:** finish a part → verify it runs → commit → next part. Never run two parts in one prompt. If a part gets big, split it further rather than letting the agent guess.
