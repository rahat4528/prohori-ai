import type { EventSeverity } from "../types";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Flame
} from "lucide-react";

// Plain language attack mapping
export function getFriendlyEventTitle(type: string, lang: "en" | "bn"): string {
  const isBn = lang === "bn";
  switch (type) {
    case "login_attempt_burst":
      return isBn ? "ক্রেডেনশিয়াল স্টাফিং আক্রমণ" : "Credential Stuffing Attack";
    case "recon_probe":
      return isBn ? "রিকনেসান্স স্ক্যান" : "Reconnaissance Scan";
    case "rate_limit_violation":
      return isBn ? "এপিআই ফ্লাডিং অপব্যবহার" : "API Flooding / Abuse";
    case "vulnerability_detected":
      return isBn ? "নিরাপত্তা দুর্বলতা শনাক্ত" : "Vulnerable Service Detected";
    case "multi_stage_attack_campaign":
      return isBn ? "বহু-পর্যায়ের সমন্বিত আক্রমণ" : "Multi-Stage Attack Campaign";
    case "jndi_injection":
      return isBn ? "লগফরজে জেএনডিআই ইনজেকশন" : "Log4j JNDI Injection Attack";
    case "sql_injection":
      return isBn ? "এসকিউএল ইনজেকশন আক্রমণ" : "SQL Injection Attempt";
    case "ransomware_indicator":
      return isBn ? "র‍্যানসমওয়্যার শ্যাডো কপি মুছনের চেষ্টা" : "Ransomware Defense Evasion";
    case "ssrf_metadata_probe":
      return isBn ? "ক্লাউড মেটাডেটা প্ররোচনা (SSRF)" : "Cloud Metadata SSRF Probe";
    case "command_injection":
      return isBn ? "অননুমোদিত কমান্ড এক্সিকিউশন" : "Remote Command Injection";
    case "c2_beaconing":
      return isBn ? "সি২ কমান্ড অ্যান্ড কন্ট্রোল সিগন্যাল" : "C2 Beaconing Detected";
    default:
      return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

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
        shape: "🛑"
      };
    case "high":
      return {
        label: isBn ? "উচ্চ (High)" : "High",
        icon: Flame,
        color: "var(--navy)",
        bg: "transparent",
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
    default:
      return {
        label: isBn ? "নিম্ন (Low)" : "Low",
        icon: Info,
        color: "var(--navy-alpha-75)",
        bg: "transparent",
        border: "var(--navy-alpha-25)",
        className: "severity-badge-low",
        shape: "●"
      };
  }
}
