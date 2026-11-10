# Prohori AI ("প্রহরী") — Official Congress Pitch Deck

**Team**: Team Orionids  
**Event**: International AI Builders Congress 2026  
**Track**: InfraSphere AI &rarr; SecureAI  
**Target Duration**: [FILL: minutes] (Official pitch slot length)  
**Repository**: [https://github.com/rahat4528/prohori-ai](https://github.com/rahat4528/prohori-ai)  
**Companion Artifacts**:
- Visual Deck: [`docs/Prohori_AI_Pitch_Deck.pptx`](file:///c:/diu/docs/Prohori_AI_Pitch_Deck.pptx)
- Judge Q&A Defense Guide: [`docs/JUDGE_QA.md`](file:///c:/diu/docs/JUDGE_QA.md)
- Video Replay Script & Checklist: [`docs/DEMO_VIDEO_SCRIPT.md`](file:///c:/diu/docs/DEMO_VIDEO_SCRIPT.md)

---

## 1. The 8-Slide Visual Deck

```
┌────────────────────────────────────────────────────────────────────────┐
│                        8-SLIDE DECK STRUCTURE                          │
│                                                                        │
│  Slide 1: Hook & User Persona (Arif in Gazipur)                        │
│  Slide 2: Why Existing SOC Tools Fall Short                            │
│  Slide 3: The Solution — Prohori AI Bilingual Analyst (90% Focus)      │
│  Slide 4: Defensive Architecture & 3-Sensor Ingestion (20s Focus)      │
│  Slide 5: Live Incident Triage Demo (Bangla + MITRE Citations)         │
│  Slide 6: Responsible AI: Grounding, Sovereignty & HITL Controls       │
│  Slide 7: Team & Execution Credentials                                 │
│  Slide 8: Commercial Hypothesis & Next Steps (QR Code)                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Slide 1: Hook & User Persona

- **Slide Title**: The Midnight Alarm
- **Visual Blueprint**: Split visual — on the left, an exhausted IT engineer in a server room at 2:00 AM; on the right, a wall of cryptic, red English terminal logs with an alert counter reading `1,420 Unread`.
- **Slide Body Text (Strictly < 15 words)**:
  - Arif, lone IT officer in Gazipur
  - 1,000 cryptic English alerts nightly
  - Breaches missed amidst noise
- **Speaker Script (0:00 - 0:25)**:
  > "Meet Arif. He is the sole IT officer at a 150-person export garment factory in Gazipur. It is 2:00 AM. His firewall is firing thousands of cryptic alerts in technical English. Arif isn't a certified cybersecurity specialist. He has no twenty-person SOC team. Buried inside that noise is an active credential stuffing attack. By morning, his servers are locked. This story repeats every single night across emerging markets."

---

### Slide 2: Why Existing Tools Fall Short

- **Slide Title**: Legacy Tools Fail Emerging Markets
- **Visual Blueprint**: 3 friction icons with comparison breakdown:
  1. Dollar sign with slash: Enterprise SIEM pricing out of reach.
  2. Globe with cloud upload arrow: Cloud SOC exporting national telemetry abroad.
  3. Crossed-out language icon: Zero native Bengali reasoning or plain explanations.
- **Slide Body Text (Strictly < 15 words)**:
  - Six-figure enterprise licensing costs
  - Sovereign telemetry exported overseas
  - Cryptic English-only jargon
- **Speaker Script (0:25 - 0:45)**:
  > "Why can't Arif defend his network? First, legacy enterprise SIEMs cost six figures annually in licensing alone. Second, modern cloud SOCs force organizations to stream sensitive infrastructure logs overseas to third-party data centers, creating severe sovereignty and compliance risks. Third, every commercial tool communicates in impenetrable foreign security jargon. Small organizations are left completely defenseless."

---

### Slide 3: The Solution — Prohori AI

- **Slide Title**: Prohori AI: Sovereign Bilingual Analyst
- **Visual Blueprint**: Center mock-up of the Prohori AI Operator Console displaying an active incident banner with dual-tabbed explanations: English and Bengali (বাংলা), alongside verified MITRE ATT&CK badges.
- **Slide Body Text (Strictly < 15 words)**:
  - Autonomous AI SOC analyst core
  - Fluent Bengali and plain English
  - 100% self-hosted on-premises
- **Speaker Script (0:45 - 1:10)**:
  > "This is Prohori AI ('প্রহরী') — an AI-native, self-hostable SOC analyst built specifically to solve this crisis. Prohori ingests raw alerts and acts as a tireless digital analyst. In seconds, it explains complex cyber threats in clear, jargon-free English and native Bengali. In local mode, Prohori runs entirely inside the organization on local hardware: zero cloud egress, zero third-party dependency, and full national data sovereignty."

---

### Slide 4: Defensive Architecture & 3-Sensor Ingestion

- **Slide Title**: Unified Defensive Ingestion Architecture
- **Visual Blueprint**: Horizontal dataflow diagram:
  - 3 Defensive Sensors (Honeypot, API Abuse Guard, Allowlisted Scanner) &rarr; Event Ingestion Bus (PII Redaction) &rarr; PostgreSQL + pgvector RAG &rarr; AI SOC Analyst Engine &rarr; WebSocket Console.
- **Slide Body Text (Strictly < 15 words)**:
  - 3 sensors feed unified bus
  - Scrubbed telemetry into pgvector RAG
  - Real-time operator WebSocket stream
- **Speaker Script (1:10 - 1:30)**:
  > "Here is our architecture. Three lightweight defensive sensors feed our unified bus: an isolated deception honeypot, an API abuse guard, and an allowlisted scanner. Telemetry passes through an automated PII and credential scrubber before entering our local knowledge base. The AI Analyst correlates the data against local MITRE ATT&CK intelligence and streams prioritized incidents to the operator console in real time."

---

### Slide 5: Live Incident Triage Demo

- **Slide Title**: Live Incident Triage in Native Bengali
- **Visual Blueprint**: Live product screenshot displaying:
  1. Incoming brute force burst alert.
  2. "Ask the Analyst" panel with natural Bengali response citing `[T1110.001]`.
  3. Green "Approve Firewall Block" Human-in-the-Loop button.
- **Slide Body Text (Strictly < 15 words)**:
  - Credential stuffing detected instantly
  - MITRE T1110 cited in Bengali
  - One-click containment approval
- **Speaker Script (1:30 - 2:05)**:
  > "Let's look at the console. We trigger a credential stuffing burst against our decoy. Within 30 milliseconds, Prohori detects the threshold anomaly, aggregates the events, and correlates them into Incident 2026-0001. Look at the explanation panel: Arif can ask in Bengali: 'কী ঘটেছে? কতটা বিপজ্জনক?' The analyst explains in natural Bengali: 'এটি MITRE ATT&CK T1110.001 টেকনিকের সাথে মিলে যায়—পাসওয়ার্ড অনুমানের চেষ্টা।' Arif clicks 'Approve Defense' to enforce the firewall block. Complex defense, executed in thirty seconds."

---

### Slide 6: Responsible AI & Differentiators

- **Slide Title**: Grounded, Auditable, Sovereign AI
- **Visual Blueprint**: 3 shield pillars:
  - Pillar 1: Grounded RAG with strict MITRE ATT&CK & CVE citations (no hallucinations).
  - Pillar 2: 100% On-Premises Sovereignty mode via local Ollama or deterministic offline provider.
  - Pillar 3: Human-in-the-Loop approval gate with append-only audit trail.
- **Slide Body Text (Strictly < 15 words)**:
  - Strict MITRE/CVE citation grounding
  - Zero cloud egress in offline mode
  - Append-only audit trail
- **Speaker Script (2:05 - 2:25)**:
  > "Prohori is built on strict Responsible AI principles. First, no hallucination: our model is anchored to a retrieved vector database of MITRE ATT&CK and CVE records, citing exact technique IDs. Second, data privacy: in local mode, zero bytes leave the premises. Third, human safety: the AI recommends actions, but only an authorized operator can approve containment. Every decision is preserved in an append-only audit log."

---

### Slide 7: Team Orionids & Execution Credentials

- **Slide Title**: Team Orionids: Mission & Execution
- **Visual Blueprint**: 4-person team profile card table highlighting engineering discipline, full-stack capability, and local context.
- **Slide Body Text (Strictly < 15 words)**:
  - Dedicated cross-functional technical builders
  - Direct local domain experience
  - Production-tested hackathon delivery
- **Speaker Script (2:25 - 2:40)**:
  > "We are Team Orionids, a focused team of builders combining full-stack engineering, cybersecurity domain experience, and AI systems development. We built Prohori specifically to address the security deficit in emerging markets, delivering a battle-tested prototype backed by 32 passing automated tests, sub-35 millisecond RAG response times, and production-ready microservice packaging."

---

### Slide 8: Commercial Hypothesis & Next Steps

- **Slide Title**: Scalable Impact & Deployment Roadmap
- **Visual Blueprint**: Left: 2-tier distribution model (Open-Source Community Core vs. Enterprise On-Prem License). Right: Large high-contrast QR code linking directly to the GitHub repository and interactive demo.
- **Slide Body Text (Strictly < 15 words)**:
  - Free community open-source tier
  - Enterprise bank on-premise hypothesis
  - Scan to inspect repository
- **Speaker Script (2:40 - 3:00)**:
  > "Our rollout strategy centers on a dual-tier model: a free, self-hostable Community Edition to empower local universities and SMEs, alongside a commercial hypothesis of $1,200 per node annually for regulated institutions requiring custom compliance support. Prohori AI transforms cybersecurity from an exclusive luxury into an accessible, sovereign shield. On behalf of Team Orionids, scan our QR code to review our repository and live demo. Thank you."

---

## 2. Rehearsal Timing Table & Segment Budget

> [!IMPORTANT]
> The target presentation budget is designed to finish at **~90% of the allocated slot length** to guarantee you never run over time and always preserve buffer for judge interruptions.

### A. Segment Budget Matrix

| Slide # | Slide Focus | 3-Minute Slot (180s) | 5-Minute Slot (300s) | Ideal Buffer Remaining |
|---|---|---|---|---|
| **Slide 1** | Hook & Arif Persona | 0:00 - 0:25 (25s) | 0:00 - 0:40 (40s) | On track |
| **Slide 2** | Why Legacy Tools Fail | 0:25 - 0:45 (20s) | 0:40 - 1:15 (35s) | On track |
| **Slide 3** | Solution: Prohori AI | 0:45 - 1:10 (25s) | 1:15 - 1:55 (40s) | On track |
| **Slide 4** | Defensive Architecture | 1:10 - 1:30 (20s) | 1:55 - 2:30 (35s) | On track |
| **Slide 5** | Live Incident Demo (Bangla) | 1:30 - 2:05 (35s) | 2:30 - 3:30 (60s) | Critical money shot |
| **Slide 6** | Responsible AI & Grounding | 2:05 - 2:25 (20s) | 3:30 - 4:05 (35s) | On track |
| **Slide 7** | Team Credentials | 2:25 - 2:40 (15s) | 4:05 - 4:30 (25s) | On track |
| **Slide 8** | Commercial Hypothesis & QR | 2:40 - 2:55 (15s) | 4:30 - 4:50 (20s) | 10-15s safety margin |
| **Total** | **Finish at 90% Target** | **2:55 / 3:00** | **4:50 / 5:00** | **10–15s safe finish** |

### B. Timed Rehearsal Tracking Log

*Run 3 to 5 full timed dry runs with a physical stopwatch. Record elapsed times below:*

| Run # | Date / Time | Allocated Slot | Actual Elapsed Time | Pace Assessment | Adjustments Made |
|---|---|---|---|---|---|
| Run 1 | [FILL: Date/Time] | [FILL: 180s / 300s] | [FILL: e.g., 3:18] | Too slow on Slide 4 | Trimmed architecture jargon; shifted 15s to demo |
| Run 2 | [FILL: Date/Time] | [FILL: 180s / 300s] | [FILL: e.g., 2:58] | Good, but rushed demo | Paused for 3 seconds to let Bengali text sink in |
| Run 3 | [FILL: Date/Time] | [FILL: 180s / 300s] | [FILL: e.g., 2:51] | Target zone | Clean transition between Speaker and Driver |
| Run 4 | [FILL: Date/Time] | [FILL: 180s / 300s] | [FILL: e.g., 2:53] | Consistent delivery | Verified backup video trigger keybinds |
| Run 5 | [FILL: Date/Time] | [FILL: 180s / 300s] | [FILL: e.g., 2:50] | Confident, relaxed | Prepared for immediate transition to Judge Q&A |

---

## 3. Stage Plan & Delivery Roles

### Option A: Two-Presenter Team (Recommended)

1. **Presenter 1 (Voice & Narrative Lead)**:
   - Positions themselves stage center-left, facing the judges directly.
   - Maintains continuous eye contact with judges; never looks back at the projection screen.
   - Owns Slides 1, 2, 3, 6, 7, and 8.
   - Introduces the demo on Slide 5 and articulates the value proposition while Driver operates.
2. **Presenter 2 (Demo Driver & Technical Lead)**:
   - Sits or stands at the presentation podium with the laptop connected to the projector.
   - Responsible for slide transitions via remote or keyboard.
   - On Slide 5, executes the live demo or switches seamlessly to the pre-loaded 60-second backup video if the projector or network glitches.
   - Leads technical judge questions regarding database indexing, pgvector RAG, and microservice isolation.

### Option B: Solo Presenter Variant

- **Setup**: Position laptop on a high stand so you look over the screen directly at the judges without hunching down.
- **Controls**: Use a wireless presentation clicker with forward/back controls to advance slides without touching the laptop keyboard.
- **Demo Transition**: Keep the Operator Console open in a full-screen browser window (`F11`) on Virtual Desktop 2 (`Win + Ctrl + Right Arrow`). Slide 5 transitions with one single keystroke.
- **Pacing**: Speak at 130–140 words per minute. Take a deliberate 1-second pause when showing the Bengali narrative to let judges visually register the script.

### Room Energy & Eye Contact Strategy
- **The "Triangle Rule"**: Divide the judging panel into three focal points (Left Judge, Center Judge, Right Judge). Rotate your focus every 10–15 seconds.
- **Handling Interruptions**: If a judge asks a question mid-pitch, stop speaking immediately, acknowledge with a smile (*"Excellent point, sir"*), give a concise 10-second answer, and immediately resume your slot budget.

---

## 4. Engineering Architecture & Framework Grounding

### A. Independent Student Research & Standards Alignment

Prohori AI was conceptualized and built independently by **Team Orionids** (Daffodil International University, Department of Computer Science & Engineering) without an assigned industry corporate mentor. In lieu of commercial mentorship, the team strictly aligned the engineering architecture with international open defensive frameworks and rigorous academic peer reviews:

| Foundation Area | Guidance Framework | Architectural Principle Enforced | Status in Code |
|---|---|---|---|
| **Threat Classification** | MITRE ATT&CK v15 (Enterprise) | Every triage verdict maps to explicit STIX technique IDs (`T1110.001`, `T1595.002`, `T1499.002`) | ✅ Grounded |
| **Vulnerability Scoring** | NIST NVD CVE & CVSS v3.1 | Asset discovery correlates banners against verified CVE records (`CVE-2023-38606`) | ✅ Verified |
| **Data Sovereignty** | Bangladesh National Cyber Security Act & NIST CSF 2.0 | Dual-mode: Local offline mode guarantees zero packet egress; cloud mode (Gemini) is explicitly opt-in | ✅ Enforced |
| **Human-in-the-Loop** | Responsible AI Principles | The AI analyst *recommends* containment; human operator approval is mandatory before any firewall action | ✅ Enforced |

---

## 5. Team Orionids Roster & Academic Credentials

All team members are undergraduate students from **Daffodil International University (DIU)**, **Department of Computer Science & Engineering (CSE)**:

| Member / Role | Focus Area | Hackathon Credibility & Contributions | Academic Affiliation |
|---|---|---|---|
| **Member 1: [FILL: name]** | [FILL: role] | [FILL: one credibility line] | Department of CSE, Daffodil International University |
| **Member 2: [FILL: name]** | [FILL: role] | [FILL: one credibility line] | Department of CSE, Daffodil International University |
| **Member 3: [FILL: name]** | [FILL: role] | [FILL: one credibility line] | Department of CSE, Daffodil International University |

**Bonus Signals Checklist (per Congress Guidelines):**
- Female team member: `[FILL: None - all male]`
- Diaspora / NRB Advisor: `[FILL: None yet]`

---

## 6. Commercial Model & Distribution Hypothesis

> [!NOTE]
> The pricing tiers below are presented as an **unvalidated commercial hypothesis** formulated for the hackathon business rubric, pending direct enterprise customer discovery and validation.

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│          COMMUNITY CORE (OSS)         │         ENTERPRISE ON-PREMISES        │
│                $0 / Free              │         $1,200 / node / year          │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Full self-hostable Docker stack     │ • Everything in Community Core        │
│ • Local Ollama / Llama 3.2 engine     │ • Multi-node cluster orchestration    │
│ • 3 defensive sensor integrations     │ • Custom threat intelligence feeds    │
│ • Bilingual English + Bangla triage   │ • Priority CVE auto-sync integrations │
│ • Append-only SQLite/Postgres audit   │ • Guaranteed 24/7 SLA & compliance    │
│ • Community Discord support           │ • Dedicated deployment engineering    │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

- **Target Audience**:
  - Community: Universities, tech startups, individual developers, open-source researchers.
  - Enterprise Hypothesis: RMG exporters, mid-market banks, healthcare clinics, municipal agencies.
- **Repository QR Code**: [`docs/assets/repo_qr_code.png`](file:///c:/diu/docs/assets/repo_qr_code.png)
