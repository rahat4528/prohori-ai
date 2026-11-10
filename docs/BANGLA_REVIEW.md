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

## Reviewer Sign-Off Block (Human Verification Required)

> [!WARNING]
> This review block MUST be signed by a native Bengali speaker from Team Orionids. No automated agent may sign on the reviewer's behalf.

- **Reviewer Name:** __________________________________________________
- **Academic / Team Role:** ___________________________________________
- **Review Date:** ____________________________________________________
- **Signature / Confirmation:** _______________________________________
- **Overall Verdict:** `[ ] APPROVED AS-IS` / `[ ] APPROVED WITH CORRECTIONS` / `[ ] REJECTED`

