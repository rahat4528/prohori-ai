import type { EventSeverity, SecurityEvent } from "../types";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Flame
} from "lucide-react";
import { isRfc1918PrivateIp } from "./analystFallback";

// Beginner-friendly plain language attack title mapping
export function getFriendlyEventTitle(type: string, lang: "en" | "bn"): string {
  const isBn = lang === "bn";
  switch (type) {
    case "recon_probe":
      return isBn ? "সন্দেহজনক নেটওয়ার্ক স্ক্যানিং" : "Suspicious Network Scanning";
    case "open_port":
      return isBn ? "উন্মুক্ত নেটওয়ার্ক পোর্ট পাওয়া গেছে" : "Open Network Port Found";
    case "service_identified":
      return isBn ? "স্বীকৃত সার্ভিস শনাক্তকরণ" : "Authorized Service Discovery";
    case "jndi_injection":
      return isBn ? "দূরবর্তী নিয়ন্ত্রণ নেওয়ার চেষ্টা (লগফরশেল)" : "Remote Takeover Attempt (Log4Shell Attack)";
    case "brute_force_suspected":
      return isBn ? "বারংবার পাসওয়ার্ড অনুমানের চেষ্টা (ব্রুট ফোর্স)" : "Repeated Password Guessing (Brute Force)";
    case "login_attempt_burst":
      return isBn ? "একযোগে বহু অ্যাকাউন্টে প্রবেশের চেষ্টা" : "Mass Password Guessing (Credential Stuffing)";
    case "rate_limit_violation":
      return isBn ? "অতিরিক্ত ট্র্যাফিক পাঠানো (রেট লিমিট লঙ্ঘন)" : "Traffic Flooding (Too Many Requests)";
    case "vulnerability_detected":
      return isBn ? "পরিচিত সফটওয়্যার দুর্বলতা শনাক্ত" : "Known Software Weakness Found";
    case "multi_stage_attack_campaign":
      return isBn ? "বহু-পর্যায়ের সমন্বিত আক্রমণ" : "Multi-Step Attack Campaign";
    case "sql_injection":
      return isBn ? "ডাটাবেজ নিয়ন্ত্রণের চেষ্টা (এসকিউএল ইনজেকশন)" : "Database Takeover Attempt (SQL Injection)";
    case "ransomware_indicator":
      return isBn ? "র‍্যানসমওয়্যার আচরণ (ব্যাকআপ মুছনের চেষ্টা)" : "Ransomware Activity (Deleting Backups)";
    case "ssrf_metadata_probe":
      return isBn ? "ক্লাউড মেটাডেটা প্ররোচনা (SSRF)" : "Cloud Server Secret Data Probe (SSRF)";
    case "command_injection":
      return isBn ? "অননুমোদিত সিস্টেম কমান্ড চালানোর চেষ্টা" : "Unauthorized System Command Attempt";
    case "c2_beaconing":
      return isBn ? "আক্রমণকারী সার্ভারের সংকেত (সি২ বিকনিং)" : "Attacker Communication Signal (C2 Beaconing)";
    default:
      return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

// Short, clear one-line explanation below the title in list cards
export function getFriendlyEventSubtitle(type: string, lang: "en" | "bn"): string {
  const isBn = lang === "bn";
  switch (type) {
    case "recon_probe":
      return isBn
        ? "উন্মুক্ত পোর্ট ও পথ খুঁজতে বাইরের স্ক্যানার নেটওয়ার্ক পরীক্ষা করছে"
        : "External scanner probing for open doors and listening ports";
    case "open_port":
      return isBn
        ? "হোস্টের একটি পোর্ট সক্রিয় এবং ইনকামিং রিকোয়েস্টে সাড়া দিয়েছে"
        : "A network port responded to an incoming connection probe";
    case "service_identified":
      return isBn
        ? "হোস্টে নতুন পোর্ট বা নেটওয়ার্ক সার্ভিস নথিভুক্ত করা হয়েছে"
        : "New listening port or network daemon recorded on the host";
    case "jndi_injection":
      return isBn
        ? "লগফরজে দুর্বলতা কাজে লাগিয়ে সার্ভারে অননুমোদিত কোড চালানোর চেষ্টা"
        : "Adversary exploiting Log4Shell to run unauthorized remote programs";
    case "brute_force_suspected":
      return isBn
        ? "স্বয়ংক্রিয় সফটওয়্যার দিয়ে বারবার সাধারণ পাসওয়ার্ড অনুমান করছে"
        : "Automated tool trying common passwords against login page";
    case "login_attempt_burst":
      return isBn
        ? "একাধিক অ্যাকাউন্টে পূর্বে ফাঁস হওয়া পাসওয়ার্ড দিয়ে প্রবেশের চেষ্টা"
        : "Rapid credential stuffing trying stolen passwords across accounts";
    case "rate_limit_violation":
      return isBn
        ? "অতিরিক্ত রিকোয়েস্ট পাঠিয়ে সার্ভার ব্যাহত করার চেষ্টা, ধীর করা হয়েছে"
        : "Client sending rapid bursts of requests, temporarily throttled";
    case "vulnerability_detected":
      return isBn
        ? "পরিচিত নিরাপত্তা দুর্বলতা যুক্ত সফটওয়্যার, যাতে প্যাচ প্রয়োজন"
        : "Unpatched software service found that requires security updates";
    case "multi_stage_attack_campaign":
      return isBn
        ? "আক্রমণকারী ধাপে ধাপে পর্যবেক্ষণ ও সিস্টেমে প্রবেশের চেষ্টা করছে"
        : "Attacker progressing through reconnaissance and exploitation steps";
    case "sql_injection":
      return isBn
        ? "ইনপুট ফিল্ডে ক্ষতিকর কোড পাঠিয়ে ডাটাবেজ চুরির চেষ্টা"
        : "Attacker injecting malicious database commands via web input";
    case "ransomware_indicator":
      return isBn
        ? "সিস্টেম রিকভারি রোধে শ্যাডো কপি ব্যাকআপ মুছে ফেলার চেষ্টা"
        : "Attempt to delete Volume Shadow Copies to prevent system recovery";
    case "ssrf_metadata_probe":
      return isBn
        ? "ক্লাউড মেটাডেটা থেকে গোপন এপিআই কি চুরির চেষ্টা"
        : "Probe querying internal cloud metadata to steal secret API keys";
    case "command_injection":
      return isBn
        ? "অপারেটিং সিস্টেমে সরাসরি শেল কমান্ড চালানোর চেষ্টা"
        : "Attempt to execute raw operating system commands on the host";
    case "c2_beaconing":
      return isBn
        ? "সংক্রামিত হোস্ট আক্রমণকারীর নিয়ন্ত্রণকারী সার্ভারের সাথে যোগাযোগ করছে"
        : "Outbound signals indicating an infected host talking to attacker";
    default:
      return isBn
        ? "সিস্টেমে একটি অস্বাভাবিক ও লক্ষণীয় নিরাপত্তা আচরণ শনাক্ত হয়েছে"
        : "Unusual network activity detected on the monitored perimeter";
  }
}

// 4-Part Beginner-Friendly Incident Breakdown: What Happened, Why It Matters, Who is the Attacker, What To Do
export interface BeginnerBreakdown {
  whatHappened: string;
  whyItMatters: string;
  whoIsAttacker: string;
  whatToDo: string[];
}

export function getBeginnerIncidentBreakdown(
  event: SecurityEvent,
  lang: "en" | "bn"
): BeginnerBreakdown {
  const isBn = lang === "bn";
  const sourceIp =
    event.details?.source_ip ||
    event.details?.attacker_ip ||
    event.details?.client_ip ||
    "192.168.1.189";
  const isPrivate = isRfc1918PrivateIp(sourceIp);
  const type = event.type || "";

  if (type === "jndi_injection") {
    return {
      whatHappened: isBn
        ? `আইপি ${sourceIp} থেকে আপনার লগইন সার্ভারে একটি বিশেষ ক্ষতিকর কোড (\${jndi:ldap://...}) পাঠানো হয়েছে। এটি বহুল পরিচিত 'লগফরশেল' (Log4Shell) নিরাপত্তা দুর্বলতাকে আঘাত করার চেষ্টা।`
        : `An attacker at IP ${sourceIp} sent an exploit string (\${jndi:ldap://...}) to your login endpoint, targeting the famous Log4Shell vulnerability in Java systems.`,
      whyItMatters: isBn
        ? "যদি এই আক্রমণ সফল হতো, আক্রমণকারী আপনার সার্ভারের সম্পূর্ণ রিমোট কন্ট্রোল পেয়ে যেত এবং যেকোনো ফাইল মুছে ফেলা বা ম্যালওয়্যার ইনস্টল করার ক্ষমতা পেত।"
        : "If successful, this allows the attacker to execute unauthorized programs, install ransomware, or take complete remote control of your server.",
      whoIsAttacker: isPrivate
        ? (isBn
            ? `এই আইপি (${sourceIp}) আপনার লোকাল ওয়াই-ফাই বা অফিস নেটওয়ার্কের। এর মানে লোকাল নেটওয়ার্কের কোনো কম্পিউটার বা ফোন হয়তো সংক্রামিত হয়েছে বা কেউ পরীক্ষা চালাচ্ছে।`
            : `This IP (${sourceIp}) is on your local Wi-Fi or office network (LAN). An internal PC or phone may be infected with malware or running unauthorized tests.`)
        : (isBn
            ? `এই আইপি (${sourceIp}) ইন্টারনেটের একটি উন্মুক্ত পাবলিক ঠিকানা (WAN)। আপনার নেটওয়ার্কের বাইরের কোনো হ্যাকার বা অটোমেটেড বট আক্রমণ চালাচ্ছে।`
            : `This IP (${sourceIp}) is an external Public Internet Address (WAN). An automated bot scanner or remote adversary outside your building is targeting your server.`),
      whatToDo: isBn
        ? [
            "১. নিচের ফায়ারওয়াল কমান্ড কপি করে বা 'আক্রমণকারী ব্লক অনুমোদন' বাটনে ক্লিক করে এই আইপিটি অবিলম্বে ব্লক করুন।",
            "২. সার্ভারে ব্যবহৃত সকল জাভা লাইব্রেরি ও Log4j ভার্সন ২.১৭.১ বা তদূর্ধ্ব ভার্সনে আপডেট করুন।",
            "৩. ওয়েব গেটওয়েতে '${jndi:' যুক্ত রিকোয়েস্ট স্বয়ংক্রিয়ভাবে বাতিল করার ফিল্টার সক্রিয় রাখুন।"
          ]
        : [
            "1. Block this attacker's IP immediately using the firewall commands or the 'Approve Defense' button below.",
            "2. Update all Java applications and Log4j libraries to version 2.17.1 or newer to eliminate the bug permanently.",
            "3. Ensure your web application firewall (WAF) drops requests containing '${jndi:' strings."
          ]
    };
  }

  if (type === "recon_probe" || type === "open_port") {
    return {
      whatHappened: isBn
        ? `আইপি ${sourceIp} আপনার নেটওয়ার্কের বিভিন্ন পোর্ট ও সার্ভিসে সংযোগ পাঠিয়ে পরীক্ষা করেছে যে কোন কোন পোর্ট খোলা এবং কোন সফটওয়্যার চলছে।`
        : `A network scanner from IP ${sourceIp} probed your ports to discover which services, applications, or database ports are open and accessible.`,
      whyItMatters: isBn
        ? "হ্যাকাররা সরাসরি আঘাত হানার আগে দুর্বল সফটওয়্যার বা অরক্ষিত লগইন পেজ খুঁজে পেতে এভাবে চারদিক স্ক্যান করে তথ্য সংগ্রহ করে।"
        : "Scanners search for open doors and outdated software before launching direct break-in attempts. Catching them early lets you close vulnerable ports before damage occurs.",
      whoIsAttacker: isPrivate
        ? (isBn
            ? `এটি আপনার লোকাল ওয়াই-ফাই বা অফিসের নিজস্ব ডিভাইসের আইপি (${sourceIp})। অভ্যন্তরীণ কোনো ডিভাইস থেকে স্ক্যানিং চালানো হচ্ছে।`
            : `This device (${sourceIp}) is connected to your local Wi-Fi / LAN network. A computer or smart device inside your network is scanning other local devices.`)
        : (isBn
            ? `এটি একটি বহিরাগত পাবলিক ইন্টারনেট আইপি (${sourceIp})। ইন্টারনেটের কোনো স্বয়ংক্রিয় বট আপনার নেটওয়ার্কের উন্মুক্ত পোর্ট পরীক্ষা করছে।`
            : `This IP (${sourceIp}) is an external Public Internet Address (WAN). An automated internet crawler is scanning public IP blocks for reachable servers.`),
      whatToDo: isBn
        ? [
            "১. নিচের ফায়ারওয়াল ব্লক কমান্ড ব্যবহার করে এই আইপির স্ক্যান ট্র্যাফিক পুরোপুরি বন্ধ করুন।",
            "২. আপনার রাউটার বা ক্লাউড ফায়ারওয়ালে অপ্রয়োজনীয় পোর্টগুলো (যেমন 22, 3389, 8080) পাবলিক ইন্টারনেট থেকে বন্ধ রাখুন।",
            "৩. প্রহরীর ডিকয় হানিপট সক্রিয় রাখুন যাতে ভবিষ্যতে এ ধরনের অনুসন্ধান শুরুতেই ধরা পড়ে।"
          ]
        : [
            "1. Copy the firewall command below to immediately drop port scanning packets from this IP address.",
            "2. Close or filter any non-essential ports (e.g. SSH, RDP, databases) so they cannot be seen from the public internet.",
            "3. Keep PROHORI deception honeypots running to trap and expose future scans automatically."
          ]
    };
  }

  if (type === "brute_force_suspected" || type === "login_attempt_burst") {
    return {
      whatHappened: isBn
        ? `আইপি ${sourceIp} থেকে আপনার লগইন পেজে খুব দ্রুত অসংখ্য সাধারণ পাসওয়ার্ড ও ইউজারনেম অনুমান করে প্রবেশের চেষ্টা চালানো হয়েছে।`
        : `An automated script from IP ${sourceIp} repeatedly submitted guessed username and password combinations to your login page in rapid succession.`,
      whyItMatters: isBn
        ? "যদি কোনো ইউজার সাধারণ বা দুর্বল পাসওয়ার্ড ব্যবহার করে থাকে, আক্রমণকারী তা অনুমান করে সিস্টেমে অনধিকার প্রবেশ করতে পারে।"
        : "If any user account has an easy or reused password, the attacker could successfully guess it and steal sensitive personal or business data.",
      whoIsAttacker: isPrivate
        ? (isBn
            ? `এই আইপি (${sourceIp}) আপনার লোকাল ওয়াই-ফাইয়ের একটি ডিভাইসের। অফিসের কোনো পিসি বা মোবাইল থেকে ক্রমাগত ভুল পাসওয়ার্ড দিয়ে লগইনের চেষ্টা হচ্ছে।`
            : `This IP (${sourceIp}) belongs to a device on your local Wi-Fi / LAN network. Someone inside your network is repeatedly failing or testing logins.`)
        : (isBn
            ? `এই আইপি (${sourceIp}) বাইরের ইন্টারনেটের। কোনো রিমোট বটনেট আপনার লগইন পেজে ডিকশনারি অ্যাটাক চালাচ্ছে।`
            : `This IP (${sourceIp}) is a Public Internet Address (WAN). An automated botnet is running dictionary attacks against your public login portal.`),
      whatToDo: isBn
        ? [
            "১. নিচের 'প্রতিরক্ষা অনুমোদন করুন' বাটনে ক্লিক করে এই আইপিটি অবিলম্বে এপিআই গার্ডে ব্লক করুন।",
            "২. অ্যাকাউন্টে ৫ বার ভুল পাসওয়ার্ড দিলে সাময়িক লকআউট এবং টু-ফ্যাক্টর অথেনটিকেশন (2FA) বাধ্যতামূলক করুন।",
            "৩. ব্যবহারকারীদের অনুমানযোগ্য পাসওয়ার্ড বাদ দিয়ে জটিল পাসওয়ার্ড ব্যবহারের নির্দেশ দিন।"
          ]
        : [
            "1. Click 'Approve Defense' or copy the firewall rule below to immediately block this attacker IP.",
            "2. Enforce Multi-Factor Authentication (MFA / 2FA) and automatic account lockout after 5 consecutive failures.",
            "3. Audit user accounts to ensure no default credentials ('admin/admin', '123456') are in use."
          ]
    };
  }

  if (type === "rate_limit_violation") {
    return {
      whatHappened: isBn
        ? `আইপি ${sourceIp} খুব অল্প সময়ের মধ্যে মাত্রাতিরিক্ত রিকোয়েস্ট পাঠিয়েছে, যা নির্ধারিত সীমা অতিক্রম করেছে। প্রহরীর রেট লিমিটার এটি শনাক্ত করেছে।`
        : `A client at IP ${sourceIp} sent an unusually high burst of requests in a few seconds, exceeding normal usage limits and tripping the API rate limiter.`,
      whyItMatters: isBn
        ? "একটানা অতিরিক্ত ট্র্যাফিক পাঠালে সার্ভার ক্র্যাশ করতে পারে বা অন্যান্য বৈধ সাধারণ ব্যবহারকারীদের জন্য ওয়েবসাইট অত্যন্ত ধীর হয়ে যেতে পারে (ডিনায়াল অফ সার্ভিস)।"
        : "Uncontrolled request floods consume CPU and memory, causing severe slowdowns or complete downtime for legitimate users (Denial of Service).",
      whoIsAttacker: isPrivate
        ? (isBn
            ? `এই ডিভাইসটি (${sourceIp}) আপনার লোকাল নেটওয়ার্কের। হয়তো কোনো অটোমেশন স্ক্রিপ্ট বা পরীক্ষা মাত্রাতিরিক্ত ট্র্যাফিক তৈরি করছে।`
            : `This device (${sourceIp}) is on your local Wi-Fi / LAN network. An internal tool or malfunctioning app may be looping requests.`)
        : (isBn
            ? `এই আইপি (${sourceIp}) বাইরের ইন্টারনেটের। কোনো আক্রমণকারী আপনার এপিআইকে ডাউন করার উদ্দেশ্যে ট্র্যাফিক পাঠাচ্ছে।`
            : `This IP (${sourceIp}) is a Public Internet Address (WAN). An external entity is spamming your public endpoints with excessive requests.`),
      whatToDo: isBn
        ? [
            "১. রেট লিমিটার ইতিমধ্যে এই আইপিকে HTTP 429 স্ট্যাটাস দিয়ে সাময়িক ধীর করেছে।",
            "২. আক্রমণ স্থায়ী হলে নিচের বাটনে ক্লিক করে এই আইপিটিকে পুরোপুরি ব্লক করে দিন।",
            "৩. রিভার্স প্রক্সিতে (Nginx বা ক্লাউডফ্লেয়ার) রেট লিমিটিং এবং ডিওএস ফিল্টার সক্রিয় রাখুন।"
          ]
        : [
            "1. PROHORI's Rate Limiter has already throttled this IP with HTTP 429 (Too Many Requests) responses.",
            "2. If this traffic continues or appears malicious, click 'Approve Defense' below to permanently drop its packets.",
            "3. Verify that your reverse proxy (e.g. Nginx, Cloudflare) has rate limiting enabled across all API routes."
          ]
    };
  }

  // General fallback for all other alerts
  return {
    whatHappened: isBn
      ? `আইপি ${sourceIp} থেকে একটি অস্বাভাবিক ও সন্দেহজনক নিরাপত্তা আচরণ শনাক্ত করা হয়েছে (${event.type.replace(/_/g, " ")})।`
      : `Suspicious activity matching pattern '${event.type.replace(/_/g, " ")}' was detected originating from host ${sourceIp}.`,
    whyItMatters: isBn
      ? "সময়মতো প্রতিরোধ না করলে অনাকাঙ্ক্ষিত এই আচরণ সিস্টেমের গোপনীয়তা নষ্ট বা অননুমোদিত অ্যাক্সেসের সুযোগ তৈরি করতে পারে।"
      : "Unchecked suspicious connections can expose sensitive application endpoints or escalate into unauthorized system access.",
    whoIsAttacker: isPrivate
      ? (isBn
          ? `এই আইপি (${sourceIp}) আপনার অভ্যন্তরীণ নেটওয়ার্কের (LAN)। স্থানীয় কোনো ডিভাইস থেকে এই কার্যক্রম পরিচালিত হচ্ছে।`
          : `This IP (${sourceIp}) belongs to your internal local network (LAN / Wi-Fi). It represents a device inside your building.`)
      : (isBn
          ? `এই আইপি (${sourceIp}) বাইরের ইন্টারনেটের (WAN)। ইন্টারনেটের কোনো বহিরাগত হোস্ট আপনার সার্ভারে প্রবেশ করার চেষ্টা করছে।`
          : `This IP (${sourceIp}) is a Public Internet Address (WAN), located outside your local network on the global internet.`),
    whatToDo: isBn
      ? [
          "১. নিচের ফায়ারওয়াল ব্লক কমান্ড প্রয়োগ করে এই আইপি থেকে পরবর্তী সংযোগ প্রতিহত করুন।",
          "২. নিচের প্রযুক্তিগত প্রমাণ দেখে লক্ষ্যবস্তু করা পথ ও প্যারামিটার পরীক্ষা করুন।",
          "৩. অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে মাল্টি-ফ্যাক্টর অথেনটিকেশন চালু রাখুন।"
        ]
      : [
          "1. Deploy the suggested firewall command to drop all incoming packets from this source IP.",
          "2. Review the technical evidence below to check the targeted application URL or path.",
          "3. Verify that sensitive administration portals require strong passwords and multi-factor authentication."
        ]
  };
}

// Beginner-friendly MITRE ATT&CK and CWE explanation helper
export interface MitreFriendlyInfo {
  code: string;
  friendlyName: string;
  simpleExplanation: string;
  mitigationTip: string;
}

export function getMitreFriendlyInfo(
  techniqueId: string,
  lang: "en" | "bn"
): MitreFriendlyInfo {
  const isBn = lang === "bn";
  const clean = techniqueId.trim().replace(/[[\]]/g, "");

  switch (clean) {
    case "T1190":
      return {
        code: "T1190",
        friendlyName: isBn ? "সফটওয়্যারের পরিচিত দুর্বলতা কাজে লাগানো" : "Exploiting Web Software Vulnerabilities",
        simpleExplanation: isBn
          ? "আক্রমণকারী ওয়েব সার্ভারের সফটওয়্যার বা লাইব্রেরির জানা ত্রুটিকে কাজে লাগিয়ে সিস্টেমে ঢোকার চেষ্টা করে।"
          : "Adversaries search for and exploit known bugs in web servers and software libraries to gain unauthorized access.",
        mitigationTip: isBn
          ? "নিয়মিত সফটওয়্যার আপডেট দিন এবং দুর্বল প্লাগইন বা লাইব্রেরি মুছে ফেলুন।"
          : "Keep all web frameworks, software packages, and dependencies updated to the latest security releases."
      };
    case "T1110.001":
    case "T1110":
      return {
        code: clean,
        friendlyName: isBn ? "পাসওয়ার্ড অনুমানের চেষ্টা (ব্রুট ফোর্স)" : "Password Guessing (Brute Force)",
        simpleExplanation: isBn
          ? "একটি স্বয়ংক্রিয় প্রোগ্রাম সাধারণ ডিকশনারি পাসওয়ার্ড দিয়ে একের পর এক লগইন করার চেষ্টা চালায়।"
          : "An automated program tries common dictionary passwords one by one to break into valid user accounts.",
        mitigationTip: isBn
          ? "টু-ফ্যাক্টর অথেনটিকেশন (2FA) চালু রাখুন এবং ৫ বার ভুল পাসওয়ার্ড দিলে অ্যাকাউন্ট সাময়িক লক করুন।"
          : "Enforce Multi-Factor Authentication (2FA) and automatically lock accounts after multiple failed login attempts."
      };
    case "T1499.002":
    case "T1499":
      return {
        code: clean,
        friendlyName: isBn ? "সার্ভারে অতিরিক্ত ট্র্যাফিকের চাপ সৃষ্টি (DoS)" : "Server Traffic Flooding (Denial of Service)",
        simpleExplanation: isBn
          ? "সার্ভারের মেমোরি ও সিপিইউ শেষ করে দিতে প্রচুর অপ্রয়োজনীয় রিকোয়েস্ট পাঠানো হয় যাতে সাধারণ মানুষ ঢুকতে না পারে।"
          : "Adversaries flood web APIs with high volumes of requests to exhaust system resources and take the website down.",
        mitigationTip: isBn
          ? "রেট লিমিটিং চালু রাখুন যাতে কোনো একজন ব্যবহারকারী অতিরিক্ত রিকোয়েস্ট পাঠাতে না পারে।"
          : "Enable rate limiting at your reverse proxy (e.g. Nginx, Cloudflare) to throttle abusive traffic."
      };
    case "T1595.002":
    case "T1595.001":
    case "T1595":
      return {
        code: clean,
        friendlyName: isBn ? "নেটওয়ার্ক ও সফটওয়্যার স্ক্যানিং" : "Vulnerability & Network Scanning",
        simpleExplanation: isBn
          ? "হ্যাকাররা স্বয়ংক্রিয় স্ক্যানার দিয়ে খুঁজে দেখে কোনো সার্ভার খোলা আছে কিনা বা কোনো দুর্বলতা আছে কিনা।"
          : "Adversaries crawl IP addresses searching for open ports, unprotected admin pages, and known software flaws.",
        mitigationTip: isBn
          ? "অপ্রয়োজনীয় সকল পোর্ট বন্ধ রাখুন এবং ডিকয় হানিপট দিয়ে প্রাথমিক স্ক্যানিং শনাক্ত করুন।"
          : "Close unnecessary perimeter ports and deploy deception honeypots to catch scanners before they attack."
      };
    case "T1046":
      return {
        code: "T1046",
        friendlyName: isBn ? "উন্মুক্ত নেটওয়ার্ক পোর্ট অনুসন্ধান" : "Finding Open Network Ports",
        simpleExplanation: isBn
          ? "আক্রমণকারী বিভিন্ন পোর্ট নম্বরে সংকেত পাঠিয়ে দেখে কোন সার্ভার সার্ভিসটি ইন্টারনেটে খোলা।"
          : "A scanner sends packets to different port numbers to see which ports are listening for connections.",
        mitigationTip: isBn
          ? "ফায়ারওয়াল দিয়ে বহিরাগতদের জন্য ইন্টারনাল পোর্টগুলো বন্ধ রাখুন।"
          : "Configure firewall rules so internal ports cannot be reached from the public internet."
      };
    case "T1078":
      return {
        code: "T1078",
        friendlyName: isBn ? "আসল ইউজার অ্যাকাউন্ট অপব্যবহার" : "Abuse of Legitimate Accounts",
        simpleExplanation: isBn
          ? "আক্রমণকারী চুরি করা ইউজারনেম ও পাসওয়ার্ড দিয়ে সাধারণ ব্যবহারকারীর মতো সিস্টেমে প্রবেশ করে।"
          : "Adversaries obtain valid credentials to log in and blend in with normal network activity.",
        mitigationTip: isBn
          ? "সকল কর্মীর জন্য পাসওয়ার্ড জটিল করা এবং টু-ফ্যাক্টর অথেনটিকেশন বাধ্যতামূলক করা।"
          : "Require strong unique passwords and multi-factor authentication across all accounts."
      };
    default:
      return {
        code: clean,
        friendlyName: isBn ? `সাইবার আক্রমণ কৌশল (${clean})` : `Security Threat Technique (${clean})`,
        simpleExplanation: isBn
          ? "একটি বিশ্বস্ত ও আন্তর্জাতিকভাবে স্বীকৃত সাইবার আক্রমণ পদ্ধতি যা এই সতর্কতার সাথে মিলে গেছে।"
          : "A verified industry-standard cybersecurity pattern identified in the network traffic of this alert.",
        mitigationTip: isBn
          ? "এই কৌশলের বিস্তারিত ও প্রতিরোধ দেখতে নিচের কার্ডটি বিস্তারিত করে দেখুন।"
          : "Review the technical mitigation guidance below to secure the affected service."
      };
  }
}

// Plain explanation of IP address types
export interface IpFriendlyInfo {
  ip: string;
  typeLabel: string;
  isPrivate: boolean;
  simpleMeaning: string;
  dangerContext: string;
}

export function getIpFriendlyInfo(ip: string, lang: "en" | "bn"): IpFriendlyInfo {
  const isBn = lang === "bn";
  const cleanIp = ip.trim() || "192.168.1.189";
  const isPrivate = isRfc1918PrivateIp(cleanIp);

  if (isPrivate) {
    return {
      ip: cleanIp,
      typeLabel: isBn ? "লোকাল ওয়াই-ফাই / প্রাইভেট নেটওয়ার্ক (LAN)" : "Local Wi-Fi / Private Network (LAN)",
      isPrivate: true,
      simpleMeaning: isBn
        ? "এই আইপি ঠিকানাটি শুধুমাত্র আপনার লোকাল ওয়াই-ফাই বা অফিসের নিজস্ব নেটওয়ার্কের ভেতরে ব্যবহৃত হয়। ইন্টারনেটের সরাসরি কেউ এই ঠিকানায় ঢুকতে পারে না।"
        : "This address belongs exclusively to your local home or office Wi-Fi network (RFC 1918). It is not reachable directly from the public internet.",
      dangerContext: isBn
        ? "এর মানে আপনার নেটওয়ার্কের ভেতরে থাকা কোনো কম্পিউটার, মোবাইল বা ডিভাইস থেকে এই রিকোয়েস্ট এসেছে। এটি কোনো ভুল কনফিগারেশন অথবা অভ্যন্তরীণ ডিভাইসে ম্যালওয়্যারের সংকেত হতে পারে।"
        : "This activity originated from inside your building. It indicates either a local device running automated tests, a misconfiguration, or an internal workstation infected with malware."
    };
  }

  return {
    ip: cleanIp,
    typeLabel: isBn ? "পাবলিক ইন্টারনেট ঠিকানা (WAN)" : "Public Internet Address (WAN)",
    isPrivate: false,
    simpleMeaning: isBn
      ? "এই আইপি ঠিকানাটি উন্মুক্ত ইন্টারনেটে বিদ্যমান। এটি নির্দেশ করে যে বিশ্বের যেকোনো প্রান্ত থেকে যে কেউ এই ঠিকানার মাধ্যমে ইন্টারনেট ব্যবহার করছে।"
      : "This address exists on the public internet. Anyone across the globe connected to the internet can communicate using a public IP.",
    dangerContext: isBn
      ? "এর মানে আপনার নেটওয়ার্কের বাইরের কোনো অজানা হ্যাকার, ক্লাউড সার্ভার বা অটোমেটেড বট আপনার সার্ভারে আঘাত হানার চেষ্টা করছে। ফায়ারওয়ালে এই আইপি ব্লক করা সম্পূর্ণ নিরাপদ এবং কার্যকর।"
      : "This traffic originated from outside your local network. It represents an external bot, scanner, or remote adversary trying to breach your system. Blocking this IP stops the attacker without impacting your local devices."
  };
}

// Beginner-friendly definitions for cybersecurity buzzwords
export const GLOSSARY_TERMS: Record<string, { en: string; bn: string }> = {
  "Honeypot": {
    en: "A decoy trap server created by PROHORI that looks like a real database or login page. When hackers attack it, we catch them instantly without risking your real systems or files.",
    bn: "প্রহরীর তৈরি একটি ফাঁদ বা ডিকয় সার্ভার যা হ্যাকারদের কাছে আসল মনে হয়। হ্যাকাররা এখানে আক্রমণ করলে আসল তথ্য বা সার্ভারের ক্ষতি না করেই তাদের শনাক্ত করা যায়।"
  },
  "Rate Limiter": {
    en: "A digital security gatekeeper that monitors how fast clients send requests. If someone sends too many requests too quickly, it slows them down with HTTP 429 warnings.",
    bn: "একটি ডিজিটাল সিকিউরিটি গার্ড যা নজর রাখে কে কত দ্রুত রিকোয়েস্ট পাঠাচ্ছে। কেউ মাত্রাতিরিক্ত গতিতে রিকোয়েস্ট পাঠালে তাকে সাময়িক আটকে দেয়।"
  },
  "Public IP (WAN)": {
    en: "An IP address accessible across the worldwide internet. Traffic from a public IP means someone outside your home or office is connecting to your server.",
    bn: "সারাবিশ্বের ইন্টারনেটে দৃশ্যমান আইপি ঠিকানা। এখান থেকে ট্র্যাফিক আসার অর্থ হলো আপনার নেটওয়ার্কের বাইরের কোনো মানুষ বা বট সংযোগ করছে।"
  },
  "Private IP (LAN)": {
    en: "An internal IP address (like 192.168.x.x or 10.x.x.x) reserved for devices connected to your own local Wi-Fi router. It cannot be accessed directly from the internet.",
    bn: "বাসা বা অফিসের ওয়াই-ফাই রাউটারে যুক্ত ডিভাইসের নিজস্ব আইপি (যেমন 192.168.x.x)। এটি ইন্টারনেটের সাথে সরাসরি উন্মুক্ত থাকে না।"
  },
  "MITRE ATT&CK": {
    en: "A globally recognized encyclopedia of real-world cyberattack tactics and techniques, created by security researchers so defenders can systematically stop hackers.",
    bn: "বিশ্বব্যাপী সাইবার নিরাপত্তা বিশেষজ্ঞদের ব্যবহৃত হ্যাকিং কৌশল ও প্রতিরক্ষার একটি সর্বজনীন বিশ্বকোষ।"
  },
  "CVE (Vulnerability)": {
    en: "A standardized public catalog of known security flaws in software. When software has a CVE, it means security researchers found a bug that needs to be updated.",
    bn: "সফটওয়্যারের পরিচিত নিরাপত্তা ত্রুটির আন্তর্জাতিক তালিকা। কোনো সফটওয়্যারে CVE থাকার অর্থ হলো সেটিতে ত্রুটি রয়েছে এবং দ্রুত আপডেট করা প্রয়োজন।"
  },
  "Log4Shell": {
    en: "A critical software vulnerability discovered in Java's Log4j library that allowed remote hackers to run unauthorized commands on servers just by sending a crafted text string.",
    bn: "জাভার লগফরজে লাইব্রেরিতে পাওয়া একটি মারাত্মক ত্রুটি, যার মাধ্যমে আক্রমণকারীরা শুধুমাত্র একটি নির্দিষ্ট টেক্সট পাঠিয়ে দূর থেকেই পুরো সার্ভার দখল করতে পারত।"
  },
  "Brute Force": {
    en: "An automated attack where software guesses hundreds or thousands of common passwords every minute until it cracks the account.",
    bn: "একটি স্বয়ংক্রিয় আক্রমণ যেখানে সফটওয়্যার মিনিটে শত শত পাসওয়ার্ড অনুমান করে লগইন করার চেষ্টা করে।"
  },
  "API Abuse Guard": {
    en: "PROHORI's built-in reverse proxy defense that intercepts incoming web requests and immediately drops traffic from malicious or blocked IP addresses.",
    bn: "প্রহরীর নিজস্ব ডিফেন্স ফিল্টার যা ক্ষতিকর আইপির রিকোয়েস্টগুলোকে সাথে সাথে আটকে দেয়।"
  },
  "Confidence Score": {
    en: "A percentage showing how certain the PROHORI AI reasoning engine is about its analysis, based on forensic network evidence and matched attack signatures.",
    bn: "প্রাপ্ত নেটওয়ার্ক প্রমাণ ও সাইবার আক্রমণ লক্ষণের উপর ভিত্তি করে এআই-এর সিদ্ধান্তের নিশ্চয়তার শতাংশ।"
  }
};

// Severity presentation with Strict 90/10 Palette and Accessible Shapes
export function getSeverityConfig(severity: EventSeverity, lang: "en" | "bn") {
  const isBn = lang === "bn";
  switch (severity) {
    case "critical":
      return {
        label: isBn ? "জরুরি (Critical)" : "Critical",
        icon: AlertOctagon,
        color: "var(--navy)",
        bg: "var(--coral)",
        border: "var(--coral)",
        className: "severity-badge-critical",
        shape: "■"
      };
    case "high":
      return {
        label: isBn ? "উচ্চ (High)" : "High",
        icon: Flame,
        color: "var(--navy)",
        bg: "var(--coral-alpha-15)",
        border: "var(--coral)",
        className: "severity-badge-high",
        shape: "▲"
      };
    case "medium":
      return {
        label: isBn ? "মাঝারি (Medium)" : "Medium",
        icon: AlertTriangle,
        color: "var(--navy)",
        bg: "var(--navy-alpha-12)",
        border: "var(--navy-alpha-40)",
        className: "severity-badge-medium",
        shape: "◆"
      };
    case "low":
      return {
        label: isBn ? "নিম্ন (Low)" : "Low",
        icon: Info,
        color: "var(--navy-alpha-75)",
        bg: "transparent",
        border: "var(--navy-alpha-25)",
        className: "severity-badge-low",
        shape: "●"
      };
    case "info":
    default:
      return {
        label: isBn ? "তথ্য (Info)" : "Info",
        icon: Info,
        color: "var(--navy-alpha-75)",
        bg: "var(--navy-alpha-08)",
        border: "var(--navy-alpha-20)",
        className: "severity-badge-info",
        shape: "○"
      };
  }
}
