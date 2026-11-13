import type { SecurityEvent } from "../types";

export interface ClientAnalystResult {
  answer: string;
  citations: string[];
}

export function isRfc1918PrivateIp(ip: string): boolean {
  const clean = ip.trim();
  if (clean.startsWith("10.") || clean.startsWith("192.168.") || clean.startsWith("127.")) {
    return true;
  }
  if (clean.startsWith("172.")) {
    const parts = clean.split(".");
    if (parts.length >= 2) {
      const second = parseInt(parts[1], 10);
      if (second >= 16 && second <= 31) return true;
    }
  }
  return false;
}

export function generateClientSideAnalystAnswer(
  question: string,
  event: SecurityEvent,
  language: "en" | "bn"
): ClientAnalystResult {
  const qLower = question.toLowerCase();
  const isBn = language === "bn" || /[\u0980-\u09FF]/.test(question);

  const details = event.details || {};
  const sourceIp =
    details.source_ip ||
    details.attacker_ip ||
    details.client_ip ||
    "192.168.1.189";
  const username = details.username_tried || details.username || "admin";
  const attempts = details.attempts_in_window || 7;
  const surface = details.simulated_surface || details.path || "/admin/login";

  let techniqueId = "T1110.001";
  let techniqueName = "Brute Force: Password Guessing";
  let tactic = "Credential Access";
  let cweId = "CWE-307";

  if (event.type?.includes("ratelimit") || event.type?.includes("blocked")) {
    techniqueId = "T1499.002";
    techniqueName = "Endpoint Denial of Service: Service Exhaustion Flood";
    tactic = "Impact";
    cweId = "CWE-400";
  } else if (event.type?.includes("recon") || event.type?.includes("probe")) {
    techniqueId = "T1595.002";
    techniqueName = "Active Scanning: Vulnerability Scanning";
    tactic = "Reconnaissance";
    cweId = "CWE-200";
  }

  // 1. Firewall commands intent
  const firewallKeywords = [
    "firewall", "block", "iptables", "ufw", "cisco", "rule", "command",
    "ফায়ারওয়াল", "ফায়ারওয়াল", "ব্লক", "আটকানো", "কমান্ড", "নিয়ম", "রুল"
  ];
  if (firewallKeywords.some((kw) => qLower.includes(kw))) {
    if (isBn) {
      return {
        answer: `**প্রহরী এআই বিশ্লেষণ (ফায়ারওয়াল কনটেইনমেন্ট):**

আক্রমণকারী আইপি \`${sourceIp}\` কে পেরিমিটার ডিফেন্সে ব্লক করতে নিচের কমান্ডগুলো কার্যকর করুন:

\`\`\`bash
# Linux iptables:
sudo iptables -A INPUT -s ${sourceIp} -j DROP

# Linux UFW:
sudo ufw deny from ${sourceIp}

# Cisco Edge ACL:
access-list 100 deny ip host ${sourceIp} any
\`\`\`

**প্রহরী অটোমেশন সুবিধা:** কনসোলের **"Approve Defense Countermeasure"** বোতামে ক্লিক করলে লোকাল রেট-লিমিটারে \`${sourceIp}\` স্বয়ংক্রিয়ভাবে ব্লক তালিকায় যুক্ত হয় এবং অপরিবর্তনীয় অডিট লগে এন্ট্রি সংরক্ষিত থাকে।

**উদ্ধৃতি (Citation):** [${techniqueId}] [${cweId}]`,
        citations: [techniqueId, cweId]
      };
    }
    return {
      answer: `**Prohori Analyst Verdict (Firewall Containment):**

To contain attacker IP \`${sourceIp}\` at the network perimeter, deploy the following firewall rules:

\`\`\`bash
# Linux iptables:
sudo iptables -A INPUT -s ${sourceIp} -j DROP

# Linux UFW:
sudo ufw deny from ${sourceIp}

# Cisco Edge ACL:
access-list 100 deny ip host ${sourceIp} any
\`\`\`

**Prohori Automated Enforcement:** Clicking **"Approve Defense Countermeasure"** in this console immediately adds \`${sourceIp}\` to the active rate-limiter blocklist with cryptographic audit trail.

**Knowledge Citation:** [${techniqueId}] [${cweId}]`,
      citations: [techniqueId, cweId]
    };
  }

  // 2. Primary vector intent
  const vectorKeywords = [
    "vector", "primary", "technique", "impact", "mechanism", "danger", "severity",
    "ভেক্টর", "কৌশল", "প্রভাব", "কীভাবে", "ঝুঁকি", "ক্ষতি", "বিপজ্জনক"
  ];
  if (vectorKeywords.some((kw) => qLower.includes(kw))) {
    if (isBn) {
      return {
        answer: `**প্রহরী এআই বিশ্লেষণ (আক্রমণ ভেক্টর ও প্রভাব):**

এই ঘটনার প্রাথমিক আক্রমণ ভেক্টর হলো MITRE ATT&CK কৌশল **[${techniqueId}: ${techniqueName}]** (${tactic}), যা দুর্বলতা **[${cweId}]** এর আওতাভুক্ত।

- **কার্যপ্রণালী:** আক্রমণকারী ডিকয় সারফেস \`${surface}\` লক্ষ্য করে স্বয়ংক্রিয় পাসওয়ার্ড পারমিউটেশন ও ক্রেডেনশিয়াল স্টাফিং চালাচ্ছে।
- **সম্ভাব্য ক্ষতি:** অননুমোদিত অ্যাডমিন অ্যাক্সেস লাভ করা এবং পরবর্তীতে ইন্টারনাল নেটওয়ার্কে ল্যাটারাল মুভমেন্ট পরিচালনা করা।
- **প্রস্তাবিত পদক্ষেপ:** পেরিমিটার ফায়ারওয়ালে আইপি ব্লক করা এবং প্রশাসনিক অ্যাকাউন্টে মাল্টি-ফ্যাক্টর অথেনটিকেশন (MFA) বাধ্যতামূলক করা।

**উদ্ধৃতি (Citation):** [${techniqueId}] [${cweId}]`,
        citations: [techniqueId, cweId]
      };
    }
    return {
      answer: `**Prohori Analyst Verdict (Primary Vector & Threat Impact):**

The primary attack vector corresponds to MITRE ATT&CK Technique **[${techniqueId}: ${techniqueName}]** (${tactic}), exploiting weaknesses categorized under **[${cweId}]**.\n\n- **Mechanism:** The adversary is executing high-frequency automated password guessing against \`${surface}\`.\n- **Potential Impact:** Compromise of administrative credentials followed by privilege escalation and internal lateral movement.\n- **Recommended Action:** Enforce perimeter edge blocking on \`${sourceIp}\` and mandate Multi-Factor Authentication (MFA) across all management accounts.\n\n**Knowledge Citation:** [${techniqueId}] [${cweId}]`,
      citations: [techniqueId, cweId]
    };
  }

  // 3. Insider vs external intent
  const insiderKeywords = [
    "insider", "external", "internal", "lan", "wan", "private", "public", "inside", "outside",
    "ইনসাইডার", "অভ্যন্তরীণ", "বহিঃস্থ", "বাইরে", "ভেতরে"
  ];
  if (insiderKeywords.some((kw) => qLower.includes(kw))) {
    const isPrivate = isRfc1918PrivateIp(sourceIp);
    if (isPrivate) {
      if (isBn) {
        return {
          answer: `**প্রহরী এআই বিশ্লেষণ (অভ্যন্তরীণ বনাম বহিঃস্থ মূল্যায়ন):**

উৎস আইপি \`${sourceIp}\` একটি **RFC 1918 প্রাইভেট নেটওয়ার্ক অ্যাড্রেস**। এটি নিশ্চিত করে যে ট্র্যাফিকটি অভ্যন্তরীণ নেটওয়ার্ক বা লোকাল সেগমেন্ট থেকে উৎপন্ন হয়েছে।

- **হুমকির ধরন:** এটি একটি **অভ্যন্তরীণ হুমকি (Insider Threat)** অথবা ইতিপূর্বে সংক্রামিত কোনো লোকাল ওয়ার্কস্টেশন থেকে ল্যাটারাল মুভমেন্টের চেষ্টা।
- **করণীয়:** অবিলম্বে উক্ত হোস্টকে 802.1X বা VLAN আইসোলেশনে পাঠান এবং ডিভাইসটির ফরেনসিক স্ক্যান সম্পন্ন করুন।

**উদ্ধৃতি (Citation):** [${techniqueId}] [T1078]`,
          citations: [techniqueId, "T1078"]
        };
      }
      return {
        answer: `**Prohori Analyst Verdict (Insider vs External Assessment):**

The originating IP \`${sourceIp}\` falls within the **RFC 1918 private IPv4 address space** (LAN segment).

- **Threat Classification:** This indicates either an **insider threat** (unauthorized internal user/device) or a **compromised internal host** executing lateral movement within the perimeter.
- **Recommended Action:** Immediately quarantine the host port via 802.1X / VLAN isolation and inspect DHCP and endpoint EDR telemetry.

**Knowledge Citation:** [${techniqueId}] [T1078]`,
        citations: [techniqueId, "T1078"]
      };
    } else {
      if (isBn) {
        return {
          answer: `**প্রহরী এআই বিশ্লেষণ (বহিঃস্থ আক্রমণ মূল্যায়ন):**

উৎস আইপি \`${sourceIp}\` একটি পাবলিক ইন্টারনেট আইপি (WAN)। এটি ইন্টারনেট থেকে পরিচালিত বহিঃস্থ রিকনেসান্স বা বটনেট আক্রমণ।

- **করণীয়:** পেরিমিটার এজ ফায়ারওয়ালে আইপিটি ড্রপ করুন।

**উদ্ধৃতি (Citation):** [${techniqueId}]`,
          citations: [techniqueId]
        };
      }
      return {
        answer: `**Prohori Analyst Verdict (External Threat Assessment):**

The originating IP \`${sourceIp}\` is a public WAN IPv4 address. This represents an external adversary or automated botnet scanner targeting internet-exposed perimeter boundaries.

- **Recommended Action:** Null-route or drop traffic at perimeter boundary.

**Knowledge Citation:** [${techniqueId}]`,
        citations: [techniqueId]
      };
    }
  }

  // 4. Identity / IP / target intent
  const identityKeywords = [
    "who", "ip", "attacker", "source", "credential", "password", "user", "username",
    "কে", "কারা", "আইপি", "উৎস", "ব্যবহারকারী", "পাসওয়ার্ড", "ক্রেডেনশিয়াল"
  ];
  if (identityKeywords.some((kw) => qLower.includes(kw))) {
    if (isBn) {
      return {
        answer: `**প্রহরী এআই বিশ্লেষণ (আক্রমণকারী ও লক্ষ্যবস্তু তথ্য):**

- **আক্রমণকারী আইপি:** \`${sourceIp}\`
- **টার্গেট ব্যবহারকারী:** \`${username}\`
- **চেষ্টার সংখ্যা:** মনিটরিং উইন্ডোতে \`${attempts}\` বার ব্যর্থ লগইন
- **টার্গেট সারফেস:** \`${surface}\` (ডিকয় হানিপট)

আক্রমণকারী ডিকয় অ্যাকাউন্টে ধারাবাহিক পাসওয়ার্ড অনুমান পরীক্ষা চালিয়েছে যা MITRE ATT&CK [${techniqueId}] এর সাথে মেলে।

**উদ্ধৃতি (Citation):** [${techniqueId}] [${cweId}]`,
        citations: [techniqueId, cweId]
      };
    }
    return {
      answer: `**Prohori Analyst Verdict (Adversary Profile & Target):**

- **Attacker Source IP:** \`${sourceIp}\`
- **Target Username:** \`${username}\`
- **Attempts Recorded:** \`${attempts}\` rapid authentication attempts
- **Targeted Surface:** \`${surface}\` (High-interaction decoy)

The adversary attempted repeated unauthorized permutations trapped by Prohori's deception perimeter.

**Knowledge Citation:** [${techniqueId}] [${cweId}]`,
      citations: [techniqueId, cweId]
    };
  }

  // 5. Mitigation intent
  const mitigateKeywords = [
    "mitigat", "action", "do next", "steps", "recommend", "remediation", "fix",
    "প্রস্তাব", "করণীয়", "পদক্ষেপ", "প্রতিকার", "সমাধান"
  ];
  if (mitigateKeywords.some((kw) => qLower.includes(kw))) {
    if (isBn) {
      return {
        answer: `**প্রহরী এআই বিশ্লেষণ (প্রস্তাবিত পদক্ষেপ):**

নিরাপত্তা সুরক্ষায় নিচের ৪টি পদক্ষেপ অবিলম্বে গ্রহণ করুন:

1. **পেরিমিটার ব্লকিং:** আইপি \`${sourceIp}\` কে এজ ফায়ারওয়ালে ব্লক করুন অথবা কনসোলে 'Approve Defense' ক্লিক করুন।
2. **ক্রেডেনশিয়াল সুরক্ষা:** ব্যবহারকারী \`${username}\` অ্যাকাউন্টে সেশন রিভোকে করুন এবং MFA সক্রিয় করুন।
3. **নেটওয়ার্ক অনুসন্ধান:** \`${sourceIp}\` থেকে অন্য কোনো সার্ভারে ট্র্যাফিক গিয়েছে কিনা অডিট লগে যাচাই করুন।
4. **ডিকয় পর্যবেক্ষণ:** হানিপটের টেলিমেট্রি নজরদারিতে রাখুন।

**উদ্ধৃতি (Citation):** [${techniqueId}] [${cweId}]`,
        citations: [techniqueId, cweId]
      };
    }
    return {
      answer: `**Prohori Analyst Verdict (Mitigation Protocol):**

Execute the following 4-stage containment protocol:

1. **Perimeter Containment:** Block \`${sourceIp}\` at edge firewall or click 'Approve Defense Countermeasure'.
2. **Identity Hardening:** Invalidate active tokens for \`${username}\` and enforce MFA.
3. **Telemetry Review:** Inspect proxy logs for correlated queries from \`${sourceIp}\`.
4. **Decoy Monitoring:** Maintain continuous sensor alerting on the decoy perimeter.

**Knowledge Citation:** [${techniqueId}] [${cweId}]`,
      citations: [techniqueId, cweId]
    };
  }

  // Default answer
  if (isBn) {
    return {
      answer: `**প্রহরী এআই বিশ্লেষণ:**

টেলিমেট্রি ইভেন্টটি MITRE ATT&CK কৌশল **[${techniqueId}: ${techniqueName}]** (${tactic}) এর সাথে সম্পর্কিত। উৎস আইপি \`${sourceIp}\` লক্ষ্য করে পেরিমিটার ফায়ারওয়াল ব্লক এবং একাউন্ট সিকিউরিটি রিভিউ করার সুপারিশ করা হচ্ছে।

**উদ্ধৃতি (Citation):** [${techniqueId}] [${cweId}]`,
      citations: [techniqueId, cweId]
    };
  }
  return {
    answer: `**Prohori Analyst Verdict:**

The investigated event correlates with MITRE ATT&CK Technique **[${techniqueId}: ${techniqueName}]** (${tactic}). Defensive perimeter containment and credential hardening are recommended against source IP \`${sourceIp}\`.

**Knowledge Citation:** [${techniqueId}] [${cweId}]`,
    citations: [techniqueId, cweId]
  };
}

