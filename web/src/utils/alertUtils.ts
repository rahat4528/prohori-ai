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

// Severity presentation with Icon + Shape + Text
export function getSeverityConfig(severity: EventSeverity, lang: "en" | "bn") {
  const isBn = lang === "bn";
  switch (severity) {
    case "critical":
      return {
        label: isBn ? "জরুরি (Critical)" : "Critical",
        icon: AlertOctagon,
        color: "#f87171",
        bg: "rgba(239, 68, 68, 0.2)",
        border: "rgba(239, 68, 68, 0.5)",
        shape: "🛑"
      };
    case "high":
      return {
        label: isBn ? "উচ্চ (High)" : "High",
        icon: Flame,
        color: "#fb923c",
        bg: "rgba(249, 115, 22, 0.2)",
        border: "rgba(249, 115, 22, 0.5)",
        shape: "⚠️"
      };
    case "medium":
      return {
        label: isBn ? "মাঝারি (Medium)" : "Medium",
        icon: AlertTriangle,
        color: "#facc15",
        bg: "rgba(234, 179, 8, 0.2)",
        border: "rgba(234, 179, 8, 0.5)",
        shape: "⚡"
      };
    case "low":
    default:
      return {
        label: isBn ? "নিম্ন (Low)" : "Low",
        icon: Info,
        color: "#38bdf8",
        bg: "rgba(6, 182, 212, 0.2)",
        border: "rgba(6, 182, 212, 0.5)",
        shape: "ℹ️"
      };
  }
}
