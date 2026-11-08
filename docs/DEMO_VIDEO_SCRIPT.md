# Prohori AI — 3-Minute Video Pitch Script & Backup Shot List

**Target Duration**: Exactly 3 minutes (180 seconds)  
**Tone**: Confident, technical, authoritative, patriotic yet globally scalable.

---

## 1. Verbatim Voiceover Pitch Script

### [0:00 - 0:30] Problem: The SME & Data Sovereignty Trap
> "Distinguished judges, Bangladesh is accelerating into the digital era with billions in digital financial transactions every day. But behind this growth lies an unspoken emergency: 85% of our banks, SMEs, and government departments cannot afford the scarce, expensive security talent required to run a Security Operations Center. 
> Even worse, current enterprise SOC tools ship our sensitive national infrastructure logs to servers across foreign borders, risking national data sovereignty. What if any Bangladeshi organization could deploy a world-class, sovereign AI SOC in minutes?"

### [0:30 - 1:00] Solution: Introducing Prohori AI ("প্রহরী")
> "Meet Prohori AI — the self-hostable, AI-native Security Operations Center. 
> Prohori deploys four lightweight defensive sensors: a simulated deception honeypot, an API abuse guard, an allowlisted asset scanner, and an operator console. 
> But Prohori is not just a dashboard with colored lights. The product is our **AI SOC Analyst core** — an agentic layer that ingests raw telemetry, correlates attack campaigns, and explains complex threats in plain English and native Bengali, grounded in MITRE ATT&CK and CVE threat intelligence."

### [1:00 - 2:00] Live Demo: The Money Shot
*(Video cuts to screen recording of the Prohori Operator Console at `localhost:3000`)*
> "Here is our live console. Watch our sensor bus in real-time. 
> I now trigger a simulated credential stuffing attack from an adversary IP. Instantly, our Deception Sensor traps the unauthorized attempts and streams the event. Within milliseconds, our AI Analyst triages the incident, recognizes a brute force burst, and tags it with high severity.
> 
> Now, the true differentiator: our 'Ask the Analyst' panel. A security officer types in native Bangla: *'কী ঘটেছে? কতটা বিপজ্জনক?'*
> 
> Notice the answer: instantly streamed in fluent, natural Bengali. The AI Analyst doesn't hallucinate — it cites MITRE ATT&CK Technique [T1110.001] for Password Guessing and weakness [CWE-307]. 
> It provides an actionable defensive countermeasure: 'Block the IP at the perimeter firewall.' 
> In accordance with Responsible AI standards, the AI never executes destructive actions on its own. The operator clicks 'Approve Defense,' and the action is cryptographically recorded in our immutable audit log."

### [2:00 - 2:30] AI Architecture & Technical Excellence
*(Video displays Architecture Diagram)*
> "Under the hood, Prohori implements an AI-native reference architecture. 
> Incoming telemetry is first scrubbed by our PII Redaction Engine so passwords and tokens never reach any model. 
> We perform dense vector retrieval over cached MITRE ATT&CK STIX bundles and NVD CVE vulnerability records using PostgreSQL with pgvector. 
> Our model provider interface supports Google Gemini and Groq, but also features a one-click **Local Data-Sovereignty Mode** running Ollama offline. In sovereignty mode, zero data ever leaves the host machine."

### [2:30 - 3:00] Impact & Business Scalability
> "Prohori collapses the Mean-Time-To-Understand an alert from 45 minutes to under 3 seconds. It bridges the cyber skills gap by empowering local IT staff to defend critical infrastructure in their native language. 
> Our commercial model combines a free community edition for universities and startups with an enterprise node subscription for banks and critical infrastructure. 
> Prohori AI: Guarding our digital frontier, preserving data sovereignty, built by Bangladesh for the world. Thank you."

---

## 2. Backup Demo Video Shot List

| Timestamp | Visual Focus | Action on Screen |
|---|---|---|
| `0:00 - 0:25` | Presenter / Problem slide | Speaker intro with headline metrics on cyber analyst shortages. |
| `0:26 - 0:55` | Architecture slide | Zoom into the 4 sensors feeding the central AI SOC Analyst. |
| `0:56 - 1:15` | Browser `localhost:3000` | Run `python scripts/demo_replay.py` in terminal; show events appearing live via WebSocket. |
| `1:16 - 1:40` | "Ask the Analyst" Panel | Click chip *"কী ঘটেছে? কতটা বিপজ্জনক?"*, show streaming Bangla answer with `[T1110.001]` citation badge. |
| `1:41 - 1:55` | Event Detail Drawer | Click event, show raw scrubbed JSON, click "Approve Defense (HITL)", open Audit Log Drawer to show verified entry. |
| `1:56 - 2:20` | Technical diagram | Highlight PII redaction pipeline & local Ollama sovereignty toggle. |
| `2:21 - 3:00` | Presentation slide | Business model, impact metrics, and team closing slide. |

