# Prohori AI — Data Lineage & Knowledge Base Specification

**Legal, Ethical, and Public Grounding Sources**

Prohori AI strictly uses legally public threat intelligence sources. No private, confidential, or ungrounded external scrapers are utilized.

---

## 1. Grounding Data Sources

### A. MITRE ATT&CK&reg; Enterprise Knowledge Base
- **Origin**: MITRE Corporation (Public STIX 2.1 Bundle)
- **License**: Publicly accessible threat modeling standard
- **Usage**: Grounding event behavior into Tactics (Credential Access, Reconnaissance, Denial of Service) and Techniques (`T1110.001`, `T1499.002`, `T1595.002`).
- **Offline Assurance**: Curated STIX profiles are cached in `knowledge/data/curated_kb.py` and synced to pgvector, ensuring complete offline availability without internet dependency.

### B. NIST National Vulnerability Database (NVD CVE)
- **Origin**: National Institute of Standards and Technology (NIST)
- **Content**: Common Vulnerabilities and Exposures (CVEs) with Common Vulnerability Scoring System (CVSS) metrics (e.g. `CVE-2021-44228` Log4Shell, `CVE-2023-38606` OpenSSH Terrapin).
- **Usage**: Correlating banners identified by the Asset Discovery sensor against known critical vulnerabilities.

### C. Common Weakness Enumeration (CWE&trade;)
- **Origin**: MITRE / DHS CISA public dictionary
- **Content**: Weakness classifications (`CWE-307` Improper Restriction of Excessive Auth Attempts, `CWE-400` Uncontrolled Resource Consumption, `CWE-200` Information Exposure).

---

## 2. PII & Secret Scrubbing Pipeline

Before telemetry enters the RAG pipeline or reaches any LLM (cloud or local), it passes through `analyst/redaction.py`:

```
Raw Telemetry Event
        │
        ▼
[ SENSITIVE KEY FILTER ]  ──► Replaces password, secret, token with [REDACTED_CREDENTIAL]
        │
        ▼
[ REGEX PATTERN FILTER ]  ──► Replaces JWT, Bearer tokens, GitHub keys, AWS keys
        │
        ▼
[ EMAIL/PHONE SANITIZER]  ──► Strips personal identifiers ([REDACTED_EMAIL])
        │
        ▼
Sanitized Payload Passed to AI Analyst
```

---

## 3. Grounded Citation Policy (Anti-Hallucination)

Judges evaluate explainability and factuality:
1. Every claim made by the Analyst must cite a verified knowledge item (`[T1110.001]`, `[CVE-2021-44228]`, etc.).
2. If an event cannot be mapped to an existing technique or vulnerability, the Analyst explicitly states lack of grounding rather than fabricating tactics.
3. Every citation is exposed as an interactive badge on the dashboard for instant operator verification.
