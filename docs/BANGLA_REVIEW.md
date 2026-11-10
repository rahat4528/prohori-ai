# Prohori AI — Bilingual (Bengali & English) Native Speaker Review Pack

> **Review Notice**: Automated AI coding agents cannot verify linguistic fluency, cultural naturalness, or subjective clarity of native Bengali text. This document is the official review pack prepared for human verification by a native Bengali speaker from **Team Orionids (Daffodil International University, Dept. of CSE)**.
> **DO NOT SUBMIT AS VERIFIED** until a human reviewer has evaluated each row, filled the checklist columns, and signed at the bottom.

---

## Evaluation Criteria
1. **Accuracy**: Does the Bengali text accurately reflect the technical facts described in the English text without hallucination or omitting critical context?
2. **Fluency**: Does the Bengali sentence structure read naturally to a native speaker, avoiding awkward machine-literal phrasing?
3. **Terminology**: Are technical identifiers (CVE IDs, MITRE ATT&CK techniques, IP addresses, protocol names) preserved cleanly without corruption, while defensive terms are translated appropriately?
4. **Actionability**: Is the recommended mitigation instruction clear, actionable, and authoritative?

---

## Review Matrix (10 Sample Runs)

| # | Mode / Provider | Attack Scenario & Telemetry | English Narrative & Recommendation | Bengali Translation (বাংলা) | Accurate? (Y/N) | Fluent? (Y/N) | Terminology OK? (Y/N) | Reviewer Corrections / Suggested Edits |
|---|---|---|---|---|---|---|---|---|
| **01** | **Deterministic Offline RAG** | **Credential Stuffing / Password Guessing**<br>`source: honeypot`<br>`IP: 192.168.1.189`<br>`user: admin` | **Narrative:** Prohori Sentinel detected repeated unauthorized credential stuffing attempts targeting the simulated decoy surface. This pattern strongly aligns with MITRE ATT&CK Technique [T1110.001: Brute Force: Password Guessing] (Credential Access) and weaknesses outlined in [CWE-307]. The adversary is attempting rapid password permutation to gain unauthorized access.<br>**Action:** Block source IP at perimeter edge firewall and enforce multi-factor authentication (MFA). | **বিবরণ:** প্রহরী এআই ডিকয় সারফেসে একাধিক অননুমোদিত ক্রেডেনশিয়াল স্টাফিং ও পাসওয়ার্ড অনুমানের চেষ্টা শনাক্ত করেছে। এই আক্রমণ প্যাটার্নটি MITRE ATT&CK কৌশল [T1110.001: Brute Force: Password Guessing] এবং দুর্বলতা [CWE-307] এর সাথে হুবহু মিলে যায়। আক্রমণকারী অননুমোদিত অ্যাক্সেস পাওয়ার উদ্দেশ্যে দ্রুত পাসওয়ার্ড পরীক্ষার চেষ্টা চালাচ্ছে।<br>**পদক্ষেপ:** প্রবেশপথে বহিঃস্থ ফায়ারওয়ালে আইপি থেকে আসা সকল ট্রাফিক স্থায়ীভাবে ব্লক করুন এবং মাল্টি-ফ্যাক্টর অথেনটিকেশন (MFA) বাধ্যতামূলক করুন। | [ ] | [ ] | [ ] | |
| **02** | **Deterministic Offline RAG** | **Pre-Attack Web Reconnaissance**<br>`source: honeypot`<br>`target: /.env`<br>`user_agent: Nmap` | **Narrative:** Reconnaissance probes were trapped while attempting to identify sensitive configuration files and diagnostic paths on decoy endpoints. Grounded under MITRE ATT&CK [T1595.002: Active Scanning: Vulnerability Scanning]. The adversary is enumerating attack surfaces prior to exploitation.<br>**Action:** Monitor source IP pattern and deploy silent perimeter drops. | **বিবরণ:** সংবেদনশীল কনফিগারেশন ফাইল ও ডায়াগনস্টিক পথ খোঁজার উদ্দেশ্যে চালানো রিকনেসান্স অনুসন্ধান ট্র্যাপে ধরা পড়েছে। এটি MITRE ATT&CK কৌশল [T1595.002: Active Scanning: Vulnerability Scanning] এর আওতাভুক্ত। আক্রমণকারী মূল আক্রমণের পূর্বে সারফেস স্ক্যান করছে।<br>**পদক্ষেপ:** উৎস আইপি প্যাটার্ন পর্যবেক্ষণ করুন এবং পেরিমিটার রাউটারে নীরব ড্রপ রুল প্রয়োগ করুন। | [ ] | [ ] | [ ] | |
| **03** | **Deterministic Offline RAG** | **High-Rate API Flooding / DoS**<br>`source: ratelimiter`<br>`path: /api/v1/auth`<br>`count: 120 / 5s` | **Narrative:** The API Abuse Guard intercepted an anomalous burst of high-frequency requests exceeding established thresholds. Aligned with MITRE ATT&CK [T1499.002: Endpoint Denial of Service: Service Exhaustion]. Rate limiting enforced temporary 429 containment.<br>**Action:** Move client IP to extended denylist and throttle upstream endpoints. | **বিবরণ:** এপিআই অ্যাবিউজ গার্ড নির্ধারিত থ্রেশহোল্ড অতিক্রমকারী অস্বাভাবিক উচ্চ-ফ্রিকোয়েন্সির অনুরোধের বন্যা শনাক্ত ও প্রতিরোধ করেছে। এটি MITRE ATT&CK কৌশল [T1499.002: Endpoint Denial of Service: Service Exhaustion] এর সাথে সামঞ্জস্যপূর্ণ। সাময়িক ৪২৯ ব্লকের মাধ্যমে সিস্টেম সুরক্ষিত রাখা হয়েছে।<br>**পদক্ষেপ:** ক্লায়েন্ট আইপি-কে এক্সটেন্ডেড রেট লিমিট ব্লকলিস্টে স্থানান্তর করুন এবং সিডিএন লেয়ার ড্রপ কার্যকর করুন। | [ ] | [ ] | [ ] | |
| **04** | **Deterministic Offline RAG** | **OpenSSH Terrapin Vulnerability**<br>`source: scanner`<br>`port: 22/tcp`<br>`CVE-2023-38606` | **Narrative:** Defensive internal scanner discovered an unpatched OpenSSH service susceptible to the Terrapin sequence manipulation vulnerability [CVE-2023-38606] (CVSS 5.9). Enables man-in-the-middle handshake integrity truncation.<br>**Action:** Upgrade OpenSSH to 9.6p1 or newer and disable ChaCha20-Poly1305. | **বিবরণ:** অভ্যন্তরীণ ডিফেন্সিভ স্ক্যানার আনপ্যাচড OpenSSH সার্ভিস শনাক্ত করেছে যা তেরাপিন (Terrapin) সিকোয়েন্স ম্যানিপুলেশন দুর্বলতা [CVE-2023-38606] (CVSS 5.9) দ্বারা আক্রান্ত। এর মাধ্যমে আক্রমণকারী হ্যান্ডশেক ট্রাঙ্কেশন চালাতে পারে।<br>**পদক্ষেপ:** OpenSSH সংস্করণ ৯.৬পি১ বা তার বেশিতে অবিলম্বে আপগ্রেড করুন এবং দুর্বল সাইফার নিষ্ক্রিয় করুন। | [ ] | [ ] | [ ] | |
| **05** | **Deterministic Offline RAG** | **Multi-Sensor Incident Correlation**<br>`agent: correlation`<br>`IP: 192.168.1.189`<br>`events: 3 stages` | **Narrative:** Correlated multi-stage attack campaign identified from source IP. Sequence: Initial reconnaissance probe followed by credential stuffing and high-rate API resource exhaustion. Multi-sensor evidence confirms targeted adversary engagement.<br>**Action:** Apply immediate firewall block on source IP and review audit log. | **বিবরণ:** উৎস আইপি থেকে পরিচালিত বহু-পর্যায়ের সমন্বিত আক্রমণ শনাক্ত করা হয়েছে। আক্রমণের ক্রম: প্রাথমিক রিকনেসান্স অনুসন্ধান, পরবর্তীতে ক্রেডেনশিয়াল স্টাফিং এবং উচ্চ-হারের এপিআই রিসোর্স শেষ করার অপচেষ্টা। সেন্সর ডেটা টার্গেটেড আক্রমণের প্রমাণ নিশ্চিত করে।<br>**পদক্ষেপ:** অনতিবিলম্বে সমন্বিত ফায়ারওয়াল ব্লক কার্যকর করুন এবং সিকিউরিটি অডিট রিপোর্ট ডাউনলোড করুন। | [ ] | [ ] | [ ] | |
| **06** | **Real LLM Mode**<br>*(Pending key / Ollama)* | **Credential Stuffing / Password Guessing**<br>`source: honeypot`<br>`IP: 192.168.1.189` | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | [ ] | [ ] | [ ] | |
| **07** | **Real LLM Mode**<br>*(Pending key / Ollama)* | **Pre-Attack Web Reconnaissance**<br>`source: honeypot`<br>`target: /.env` | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | [ ] | [ ] | [ ] | |
| **08** | **Real LLM Mode**<br>*(Pending key / Ollama)* | **High-Rate API Flooding / DoS**<br>`source: ratelimiter`<br>`path: /api/v1/auth` | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | [ ] | [ ] | [ ] | |
| **09** | **Real LLM Mode**<br>*(Pending key / Ollama)* | **OpenSSH Terrapin Vulnerability**<br>`source: scanner`<br>`port: 22/tcp` | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | [ ] | [ ] | [ ] | |
| **10** | **Real LLM Mode**<br>*(Pending key / Ollama)* | **Multi-Sensor Incident Correlation**<br>`agent: correlation`<br>`IP: 192.168.1.189` | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | *[PENDING: To be populated upon connecting real LLM provider in Task 1]* | [ ] | [ ] | [ ] | |

---

## UI Strings Review Matrix (Operator Console Simplification)

> **Status:** `NOT VERIFIED` (Automated implementation; awaiting native speaker sign-off).
> Evaluates all user-facing Bengali strings introduced or reorganized in the simplified UI.

| UI Component | Context / English Key | Bengali Text (বাংলা) | Natural & Correct? (Y/N) | Cultural / Professional Fit? (Y/N) | Suggested Correction / Comments |
|---|---|---|---|---|---|
| **Header** | Brand Subtitle ("Autonomous AI Defensive SOC") | স্বায়ত্তশাসিত এআই ডিফেন্সিভ এসওসি | [ ] | [ ] | |
| **Header** | Live WebSocket Status ("Live" / "Offline") | সক্রিয় / সংযোগ বিচ্ছিন্ন | [ ] | [ ] | |
| **Header** | AI Engine Badge ("Engine: Offline RAG") | ইঞ্জিন: অফলাইন আরএজি (Deterministic RAG) | [ ] | [ ] | |
| **Header** | Primary Button ("Run demo" / "Running...") | ডেমো চালান / ডেমো চলছে... | [ ] | [ ] | |
| **Header** | Language Switcher ("English" / "বাংলা") | English / বাংলা | [ ] | [ ] | |
| **Header (More Menu)** | Dropdown Trigger ("More") | অন্যান্য | [ ] | [ ] | |
| **Header (More Menu)** | Audit Trail Item & Subtitle | অডিট ট্রেইল (দায়িত্বশীল এআই রেকর্ড) | [ ] | [ ] | |
| **Header (More Menu)** | Pitch Deck Item & Subtitle | পিচ ডেক (৮-স্লাইড উপস্থাপনা) | [ ] | [ ] | |
| **Header (More Menu)** | Sovereignty Toggle Item & Subtitle | সার্বভৌমত্ব: অন-প্রিম (স্থানীয় ডেটা সুরক্ষা কার্যকর) | [ ] | [ ] | |
| **Header (More Menu)** | Hybrid Mode Item & Subtitle | মোড: ক্লাউড হাইব্রিড (ক্লাউড এআই সক্ষম) | [ ] | [ ] | |
| **Header (More Menu)** | API Docs Item & Subtitle | এপিআই ডকুমেন্টস (FastAPI Swagger UI) | [ ] | [ ] | |
| **Header (More Menu)** | Keyboard Shortcuts Item | কিবোর্ড শর্টকাট (Shift+D, Shift+A, Shift+P) | [ ] | [ ] | |
| **Alert List** | Panel Title ("Live Alerts") | সরাসরি সতর্কতা | [ ] | [ ] | |
| **Alert List** | Severity Filter Options | সকল তীব্রতা / জরুরি / উচ্চ / মাঝারি / নিম্ন | [ ] | [ ] | |
| **Alert List** | Search Placeholder | আইপি, আক্রমণ বা কৌশল দিয়ে খুঁজুন... | [ ] | [ ] | |
| **Alert List (Attacks)** | Credential Stuffing Attack | ক্রেডেনশিয়াল স্টাফিং আক্রমণ | [ ] | [ ] | |
| **Alert List (Attacks)** | Reconnaissance Scan | রিকনেসান্স স্ক্যান | [ ] | [ ] | |
| **Alert List (Attacks)** | API Flooding / Abuse | এপিআই ফ্লাডিং অপব্যবহার | [ ] | [ ] | |
| **Alert List (Attacks)** | Vulnerable Service Detected | নিরাপত্তা দুর্বলতা শনাক্ত | [ ] | [ ] | |
| **Alert List (Attacks)** | Multi-Stage Attack Campaign | বহু-পর্যায়ের সমন্বিত আক্রমণ | [ ] | [ ] | |
| **Alert List (Attacks)** | Log4j JNDI Injection Attack | লগফরজে জেএনডিআই ইনজেকশন | [ ] | [ ] | |
| **Alert List (Attacks)** | SQL Injection Attempt | এসকিউএল ইনজেকশন আক্রমণ | [ ] | [ ] | |
| **Alert List (Attacks)** | Ransomware Defense Evasion | র‍্যানসমওয়্যার শ্যাডো কপি মুছনের চেষ্টা | [ ] | [ ] | |
| **Alert List (Attacks)** | Cloud Metadata SSRF Probe | ক্লাউড মেটাডেটা প্ররোচনা (SSRF) | [ ] | [ ] | |
| **Alert List (Attacks)** | Remote Command Injection | অননুমোদিত কমান্ড এক্সিকিউশন | [ ] | [ ] | |
| **Alert List (Attacks)** | C2 Beaconing Detected | সি২ কমান্ড অ্যান্ড কন্ট্রোল সিগন্যাল | [ ] | [ ] | |
| **Alert List** | Empty State Title | কোনো হুমকি পাওয়া যায়নি | [ ] | [ ] | |
| **Alert List** | Empty State Instruction | সিস্টেম স্বাভাবিক রয়েছে। আক্রমণ শনাক্তকরণ ও এআই বিশ্লেষণ দেখতে 'ডেমো চালান' বোতামে ক্লিক করুন। | [ ] | [ ] | |
| **Selected Alert** | Empty State Guidance | বামপাশের তালিকা থেকে যেকোনো সতর্কতায় ক্লিক করে কৃত্রিম বুদ্ধিমত্তার (AI) বিস্তারিত বিশ্লেষণ ও প্রতিক্রিয়া দেখুন। | [ ] | [ ] | |
| **Selected Alert** | Retriage Button ("Re-Triage" / "Analyzing...") | পুনরায় বিশ্লেষণ / বিশ্লেষণ হচ্ছে... | [ ] | [ ] | |
| **Selected Alert** | Citations Label | ভেরিফায়েড থ্রেট সাইটেশন: | [ ] | [ ] | |
| **Selected Alert** | Section: What Happened | কী ঘটেছে (What Happened) | [ ] | [ ] | |
| **Selected Alert** | Section: Recommended Defense | প্রস্তাবিত পদক্ষেপ (Recommended Action) | [ ] | [ ] | |
| **Selected Alert** | Action Button ("Approve Defense") | 🛡️ প্রতিরক্ষা অনুমোদন করুন (Approve Defense) | [ ] | [ ] | |
| **Selected Alert** | Action Button ("Applying...") | অনুমোদন করা হচ্ছে... | [ ] | [ ] | |
| **Selected Alert** | Action Gate Explanatory Text | মানবসক্রিয় অনুমোদন গেট: এই বোতাম চাপলে আক্রমণকারীর আইপি অবিলম্বে ফায়ারওয়ালে ব্লক হবে এবং অডিট ট্রেইলে সংরক্ষিত হবে। | [ ] | [ ] | |
| **Selected Alert** | Approved State Banner | প্রতিরক্ষা কার্যকর হয়েছে (Approved) | [ ] | [ ] | |
| **Selected Alert** | Approved Containment Explanation | আক্রমণকারী আইপি পেরিমিটার ডিনাইলিস্টে যুক্ত হয়েছে। পরবর্তী অনুরোধ অবিলম্বে ব্লক করা হবে। | [ ] | [ ] | |
| **Selected Alert (Ask)** | Accordion Title | এই হুমকি সম্পর্কে এআই বিশ্লেষককে জিজ্ঞাসা করুন | [ ] | [ ] | |
| **Selected Alert (Ask)** | Suggestion 1 | 💡 মূল কৌশল কী? ("এই আক্রমণের মূল কৌশল এবং ক্ষতি করার সম্ভাবনা ব্যাখ্যা করুন।") | [ ] | [ ] | |
| **Selected Alert (Ask)** | Suggestion 2 | 🛡️ ফায়ারওয়াল ব্লক পদ্ধতি ("এই আইপি কীভাবে পারিপার্শ্বিক ফায়ারওয়ালে ব্লক করব?") | [ ] | [ ] | |
| **Selected Alert (Ask)** | Suggestion 3 | 🔍 ইনসাইডার থ্রেট নাকি বহিঃস্থ? ("এটি কি অভ্যন্তরীণ নিরাপত্তা লঙ্ঘন নাকি বহিঃস্থ আক্রমণ?") | [ ] | [ ] | |
| **Selected Alert (Ask)** | Input Field Placeholder | বাংলায় বা ইংরেজিতে প্রশ্ন লিখুন... | [ ] | [ ] | |
| **Selected Alert (Ask)** | Submit Button ("Ask" / "Generating...") | জিজ্ঞাসা / লিখছে... | [ ] | [ ] | |
| **Mobile Tabs** | Segmented Control Tab 1 | সরাসরি সতর্কতা ({count}) | [ ] | [ ] | |
| **Mobile Tabs** | Segmented Control Tab 2 | এআই হুমকি বিশ্লেষণ | [ ] | [ ] | |
| **Shortcuts Modal** | Modal Title | কিবোর্ড শর্টকাট গাইড | [ ] | [ ] | |
| **Shortcuts Modal** | Shortcut Descriptions | আক্রমণ ডেমো চালান / দায়িত্বশীল এআই অডিট লগ / ৮-স্লাইড পিচ ডেক / জাতীয় ডেটা সার্বভৌমত্ব মোড / ভাষা পরিবর্তন / কিবোর্ড শর্টকাট সহায়তা / খোলা উইন্ডো বন্ধ করুন | [ ] | [ ] | |
| **Footer** | Raw Forensic Link | কাঁচা ফরেনসিক তথ্য | [ ] | [ ] | |

---

## Reviewer Sign-Off Block (Human Verification Required)

> [!WARNING]
> This review block MUST be signed by a native Bengali speaker from Team Orionids. No automated agent may sign on the reviewer's behalf.

- **Reviewer Name:** __________________________________________________
- **Academic / Team Role:** ___________________________________________
- **Review Date:** ____________________________________________________
- **Signature / Confirmation:** _______________________________________
- **Overall Verdict:** `[ ] APPROVED AS-IS` / `[ ] APPROVED WITH CORRECTIONS` / `[ ] REJECTED`

