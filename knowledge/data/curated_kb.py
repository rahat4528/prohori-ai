"""
Prohori AI - Comprehensive Defensive Threat Knowledge Base
Real MITRE ATT&CK Enterprise Techniques, NVD CVE Vulnerability Intelligence, and CWE Profiles.
Provides rich, grounded context for RAG retrieval without external dependencies.
"""

MITRE_TECHNIQUES = [
    # Credential Access
    {
        "id": "T1110.001",
        "name": "Brute Force: Password Guessing",
        "tactic": "Credential Access",
        "description": "Adversaries may systematically guess passwords to gain access to accounts by trying multiple common passwords against known accounts.",
        "mitigation": "Enforce account lockouts after consecutive failed attempts. Implement multi-factor authentication (MFA) and adaptive rate limiting.",
        "detection": "Audit authentication logs for high volumes of failed login attempts from single or distributed IP addresses."
    },
    {
        "id": "T1110.002",
        "name": "Brute Force: Password Cracking",
        "tactic": "Credential Access",
        "description": "Adversaries may use password cracking tools to recover plaintext credentials from password hashes acquired during intrusions.",
        "mitigation": "Use robust salted password hashing algorithms (Argon2, bcrypt, PBKDF2) with sufficient work factor.",
        "detection": "Detect exfiltration of shadow, SAM, or database credential dumps."
    },
    {
        "id": "T1110.003",
        "name": "Brute Force: Password Spraying",
        "tactic": "Credential Access",
        "description": "Adversaries may attempt a single common password against many different accounts to bypass account lockout thresholds.",
        "mitigation": "Prohibit common dictionary passwords. Implement threat intelligence IP reputation filtering.",
        "detection": "Identify single password authentication attempts targeting disparate usernames within a narrow temporal window."
    },
    {
        "id": "T1078.001",
        "name": "Valid Accounts: Default Accounts",
        "tactic": "Initial Access",
        "description": "Adversaries may leverage default credentials shipped with operating systems, web applications, or IoT hardware.",
        "mitigation": "Change or disable all factory default credentials prior to putting devices into production.",
        "detection": "Flag authentications using generic administrative user identities (admin, root, test, guest)."
    },
    {
        "id": "T1555",
        "name": "Credentials from Password Stores",
        "tactic": "Credential Access",
        "description": "Adversaries may search for common password storage repositories, web browser credential vaults, or configuration files.",
        "mitigation": "Encrypt credential caches at rest with OS-level DPAPI or hardware TPM modules.",
        "detection": "Monitor file access to sensitive credential stores (.bash_history, web browser profile directories)."
    },

    # Reconnaissance
    {
        "id": "T1595.001",
        "name": "Active Scanning: Scanning IP Blocks",
        "tactic": "Reconnaissance",
        "description": "Adversaries may scan IPv4 or IPv6 address blocks to identify reachable hosts, cloud infrastructure, and perimeter gateways.",
        "mitigation": "Minimize publicly exposed perimeter IP ranges. Implement network intrusion detection systems and blackhole routing.",
        "detection": "Identify rapid sequential SYN packets to multiple non-adjacent IP addresses."
    },
    {
        "id": "T1595.002",
        "name": "Active Scanning: Vulnerability Scanning",
        "tactic": "Reconnaissance",
        "description": "Adversaries may scan reachable endpoints for unpatched vulnerabilities, exposed administrative interfaces, or misconfigurations.",
        "mitigation": "Deploy deception honeypots to attract and trap probes. Disable diagnostic banners and information disclosure headers.",
        "detection": "Monitor web server request URIs for path traversal and diagnostic indicators (/.env, /admin, /actuator, /phpmyadmin)."
    },
    {
        "id": "T1046",
        "name": "Network Service Discovery",
        "tactic": "Discovery",
        "description": "Adversaries may attempt to discover running services by probing standard and non-standard network ports.",
        "mitigation": "Restrict perimeter port availability using stateful network firewalls.",
        "detection": "Audit connection attempts hitting closed or filtered ports across a server."
    },

    # Initial Access & Execution
    {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "tactic": "Initial Access",
        "description": "Adversaries may exploit vulnerabilities (such as buffer overflows or injection flaws) in Internet-facing software to execute code.",
        "mitigation": "Perform automated continuous attack surface discovery and patch identified CVE vulnerabilities immediately.",
        "detection": "Inspect application request payloads for anomalous escape characters, serialized payloads, or SQL injection markers."
    },
    {
        "id": "T1059.004",
        "name": "Command and Scripting Interpreter: Unix Shell",
        "tactic": "Execution",
        "description": "Adversaries may abuse Unix shell commands (/bin/sh, /bin/bash) to execute arbitrary commands and establish footholds.",
        "mitigation": "Enforce container isolation, read-only root filesystems, and strict seccomp/AppArmor policies.",
        "detection": "Audit process execution trees spawning shells from web server worker processes."
    },

    # Denial of Service & Impact
    {
        "id": "T1499.002",
        "name": "Endpoint Denial of Service: Service Exhaustion Flood",
        "tactic": "Impact",
        "description": "Adversaries may flood network services with excessive request volumes to exhaust CPU, connection tables, or memory buffers.",
        "mitigation": "Deploy progressive sliding-window rate limiting, token-bucket traffic shaping, and Web Application Firewalls (WAF).",
        "detection": "Identify spike in HTTP 429 / 503 response rates and high requests-per-second from single or clustered IPs."
    },
    {
        "id": "T1498.001",
        "name": "Network Denial of Service: Direct Network Flood",
        "tactic": "Impact",
        "description": "Adversaries may saturate network bandwidth using volumetric UDP, ICMP, or SYN floods to prevent legitimate communication.",
        "mitigation": "Deploy upstream DDoS mitigation scrubbers and border gateway BGP flowspec filtering.",
        "detection": "Monitor interface throughput and packet per second anomalies."
    },

    # Lateral Movement & Command and Control
    {
        "id": "T1021.004",
        "name": "Remote Services: SSH",
        "tactic": "Lateral Movement",
        "description": "Adversaries may use SSH to move laterally across enterprise systems using harvested keys or credentials.",
        "mitigation": "Disable password authentication for SSH; enforce ed25519 public key authentication and jump hosts.",
        "detection": "Track unusual SSH sessions originating from non-administrative subnets."
    },
    {
        "id": "T1071.001",
        "name": "Application Layer Protocol: Web Protocols",
        "tactic": "Command and Control",
        "description": "Adversaries may communicate using standard HTTP/HTTPS protocols to blend command and control traffic with normal browsing.",
        "mitigation": "Inspect outbound TLS connections using forward-proxy SSL decryption and domain categorization.",
        "detection": "Analyze beaconing intervals and abnormal HTTP User-Agent headers."
    },
    {
        "id": "T1490",
        "name": "Inhibit System Recovery: Delete Volume Snapshots",
        "tactic": "Impact",
        "description": "Adversaries may delete or disable system recovery options such as Volume Shadow Copies (vssadmin delete shadows) to prevent data restoration after ransomware deployment.",
        "mitigation": "Enforce access controls on volume shadow copies and restrict access to vssadmin.exe, wmic.exe, and bcdedit.exe.",
        "detection": "Monitor process execution for vssadmin.exe delete shadows or wmic shadowcopy delete."
    },
    {
        "id": "T1552.005",
        "name": "Unsecured Credentials: Cloud Instance Metadata API",
        "tactic": "Credential Access",
        "description": "Adversaries may access cloud instance metadata APIs (169.254.169.254) to extract temporary IAM credentials or service account tokens via SSRF.",
        "mitigation": "Enforce IMDSv2 (session-oriented token authentication) and restrict outbound metadata access from web application containers.",
        "detection": "Monitor internal HTTP requests targeting 169.254.169.254 from web proxies or reverse proxies."
    }
]

CVE_DATABASE = [
    {
        "cve_id": "CVE-2021-44228",
        "name": "Log4Shell (Apache Log4j RCE)",
        "cvss": 10.0,
        "severity": "CRITICAL",
        "affected": "Apache Log4j 2.0-beta9 through 2.15.0",
        "description": "JNDI lookup feature in Log4j allows unauthenticated remote code execution via attacker-controlled log messages.",
        "mitigation": "Upgrade Log4j to 2.17.1 or newer. Set log4j2.formatMsgNoLookups to true."
    },
    {
        "cve_id": "CVE-2023-38606",
        "name": "OpenSSH Terrapin Attack",
        "cvss": 5.9,
        "severity": "MEDIUM",
        "affected": "OpenSSH prior to 9.6",
        "description": "Prefix truncation attack against ChaCha20-Poly1305 and CBC-EtM ciphers in SSH protocol.",
        "mitigation": "Upgrade OpenSSH to 9.6p1 or newer. Disable affected cipher suites."
    },
    {
        "cve_id": "CVE-2022-22965",
        "name": "Spring4Shell (Spring Framework RCE)",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "affected": "Spring Framework 5.3.0 to 5.3.17, 5.2.0 to 5.2.19 running on JDK 9+",
        "description": "Remote code execution in Spring MVC and Spring WebFlux via DataBinder parameter binding.",
        "mitigation": "Upgrade Spring Framework to 5.3.18+ or 5.2.20+."
    },
    {
        "cve_id": "CVE-2021-26855",
        "name": "ProxyLogon (Microsoft Exchange SSRF)",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "affected": "Microsoft Exchange Server 2013, 2016, 2019",
        "description": "Pre-authentication server-side request forgery leading to complete email and system compromise.",
        "mitigation": "Apply official Microsoft security rollups immediately."
    },
    {
        "cve_id": "CVE-2024-21413",
        "name": "Microsoft Outlook Moniker Link RCE",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "affected": "Microsoft Office 2016, 2019, 2021, 365",
        "description": "Bypasses Protected View via # link prefixes to leak NTLM credentials and execute remote code.",
        "mitigation": "Install Microsoft February 2024 security updates."
    },
    {
        "cve_id": "CVE-2023-46604",
        "name": "Apache ActiveMQ RCE",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "affected": "Apache ActiveMQ before 5.15.16, 5.16.7, 5.17.6, 5.18.3",
        "description": "Insecure deserialization in OpenWire protocol allows unauthenticated RCE.",
        "mitigation": "Upgrade ActiveMQ to fixed releases."
    },
    {
        "cve_id": "CVE-2023-44487",
        "name": "HTTP/2 Rapid Reset DDoS",
        "cvss": 7.5,
        "severity": "HIGH",
        "affected": "HTTP/2 implementations supporting stream multiplexing",
        "description": "Adversary repeatedly sends RST_STREAM frames to exhaust server connection state and resources.",
        "mitigation": "Apply vendor HTTP/2 patches; rate-limit stream cancellations."
    },
    {
        "cve_id": "CVE-2022-0847",
        "name": "Dirty Pipe (Linux Kernel LPE)",
        "cvss": 7.8,
        "severity": "HIGH",
        "affected": "Linux kernel 5.8 through 5.16.11",
        "description": "Flaw in pipe buffer flags enables unprivileged overwriting of arbitrary read-only files.",
        "mitigation": "Update Linux kernel to 5.16.11, 5.15.25 or newer."
    }
]

CWE_DATABASE = [
    {
        "cwe_id": "CWE-307",
        "name": "Improper Restriction of Excessive Authentication Attempts",
        "description": "The product does not adequately limit the number of failed authentication attempts, permitting brute-force attacks.",
        "mitigation": "Implement progressive delays, CAPTCHA, and account lockouts."
    },
    {
        "cwe_id": "CWE-400",
        "name": "Uncontrolled Resource Consumption",
        "description": "The product does not properly control the allocation and maintenance of a limited resource, enabling denial of service.",
        "mitigation": "Enforce sliding-window rate limiting and concurrency caps."
    },
    {
        "cwe_id": "CWE-200",
        "name": "Exposure of Sensitive Information to an Unauthorized Actor",
        "description": "The product exposes sensitive data (credentials, keys, debug panels) to unauthorized users through error messages or exposed endpoints.",
        "mitigation": "Disable debug panels, restrict access to /.env and configuration files."
    },
    {
        "cwe_id": "CWE-89",
        "name": "SQL Injection",
        "description": "The software constructs all or part of an SQL command using externally-influenced input from an upstream component.",
        "mitigation": "Use parameterized queries, prepared statements, and ORM abstractions."
    },
    {
        "cwe_id": "CWE-79",
        "name": "Cross-Site Scripting (XSS)",
        "description": "The software does not neutralize or incorrectly neutralizes user-controllable input before it is placed in output used as a web page.",
        "mitigation": "Apply context-aware output encoding and strict Content Security Policy (CSP)."
    },
    {
        "cwe_id": "CWE-798",
        "name": "Use of Hard-coded Credentials",
        "description": "The software contains hard-coded credentials, such as a password or cryptographic key, which it uses for inbound authentication.",
        "mitigation": "Store secrets in an external secrets manager or environment variables."
    },
    {
        "cwe_id": "CWE-22",
        "name": "Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)",
        "description": "The software uses external input to construct a pathname intended to identify a directory located underneath a restricted directory.",
        "mitigation": "Use input allowlists and canonicalize file paths."
    }
]
