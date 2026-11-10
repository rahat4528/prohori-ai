# Prohori AI — Bengali Translation Quality Review Samples

To ensure linguistic accuracy, fluency, and proper Bengali cybersecurity terminology, the 5 sample outputs below were generated directly from the Prohori AI engine. A native Bengali speaker from Team Orionids must review these samples and confirm or refine them.

---

### Sample 1: Credential Stuffing & Brute Force (T1110.001 / CWE-307)
- **Sensor:** Deception Honeypot (Port 8081)
- **Adversary Activity:** Multiple failed login attempts (`admin` / wordlist passwords) within 60 seconds.
- **English Narrative:**
  > "Prohori Sentinel detected repeated unauthorized credential stuffing attempts targeting the simulated decoy surface. This pattern strongly aligns with MITRE ATT&CK Technique [T1110.001: Brute Force: Password Guessing] (Credential Access) and weaknesses outlined in [CWE-307]. The adversary is attempting rapid password permutation to gain unauthorized access."
- **Bengali Translation (for Review):**
  > "প্রহরী এআই ডিকয় সারফেসে একাধিক অননুমোদিত ক্রেডেনশিয়াল স্টাফিং ও পাসওয়ার্ড অনুমানের চেষ্টা শনাক্ত করেছে। এই আক্রমণ প্যাটার্নটি MITRE ATT&CK কৌশল [T1110.001: Brute Force: Password Guessing] এবং দুর্বলতা [CWE-307] এর সাথে হুবহু মিলে যায়। আক্রমণকারী অননুমোদিত অ্যাক্সেস পাওয়ার উদ্দেশ্যে দ্রুত পাসওয়ার্ড পরীক্ষার চেষ্টা চালাচ্ছে।"
- **Recommended Action (Bengali):**
  > "প্রবেশপথে বহিঃস্থ ফায়ারওয়ালে আইপি থেকে আসা সকল ট্রাফিক স্থায়ীভাবে ব্লক করুন এবং মাল্টি-ফ্যাক্টর অথেনটিকেশন (MFA) বাধ্যতামূলক করুন।"
- **Reviewer Sign-off:** `[FILL: Approved / Suggested Edits: ...]`

---

### Sample 2: Pre-Attack Reconnaissance & Web Probing (T1595.002)
- **Sensor:** Deception Honeypot (Port 8081)
- **Adversary Activity:** HTTP GET requests probing for `/.env`, `/wp-login.php`, and config backups.
- **English Narrative:**
  > "Reconnaissance probes were trapped while attempting to identify sensitive configuration files and diagnostic paths on decoy endpoints. Grounded under MITRE ATT&CK [T1595.002: Active Scanning: Vulnerability Scanning]. The adversary is enumerating attack surfaces prior to exploitation."
- **Bengali Translation (for Review):**
  > "সংবেদনশীল কনফিগারেশন ফাইল ও ডায়াগনস্টিক পথ খোঁজার উদ্দেশ্যে চালানো রিকনেসান্স অনুসন্ধান ট্র্যাপে ধরা পড়েছে। এটি MITRE ATT&CK কৌশল [T1595.002: Active Scanning: Vulnerability Scanning] এর আওতাভুক্ত। আক্রমণকারী মূল আক্রমণের পূর্বে সারফেস স্ক্যান করছে।"
- **Recommended Action (Bengali):**
  > "উৎস আইপি প্যাটার্ন পর্যবেক্ষণ করুন এবং পেরিমিটার রাউটারে নীরব ড্রপ রুল প্রয়োগ করুন।"
- **Reviewer Sign-off:** `[FILL: Approved / Suggested Edits: ...]`

---

### Sample 3: API Flooding & High-Rate Denial of Service (T1499.002)
- **Sensor:** API Abuse Guard (Rate Limiter / Port 8082)
- **Adversary Activity:** 120 burst requests in 5 seconds targeting `/api/v1/auth`.
- **English Narrative:**
  > "The API Abuse Guard intercepted an anomalous burst of high-frequency requests exceeding established thresholds. Aligned with MITRE ATT&CK [T1499.002: Endpoint Denial of Service: Service Exhaustion]. Rate limiting enforced temporary 429 containment."
- **Bengali Translation (for Review):**
  > "এপিআই অ্যাবিউজ গার্ড নির্ধারিত থ্রেশহোল্ড অতিক্রমকারী অস্বাভাবিক উচ্চ-ফ্রিকোয়েন্সির অনুরোধের বন্যা শনাক্ত ও প্রতিরোধ করেছে। এটি MITRE ATT&CK কৌশল [T1499.002: Endpoint Denial of Service: Service Exhaustion] এর সাথে সামঞ্জস্যপূর্ণ। সাময়িক ৪২৯ ব্লকের মাধ্যমে সিস্টেম সুরক্ষিত রাখা হয়েছে।"
- **Recommended Action (Bengali):**
  > "ক্লায়েন্ট আইপি-কে এক্সটেন্ডেড রেট লিমিট ব্লকলিস্টে স্থানান্তর করুন এবং সিডিএন লেয়ার ড্রপ কার্যকর করুন।"
- **Reviewer Sign-off:** `[FILL: Approved / Suggested Edits: ...]`

---

### Sample 4: OpenSSH Terrapin Attack Detection (CVE-2023-38606)
- **Sensor:** Asset Discovery Scanner (Port 8083)
- **Adversary / Vulnerability:** OpenSSH service exposing vulnerable ChaCha20-Poly1305 / BAP ciphers.
- **English Narrative:**
  > "Defensive internal scanner discovered an unpatched OpenSSH service susceptible to the Terrapin sequence manipulation vulnerability [CVE-2023-38606] (CVSS 5.9). Enables man-in-the-middle handshake integrity truncation."
- **Bengali Translation (for Review):**
  > "অভ্যন্তরীণ ডিফেন্সিভ স্ক্যানার আনপ্যাচড OpenSSH সার্ভিস শনাক্ত করেছে যা তেরাপিন (Terrapin) সিকোয়েন্স ম্যানিপুলেশন দুর্বলতা [CVE-2023-38606] (CVSS 5.9) দ্বারা আক্রান্ত। এর মাধ্যমে আক্রমণকারী হ্যান্ডশেক ট্রাঙ্কেশন চালাতে পারে।"
- **Recommended Action (Bengali):**
  > "OpenSSH সংস্করণ ৯.৬পি১ বা তার বেশিতে অবিলম্বে আপগ্রেড করুন এবং দুর্বল সাইফার নিষ্ক্রিয় করুন।"
- **Reviewer Sign-off:** `[FILL: Approved / Suggested Edits: ...]`

---

### Sample 5: Multi-Sensor Incident Correlation & Campaign Summary
- **Sensor:** Incident Correlation Agent
- **Adversary Activity:** Same IP performs port scan -> honeypot login attempt -> API abuse in 3-minute window.
- **English Narrative:**
  > "Correlated multi-stage attack campaign identified from source IP. Sequence: Initial reconnaissance probe followed by credential stuffing and high-rate API resource exhaustion. Multi-sensor evidence confirms targeted adversary engagement."
- **Bengali Translation (for Review):**
  > "উৎস আইপি থেকে পরিচালিত বহু-পর্যায়ের সমন্বিত আক্রমণ শনাক্ত করা হয়েছে। আক্রমণের ক্রম: প্রাথমিক রিকনেসান্স অনুসন্ধান, পরবর্তীতে ক্রেডেনশিয়াল স্টাফিং এবং উচ্চ-হারের এপিআই রিসোর্স শেষ করার অপচেষ্টা। সেন্সর ডেটা টার্গেটেড আক্রমণের প্রমাণ নিশ্চিত করে।"
- **Recommended Action (Bengali):**
  > "অনতিবিলম্বে সমন্বিত ফায়ারওয়াল ব্লক কার্যকর করুন এবং সিকিউরিটি অডিট রিপোর্ট ডাউনলোড করুন।"
- **Reviewer Sign-off:** `[FILL: Approved / Suggested Edits: ...]`

---

### Sign-off Checklist for Native Bengali Speaker
- [ ] Technical terms translated appropriately (avoiding unnatural literal translations).
- [ ] Grammar and sentence flow sound authoritative and professional.
- [ ] Punctuation and numbering render correctly in Bengali script.
- **Reviewer Name:** `[FILL: reviewer name]`
- **Date Verified:** `[FILL: date]`
