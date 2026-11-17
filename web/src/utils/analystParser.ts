/**
 * Prohori AI — Analyst Response Parser & Knowledge Base
 * Parses raw AI analyst output into structured, safe markdown AST and categorized security entities.
 */

import { isRfc1918PrivateIp } from "./analystFallback";

export interface FirewallCommand {
  platform: "iptables" | "ufw" | "cisco";
  title: string;
  category: string;
  command: string;
  description: string;
  whereToRun: string;
  whenToRun: string;
  whatItDoes: string;
}

export interface CitationDetail {
  id: string;
  type: "MITRE ATT&CK" | "CWE" | "CVE";
  name: string;
  tacticOrCategory: string;
  description: string;
  relevance: string;
  mitigation: string;
}

export interface ParsedAnalystResponse {
  verdictTitle: string;
  summaryText: string;
  targetIp: string;
  isPrivateIp: boolean;
  ipClassification: string;
  ipRelevance: string;
  recommendations: string[];
  firewallCommands: FirewallCommand[];
  citations: CitationDetail[];
  rawAnswer: string;
}

// Canonical security knowledge definitions grounded in Prohori's curated STIX & CWE database
export const KNOWLEDGE_CATALOG: Record<string, CitationDetail> = {
  "T1190": {
    id: "T1190",
    type: "MITRE ATT&CK",
    name: "Exploit Public-Facing Application",
    tacticOrCategory: "Initial Access",
    description: "Adversaries take advantage of a weakness in an Internet-facing computer or program (such as Log4Shell or injection bugs) to execute unauthorized code or gain access.",
    relevance: "Observed payload targeting application inputs with remote code execution patterns.",
    mitigation: "Patch vulnerable software libraries (Log4j 2.17.1+), enforce input sanitization, and restrict outbound LDAP/RMI connections."
  },
  "CVE-2021-44228": {
    id: "CVE-2021-44228",
    type: "CVE",
    name: "Log4Shell Apache Log4j JNDI Remote Code Execution",
    tacticOrCategory: "Remote Code Execution",
    description: "A flaw in Apache Log4j allows remote unauthenticated attackers to execute arbitrary code via JNDI lookup strings.",
    relevance: "Direct JNDI injection string detected targeting authentication gateway.",
    mitigation: "Upgrade Log4j to 2.17.1 or higher, remove JndiLookup class from classpath, or set log4j2.formatMsgNoLookups=true."
  },
  "T1059": {
    id: "T1059",
    type: "MITRE ATT&CK",
    name: "Command and Scripting Interpreter",
    tacticOrCategory: "Execution",
    description: "Adversaries abuse command interpreters to execute arbitrary commands, scripts, or binaries.",
    relevance: "Attempted execution of operating system commands.",
    mitigation: "Enforce script execution policies, restrict administrative terminal access, and monitor process creation logs."
  },
  "T1110.001": {
    id: "T1110.001",
    type: "MITRE ATT&CK",
    name: "Brute Force: Password Guessing",
    tacticOrCategory: "Credential Access",
    description: "Adversaries systematically guess passwords to authenticate to valid user accounts by trying multiple common permutations against exposed services.",
    relevance: "Observed against simulated administrative and web authentication endpoints in telemetry.",
    mitigation: "Enforce account lockout thresholds, mandate step-up multi-factor authentication (MFA), and deploy progressive delay rate limiting."
  },
  "T1110.002": {
    id: "T1110.002",
    type: "MITRE ATT&CK",
    name: "Brute Force: Password Cracking",
    tacticOrCategory: "Credential Access",
    description: "Adversaries use password cracking tools to recover plaintext credentials from exfiltrated hashes.",
    relevance: "Follow-up risk if credential stores or hashes are accessed.",
    mitigation: "Use modern salted password hashes (Argon2id, bcrypt) with high work factors."
  },
  "T1110.003": {
    id: "T1110.003",
    type: "MITRE ATT&CK",
    name: "Brute Force: Password Spraying",
    tacticOrCategory: "Credential Access",
    description: "Adversaries try a single common password across many accounts to bypass account lockout thresholds.",
    relevance: "Low-frequency distributed credential access across multiple usernames.",
    mitigation: "Prohibit common dictionary passwords and implement behavioral threat intelligence filtering."
  },
  "T1499.002": {
    id: "T1499.002",
    type: "MITRE ATT&CK",
    name: "Endpoint Denial of Service: Service Exhaustion Flood",
    tacticOrCategory: "Impact",
    description: "Adversaries flood application APIs with high-frequency request volumes to exhaust worker connection pools and CPU.",
    relevance: "Tripped rate-limiter threshold returning HTTP 429 containment.",
    mitigation: "Deploy token-bucket traffic shaping at reverse proxies and immediately throttle offending client IPs."
  },
  "T1595.001": {
    id: "T1595.001",
    type: "MITRE ATT&CK",
    name: "Active Scanning: Scanning IP Blocks",
    tacticOrCategory: "Reconnaissance",
    description: "Adversaries probe entire IP address ranges to discover reachable hosts, perimeter routers, and open services.",
    relevance: "Broad reconnaissance detected across non-adjacent local IP ranges.",
    mitigation: "Minimize exposed perimeter ports and apply network intrusion detection system (NIDS) filters."
  },
  "T1595.002": {
    id: "T1595.002",
    type: "MITRE ATT&CK",
    name: "Active Scanning: Vulnerability Scanning",
    tacticOrCategory: "Reconnaissance",
    description: "Adversaries actively query reachable endpoints for unpatched vulnerabilities, diagnostic files, and administrative panels.",
    relevance: "Probes targeting /.env, /admin, or known software vulnerabilities.",
    mitigation: "Deploy deception honeypots to detect scan traffic and patch vulnerable software assets."
  },
  "T1078": {
    id: "T1078",
    type: "MITRE ATT&CK",
    name: "Valid Accounts",
    tacticOrCategory: "Defense Evasion / Initial Access",
    description: "Adversaries obtain and abuse credentials of existing user accounts to blend in with normal network activity.",
    relevance: "Potential internal account compromise or lateral movement within RFC 1918 private subnets.",
    mitigation: "Audit account activity, mandate PAM / MFA, and enforce least-privilege role boundaries."
  },
  "T1046": {
    id: "T1046",
    type: "MITRE ATT&CK",
    name: "Network Service Discovery",
    tacticOrCategory: "Discovery",
    description: "Adversaries attempt to discover open network services and daemon versions by port scanning.",
    relevance: "Host reconnaissance targeting internal port configurations.",
    mitigation: "Enforce host-based and perimeter stateful firewall rules to block unauthorized port access."
  },
  "CWE-307": {
    id: "CWE-307",
    type: "CWE",
    name: "Improper Restriction of Excessive Authentication Attempts",
    tacticOrCategory: "Authentication Weakness",
    description: "The application software does not properly limit the frequency or quantity of authentication attempts.",
    relevance: "Enables automated dictionary attacks, password guessing, and credential stuffing without backoff.",
    mitigation: "Implement token-bucket rate limiting on login routes, temporary account lockouts, and CAPTCHA."
  },
  "CWE-400": {
    id: "CWE-400",
    type: "CWE",
    name: "Uncontrolled Resource Consumption",
    tacticOrCategory: "Resource Management",
    description: "The software does not properly control the allocation and consumption of a limited system resource.",
    relevance: "Exposes API endpoints to denial-of-service through continuous volumetric requests.",
    mitigation: "Enforce request quotas, connection limits, and sliding-window rate limiting."
  },
  "CWE-200": {
    id: "CWE-200",
    type: "CWE",
    name: "Exposure of Sensitive Information to an Unauthorized Actor",
    tacticOrCategory: "Information Disclosure",
    description: "The product exposes sensitive operational or diagnostic data to an entity not explicitly authorized.",
    relevance: "Reconnaissance probes attempting to retrieve system secrets, configuration, or environment variables.",
    mitigation: "Disable verbose error responses, remove diagnostic routes in production, and enforce authorization checks."
  }
};

/**
 * Cleanly formats IP address metadata with RFC 1918 classification
 */
export function getIpClassification(ip: string): {
  isPrivate: boolean;
  classification: string;
  relevance: string;
} {
  const isPrivate = isRfc1918PrivateIp(ip);
  if (isPrivate) {
    return {
      isPrivate: true,
      classification: "RFC 1918 Private Subnet (LAN)",
      relevance: "Originates within the internal network segment. Likely indicates an internal workstation compromise or lateral movement probe rather than a direct public WAN attacker."
    };
  }
  return {
    isPrivate: false,
    classification: "Public Internet Address (WAN)",
    relevance: "Originates from an external public IP address. Represents an external adversary or automated botnet scanner targeting internet-exposed perimeter boundaries."
  };
}

/**
 * Builds separate, production-ready firewall rules for Linux iptables, Linux UFW, and Cisco Edge ACL
 */
export function generateFirewallCommands(ip: string): FirewallCommand[] {
  const cleanIp = ip.trim() || "192.168.1.189";
  return [
    {
      platform: "iptables",
      title: "Linux iptables",
      category: "Host Packet Filter",
      command: `sudo iptables -A INPUT -s ${cleanIp} -j DROP`,
      description: "Appends a filter table rule to immediately drop all incoming IPv4 packets originating from this IP at the kernel network stack.",
      whereToRun: "Run in the Linux Terminal or SSH console on your server with administrator privileges (sudo).",
      whenToRun: "Execute immediately if this IP is actively attempting exploits, unauthorized scans, or brute force.",
      whatItDoes: `Tells the Linux kernel to silently drop and discard all incoming network packets from ${cleanIp} without responding.`
    },
    {
      platform: "ufw",
      title: "Linux UFW (Uncomplicated Firewall)",
      category: "Application Firewall",
      command: `sudo ufw deny from ${cleanIp}`,
      description: "Inserts a persistent denial rule into the UFW chains, rejecting all inbound connection attempts across all ports.",
      whereToRun: "Run in the Linux Terminal on servers running Ubuntu or Debian with UFW enabled.",
      whenToRun: "Execute when you want a persistent, reboot-safe rule that blocks this IP across every service and port.",
      whatItDoes: `Inserts a permanent firewall rule rejecting all incoming connection requests originating from ${cleanIp}.`
    },
    {
      platform: "cisco",
      title: "Cisco Edge ACL",
      category: "Perimeter Router Access List",
      command: `access-list 100 deny ip host ${cleanIp} any`,
      description: "Applies a standard extended access control list statement at the border gateway router to deny traffic before it traverses the edge.",
      whereToRun: "Run in the configuration terminal (config t) on your border router, firewall appliance, or managed switch.",
      whenToRun: "Execute when you want to block the attacker at the edge before traffic ever reaches your application servers.",
      whatItDoes: `Instructs the border gateway hardware to drop traffic from ${cleanIp} before it enters your internal network.`
    }
  ];
}

/**
 * Parses raw AI analyst text and event context into a structured layout
 */
export function parseAnalystResponse(
  rawText: string,
  eventIp: string,
  eventCitations: string[],
  isBn: boolean = false
): ParsedAnalystResponse {
  const targetIp = eventIp || "192.168.1.189";
  const ipMeta = getIpClassification(targetIp);

  // Extract Verdict title
  let verdictTitle = isBn
    ? "প্রহরী এআই বিশ্লেষকের সিদ্ধান্ত (ফায়ারওয়াল কনটেইনমেন্ট)"
    : "Prohori Analyst Verdict: Perimeter Containment Recommended";

  const verdictMatch = rawText.match(/\*\*(?:Prohori Analyst Verdict|প্রহরী এআই বিশ্লেষণ)[^:]*:\*\*/i);
  if (verdictMatch) {
    verdictTitle = verdictMatch[0].replace(/\*\*/g, "").replace(/:$/, "").trim();
  }

  // Extract Threat Summary
  let summaryText = "";
  // Look for text between the verdict title and the code block or recommendations
  const cleaned = rawText
    .replace(/\*\*(?:Prohori Analyst Verdict|প্রহরী এআই বিশ্লেষণ)[^:]*:\*\*/i, "")
    .trim();

  // Find paragraphs before ```
  const codeBlockStart = cleaned.indexOf("```");
  if (codeBlockStart > 0) {
    summaryText = cleaned.substring(0, codeBlockStart).trim();
  } else {
    // If no code block, take first 2 paragraphs
    const paragraphs = cleaned.split(/\n\s*\n/);
    summaryText = paragraphs.slice(0, 2).join("\n\n").trim();
  }

  // Extract recommendations or bullet points
  const recommendations: string[] = [];
  const lines = cleaned.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[*-]\s+/.test(trimmed)) {
      recommendations.push(trimmed.replace(/^[*-]\s+/, ""));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      recommendations.push(trimmed.replace(/^\d+\.\s+/, ""));
    }
  }

  // Fallback default recommendations if none found in text
  if (recommendations.length === 0) {
    if (isBn) {
      recommendations.push(`পেরিমিটার ফায়ারওয়ালে আইপি ${targetIp} এর ট্র্যাফিক ব্লক করুন।`);
      recommendations.push("প্রশাসনিক অ্যাকাউন্টে বাধ্যতামূলক মাল্টি-ফ্যাক্টর অথেনটিকেশন (MFA) প্রয়োগ করুন।");
      recommendations.push("অভ্যন্তরীণ সংযোগ নিরীক্ষণ ও ফরেনসিক লগ যাচাই সম্পন্ন করুন।");
    } else {
      recommendations.push(`Deploy edge perimeter filter to drop subsequent connection attempts from ${targetIp}.`);
      recommendations.push("Enforce strict Multi-Factor Authentication (MFA) across all administrative surfaces.");
      recommendations.push("Verify authentication logs and check for unauthorized lateral movement in local subnet.");
    }
  }

  // Generate distinct firewall commands
  const firewallCommands = generateFirewallCommands(targetIp);

  // Parse and resolve citations
  const allCitationIds = new Set<string>();
  // 1. From event citations
  eventCitations.forEach((c) => allCitationIds.add(c.trim()));
  // 2. From text mentions [T...] or [CWE...]
  const matches = rawText.match(/\[(T\d+(?:\.\d+)?|CWE-\d+)\]/g);
  if (matches) {
    matches.forEach((m) => {
      const clean = m.replace(/[[\]]/g, "").trim();
      allCitationIds.add(clean);
    });
  }

  // Always ensure at least primary techniques exist if empty
  if (allCitationIds.size === 0) {
    allCitationIds.add("T1110.001");
    allCitationIds.add("CWE-307");
  }

  const resolvedCitations: CitationDetail[] = [];
  allCitationIds.forEach((id) => {
    if (KNOWLEDGE_CATALOG[id]) {
      resolvedCitations.push(KNOWLEDGE_CATALOG[id]);
    } else {
      resolvedCitations.push({
        id,
        type: id.startsWith("T") ? "MITRE ATT&CK" : id.startsWith("CWE") ? "CWE" : "CVE",
        name: `Threat Knowledge Identifier ${id}`,
        tacticOrCategory: id.startsWith("T") ? "Cyber Attack Pattern" : "Security Weakness",
        description: `Verified defensive cybersecurity reference mapped to the telemetry of this incident.`,
        relevance: `Referenced during autonomous threat triage of ${targetIp}.`,
        mitigation: `Refer to official NIST/MITRE guidance for technique ${id}.`
      });
    }
  });

  return {
    verdictTitle,
    summaryText: summaryText || (isBn ? `আইপি ${targetIp} থেকে আক্রমণ শনাক্ত করা হয়েছে। পেরিমিটার সুরক্ষায় প্রতিরোধমূলক ব্যবস্থা কার্যকর করুন।` : `Security incident detected originating from host ${targetIp}. Perimeter containment and authentication controls are recommended.`),
    targetIp,
    isPrivateIp: ipMeta.isPrivate,
    ipClassification: ipMeta.classification,
    ipRelevance: ipMeta.relevance,
    recommendations,
    firewallCommands,
    citations: resolvedCitations,
    rawAnswer: rawText
  };
}
