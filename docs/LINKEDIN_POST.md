# Prohori AI ("প্রহরী") — LinkedIn Post & Social Media Kit

> [!CAUTION]
> **DRAFT ONLY — DO NOT AUTO-PUBLISH**.  
> In accordance with the ground rules, this document contains prepared drafts for review. Do not publish, tweet, or submit until you have verified all team tags, URLs, and attached media assets.

---

## 1. Primary LinkedIn Submission Post Draft

**Target Format**: *"Built X in [duration] at International AI Builders Congress 2026 solving Y"*

```markdown
🚨 Can an AI SOC analyst explain a complex cyber attack in native Bengali in under 35 milliseconds?

At the International AI Builders Congress 2026, Team Orionids built and demonstrated Prohori AI ("প্রহরী") — a self-hostable, bilingual (Bangla + English) AI SOC Analyst engineered for emerging markets and national data sovereignty.

In countries like Bangladesh, thousands of SMEs, universities, and public sector offices are digitizing at breakneck speed. But when a cyber attack hits at 2:00 AM, lone IT administrators are overwhelmed by cryptic, English-only alert jargon, while enterprise SIEM licenses cost six figures. Worse, cloud SOCs export sensitive national telemetry across foreign borders.

Here is how Prohori AI changes the game:

🛡️ 1. Bilingual AI SOC Analyst Core: Ingests raw telemetry and generates natural-language incident narratives in plain English AND native Bengali (বাংলা). IT officers can ask: "কী ঘটেছে? কতটা বিপজ্জনক?" and receive a cited, natural-language explanation instantly.
📚 2. Grounded Threat Intelligence (No Hallucinations): Every verdict is grounded in a local pgvector RAG store indexing MITRE ATT&CK techniques, NIST CVE records, and CWE weaknesses, complete with verified citation badges.
🔒 3. 100% On-Premises Data Sovereignty: Runs completely offline using local models (Ollama / Llama 3.2 or deterministic offline RAG). In default sovereignty mode, zero bytes leave the organization's network.
⚡ 4. Real Measured Performance: 30.44 ms median steady-state analysis latency on local commodity hardware (AMD Ryzen 7 PRO 4750U), verified across 20 live automated replay alerts.
🤝 5. Human-in-the-Loop Safety: The AI recommends containment actions, but cannot execute them unilaterally. Operators approve actions with one click, permanently recorded in an append-only audit log.
📡 6. 3 Defensive Sensor Feeds: Fed by an isolated deception honeypot, a token-bucket API abuse guard, and an allowlisted asset scanner.

Proud of our team — Team Orionids from Daffodil International University (Department of CSE) — for conceptualizing, building, and verifying this prototype with 34 passing automated tests, a modern React 19 console, and a high-performance FastAPI backend!

Huge shoutout to my fellow Team Orionids builders at Daffodil International University (DIU):
👥 Member 1: [FILL: name] ([FILL: role])
👥 Member 2: [FILL: name] ([FILL: role])
👥 Member 3: [FILL: name] ([FILL: role])
(Single source of truth maintained in docs/TEAM.md)

Built independently as a student team adhering strictly to MITRE ATT&CK v15 and NIST CSF 2.0 defensive standards.

Check out our open-source repository, pitch deck, and architecture docs here:
🔗 https://github.com/rahat4528/prohori-ai

#TeamOrionids #Cybersecurity #ArtificialIntelligence #ResponsibleAI #DataSovereignty #BilingualAI #InfraSphere #BanglaNLP #MITREAttack #GovTech #AIBuildersCongress2026
```

---

## 2. Social Media Assets Checklist

Prepare and attach the following visual assets to the LinkedIn post:

| # | Asset Type | File / Source | Description | Status |
|---|---|---|---|---|
| 1 | **Hero Screenshot (Bengali Reasoning)** | Capture from `http://localhost:3000` | High-resolution capture of the "Ask the Analyst" drawer showing the question *"কী ঘটেছে? কতটা বিপজ্জনক?"* and the streaming Bengali response with blue `[T1110.001]` MITRE badge. | [FILL: Attach image] |
| 2 | **Console Overview** | Capture from `http://localhost:3000` | Full dashboard view showing dark SOC theme, live incident banner `INC-2026-0001`, and color-coded event stream. | [FILL: Attach image] |
| 3 | **Architecture Diagram** | Graphic from `docs/ARCHITECTURE.md` | Flow diagram illustrating the 3 sensors &rarr; PII scrubber &rarr; pgvector RAG &rarr; AI Analyst &rarr; Console. | [FILL: Attach image] |
| 4 | **Human-in-the-Loop & Audit Log** | Capture from `http://localhost:3000` | Side-by-side view showing the green "Approve Defense" button and the opened Audit Log drawer with append-only entries. | [FILL: Attach image] |
| 5 | **Demo Video Clip (Optional)** | 15–30s trimmed clip from `docs/assets/prohori_demo_backup_75s.mp4` | Short video showing real-time event streaming and rapid Bengali narrative generation. | [FILL: Attach video] |
| 6 | **Team Photo** | Photo of team at workstation | Working photo showing the laptop running the Prohori console. | [FILL: Attach photo] |

---

## 3. Post-Hackathon Retrospective Story Draft

*(Save this draft to publish 24–48 hours after the congress concludes, sharing deeper technical learnings)*

```markdown
Title: What We Learned Building a Sovereign Bilingual AI SOC in 48 Hours

Building Prohori AI ("প্রহরী") for the International AI Builders Congress 2026 taught our team three crucial lessons about the intersection of cybersecurity, regional language AI, and data sovereignty:

1. Translating Cyber Jargon into Bengali Isn't Enough — It Must Be Grounded:
Early on, generic LLM translations produced awkward phonetic transliterations of security jargon. We solved this by structuring our RAG pipeline to retrieve authoritative MITRE ATT&CK technique descriptions and NIST CVE definitions first, then prompting our model to explain the tactical *intent* in native Bengali while preserving canonical technique IDs like [T1110.001].

2. Data Sovereignty is an Engineering Constraint, Not a Buzzword:
Many AI SOC solutions claim privacy while quietly sending prompts to cloud APIs. By implementing Ollama (Llama 3.2) and a deterministic offline RAG fallback, we proved that an organization can run high-precision threat analysis without a single byte of telemetry ever leaving the building. On an AMD Ryzen 7 PRO, steady-state analysis clocked in at just 30.44 milliseconds.

3. Responsible AI Demands Human Gates for Destructive Actions:
Autonomous AI agents that execute firewall blocks or revoke credentials without oversight create massive operational risk. Enforcing a strict Human-in-the-Loop approval gate with append-only audit logging turned a prototype into an enterprise-ready defensive tool that security officers can trust.

What's next for Prohori?
- Automated scheduled synchronization with the live NIST NVD API.
- Native Wazuh and Syslog agent ingestion adapters.
- Field testing with university CS network labs in Bangladesh.

Special thanks to our mentors and organizers at the International AI Builders Congress 2026!
```

---

## 4. Discord & Mentor Outreach Messages

Use these polite, structured message templates when reaching out to mentors and community members on the official Congress Discord server:

### Template A: Mentor Review Request (10-Minute Feedback)
```
Hi [FILL: Mentor Name],

Our team is building Prohori AI ("প্রহরী") in the InfraSphere AI / SecureAI track. We’ve built a self-hostable, bilingual (Bangla + English) AI SOC analyst with on-premises data sovereignty and MITRE ATT&CK grounding.

The prototype is live with 34 passing tests and a working React console. If you have 10 minutes today, we would be deeply grateful to get your feedback on our architecture and presentation flow:
1. Does our on-premises Ollama mode clearly address public sector data sovereignty concerns?
2. How can we make our live bilingual triage demo even more impactful for the judging panel?

Repository & docs: https://github.com/rahat4528/prohori-ai
Console preview: [FILL: Quick Loom / Screenshot link]

Thank you for your time!
```

### Template B: Hackathon Showcase Channel Intro
```
👋 Team Prohori AI ("প্রহরী") is presenting in the SecureAI track!

🚨 The Problem: Most SMEs and public institutions cannot afford a dedicated SOC team, and legacy SIEMs export sensitive national telemetry overseas while speaking only cryptic English jargon.
🛡️ The Solution: Prohori AI — a self-hostable, bilingual AI SOC analyst that ingests data from 3 lightweight defensive sensors, triages incidents in 30ms, and explains threats in clear Bengali and English with verified MITRE citations.
🔒 Sovereign by design: Runs 100% on-premises via local Ollama. Zero cloud data egress.

Check out our repo & pitch deck: https://github.com/rahat4528/prohori-ai
Looking forward to sharing our live demo!
```

