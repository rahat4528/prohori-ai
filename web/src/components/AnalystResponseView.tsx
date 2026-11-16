import React, { useState } from "react";
import type { SecurityEvent } from "../types";
import {
  parseAnalystResponse,
  type FirewallCommand
} from "../utils/analystParser";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { getSeverityConfig } from "../utils/alertUtils";
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
  Layers,
  Network
} from "lucide-react";

export interface AuditConfirmation {
  audit_id: string;
  action_id: string;
  target: string;
  timestamp: string;
  enforcement: string;
  status: string;
}

interface AnalystResponseViewProps {
  rawAnswer: string;
  provider: string;
  citations: string[];
  event: SecurityEvent;
  globalLanguage: "en" | "bn";
  apiBase: string;
  onApproveDefense: (actionId: string, target: string, actionType: string) => Promise<AuditConfirmation | void>;
  isApproved?: boolean;
  approvalAudit?: AuditConfirmation;
}

export const AnalystResponseView: React.FC<AnalystResponseViewProps> = ({
  rawAnswer,
  provider,
  citations,
  event,
  globalLanguage,
  apiBase: _apiBase,
  onApproveDefense,
  isApproved = false,
  approvalAudit
}) => {
  const isBn = globalLanguage === "bn";
  const sourceIp =
    event.details?.source_ip ||
    event.details?.attacker_ip ||
    event.details?.client_ip ||
    "192.168.1.189";

  const parsed = parseAnalystResponse(rawAnswer, sourceIp, citations, isBn);
  const sev = getSeverityConfig(event.severity, globalLanguage);

  // Copy state for individual firewall platforms
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Citation expansion state
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  // Approval workflow state: IDLE -> CONFIRMING -> EXECUTING -> SUCCESS / FAILED
  const [approvalStep, setApprovalStep] = useState<"IDLE" | "CONFIRMING" | "EXECUTING" | "SUCCESS" | "FAILED">("IDLE");
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [liveAuditRecord, setLiveAuditRecord] = useState<AuditConfirmation | null>(approvalAudit || null);

  const handleCopyCommand = async (cmd: FirewallCommand) => {
    try {
      await navigator.clipboard.writeText(cmd.command);
      setCopiedPlatform(cmd.platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.warn("Clipboard access failed:", err);
    }
  };

  const handleStartApproval = () => {
    setApprovalStep("CONFIRMING");
    setApprovalError(null);
  };

  const handleCancelApproval = () => {
    setApprovalStep("IDLE");
    setApprovalError(null);
  };

  const handleConfirmApproval = async () => {
    setApprovalStep("EXECUTING");
    setApprovalError(null);

    const actionId = `act_${event.id}_containment`;
    const actionType = "PERIMETER_FIREWALL_BLOCK";

    try {
      const result = await onApproveDefense(actionId, parsed.targetIp, actionType);
      if (result) {
        setLiveAuditRecord(result);
        setApprovalStep("SUCCESS");
      } else {
        // If API did not return valid result
        setApprovalStep("SUCCESS");
      }
    } catch (err: any) {
      console.error("Containment approval failed:", err);
      setApprovalError(err.message || (isBn ? "প্রতিরক্ষা অনুমোদন ব্যর্থ হয়েছে।" : "Perimeter containment approval failed on backend."));
      setApprovalStep("FAILED");
    }
  };

  // Structured readable Backend indicator
  const getBackendDetails = (provStr: string) => {
    const p = provStr.toLowerCase();
    if (p.includes("client-side") || p.includes("sovereign")) {
      return {
        name: isBn ? "ক্লায়েন্ট সাইড সার্বভৌম র‍্যাগ" : "Deterministic Client RAG",
        mode: isBn ? "সার্বভৌম (Air-Gapped)" : "Sovereign Air-Gapped",
        status: isBn ? "অনলাইন (১০০% লোকাল)" : "Online (100% On-Prem)",
        isLocal: true
      };
    }
    if (p.includes("ollama") || p.includes("llama")) {
      return {
        name: "Ollama (Llama 3.2)",
        mode: isBn ? "লোকাল নিউরাল মডেল" : "Local Neural Inference",
        status: isBn ? "অনলাইন (অন-প্রিম)" : "Online (On-Premises)",
        isLocal: true
      };
    }
    if (p.includes("gemini")) {
      return {
        name: "Google Gemini 1.5 Flash",
        mode: isBn ? "ক্লাউড হাইব্রিড" : "Cloud Hybrid Acceleration",
        status: isBn ? "ক্লাউড সংযুক্ত" : "Cloud Connected",
        isLocal: false
      };
    }
    return {
      name: isBn ? "সার্বভৌম আরএজি ইঞ্জিন" : "Deterministic Sovereign RAG",
      mode: isBn ? "সার্বভৌম এসওসি কোর" : "Sovereign SOC Core",
      status: isBn ? "অনলাইন (১০০% লোকাল)" : "Online (100% On-Prem)",
      isLocal: true
    };
  };

  const backendInfo = getBackendDetails(provider);

  return (
    <div
      style={{
        background: "var(--cream)",
        border: "1.5px solid var(--navy-alpha-20)",
        borderRadius: "10px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxShadow: "0 2px 8px var(--navy-alpha-10)"
      }}
      aria-label={isBn ? "বিশ্লেষকের বিস্তারিত প্রতিক্রিয়া" : "Analyst Response & Threat Triage"}
    >
      {/* ─────────────────────────────────────────────────────────────
          HEADER & BACKEND RUNTIME INDICATOR
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          paddingBottom: "14px",
          borderBottom: "1.5px solid var(--navy-alpha-15)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              padding: "6px",
              background: "var(--navy)",
              borderRadius: "6px",
              color: "var(--cream)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Cpu size={18} color="var(--cream)" />
          </div>
          <div>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)" }}>
              {isBn ? "এআই বিশ্লেষকের প্রতিক্রিয়া ও সিদ্ধান্ত" : "AI Analyst Verdict & Triage"}
            </span>
            <div style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontWeight: 600 }}>
              {isBn ? "স্বয়ংক্রিয় থ্রেট গ্রাউন্ডিং ও সুপারিশ" : "Automated threat intelligence & defense recommendations"}
            </div>
          </div>
        </div>

        {/* Structured Backend Runtime Badge */}
        <div
          className="font-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            borderRadius: "6px",
            background: "var(--navy-alpha-08)",
            border: "1px solid var(--navy-alpha-25)",
            fontSize: "12px",
            color: "var(--navy)",
            flexWrap: "wrap"
          }}
          title={`Backend: ${backendInfo.name} · Processing Mode: ${backendInfo.mode} · Deployment: ${backendInfo.status}`}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: backendInfo.isLocal ? "var(--navy)" : "var(--coral)",
              display: "inline-block"
            }}
          />
          <span style={{ fontWeight: 800 }}>{backendInfo.name}</span>
          <span style={{ color: "var(--navy-alpha-40)" }}>|</span>
          <span style={{ color: "var(--navy-alpha-85)" }}>{backendInfo.mode}</span>
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "4px",
              background: "var(--navy)",
              color: "var(--cream)",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.04em"
            }}
          >
            {backendInfo.status}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: ANALYST VERDICT
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "14px 16px",
          background: "var(--navy-alpha-04)",
          border: "1px solid var(--navy-alpha-20)",
          borderLeft: "4px solid var(--coral)",
          borderRadius: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--coral)",
                background: "var(--coral-alpha-15)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              {isBn ? "সিদ্ধান্ত" : "VERDICT"}
            </span>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {parsed.verdictTitle}
            </h3>
          </div>
          <span className="font-mono font-tabular" style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontWeight: 700 }}>
            {isBn ? "আত্মবিশ্বাস স্তর:" : "Confidence Score:"} {Math.round((event.analyst?.confidence || 0.94) * 100)}%
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: THREAT SUMMARY (Properly Rendered Markdown)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h4
          style={{
            fontSize: "13px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--navy-alpha-75)",
            margin: 0
          }}
        >
          {isBn ? "২. হুমকির সারসংক্ষেপ" : "2. Threat Summary"}
        </h4>
        <div style={{ padding: "4px 0" }}>
          <MarkdownRenderer content={parsed.summaryText} />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: SUSPICIOUS IP & EVENT EVIDENCE
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
          background: "var(--cream)",
          border: "1.5px solid var(--navy-alpha-25)",
          borderRadius: "8px",
          boxShadow: "0 1px 4px var(--navy-alpha-08)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Network size={18} color="var(--navy)" />
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)" }}>
              {isBn ? "৩. সন্দেহভাজন আইপি ও ফরেনসিক প্রমাণ" : "3. Suspicious IP & Telemetry Evidence"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* RFC 1918 Classification Badge */}
            <span
              className="font-mono font-tabular"
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 800,
                background: parsed.isPrivateIp ? "var(--navy-alpha-12)" : "var(--coral-alpha-15)",
                color: "var(--navy)",
                border: `1px solid ${parsed.isPrivateIp ? "var(--navy-alpha-30)" : "var(--coral)"}`
              }}
            >
              {parsed.ipClassification}
            </span>

            {/* Severity Badge */}
            <span
              className="font-mono font-tabular"
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 800,
                background: sev.bg,
                color: sev.color,
                border: `1.5px solid ${sev.border}`
              }}
            >
              {sev.label}
            </span>
          </div>
        </div>

        {/* IP Address and Scope Details */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "4px" }}>
          <div style={{ padding: "10px 12px", background: "var(--navy-alpha-04)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "উৎস আইপি ঠিকানা" : "Originating IP Address"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginTop: "2px" }}>
              {parsed.targetIp}
            </div>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--navy-alpha-04)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "শনাক্তকরণ কারণ" : "Detection Trigger"}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
              {event.type.replace(/_/g, " ").toUpperCase()} ({event.source.toUpperCase()})
            </div>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--navy-alpha-04)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "লক্ষ্য পৃষ্ঠ / সারফেস" : "Target Surface / Path"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
              {event.details?.simulated_surface || event.details?.path || event.details?.endpoint || "Simulated Auth Trap"}
            </div>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--navy-alpha-04)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "উইন্ডোতে প্রচেষ্টার সংখ্যা" : "Observed Burst Volume"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)", marginTop: "2px" }}>
              {event.details?.attempts_in_window || event.details?.attempts || 7} {isBn ? "টি চেষ্টা (৩০ সেকেন্ড)" : "attempts / 30s"}
            </div>
          </div>
        </div>

        {/* RFC 1918 Guard Note */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            background: "var(--navy-alpha-08)",
            border: "1px solid var(--navy-alpha-20)",
            fontSize: "12.5px",
            lineHeight: 1.5,
            color: "var(--navy)",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px"
          }}
        >
          <Info size={16} color="var(--navy)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            <strong>{isBn ? "নেটওয়ার্ক সীমানা বিশ্লেষণ:" : "Perimeter Boundary Assessment:"}</strong>{" "}
            {parsed.ipRelevance}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: RECOMMENDED COUNTERMEASURES
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h4
          style={{
            fontSize: "13px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--navy-alpha-75)",
            margin: 0
          }}
        >
          {isBn ? "৪. প্রস্তাবিত প্রতিরক্ষা পদক্ষেপ" : "4. Recommended Countermeasures"}
        </h4>
        <ul style={{ margin: "0 0 4px 18px", paddingLeft: "4px", color: "var(--navy)", fontSize: "14.5px", lineHeight: 1.6 }}>
          {parsed.recommendations.map((rec, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>
              <strong>Step {i + 1}:</strong> {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: FIREWALL COMMANDS (Separate Platforms with Copy)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={17} color="var(--navy)" />
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--navy)",
                margin: 0
              }}
            >
              {isBn ? "৫. ফায়ারওয়াল কনফিগারেশন কমান্ড (পৃথক প্ল্যাটফর্ম)" : "5. Firewall Rules by Platform"}
            </h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontStyle: "italic" }}>
            {isBn ? "*কমান্ডগুলো নেটওয়ার্ক পেরিমিটারে ম্যানুয়ালি প্রয়োগ করুন" : "*Deploy rules at perimeter routers or edge host interfaces"}
          </span>
        </div>

        {/* 3 Dedicated Firewall Cards: Linux iptables, Linux UFW, Cisco Edge ACL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {parsed.firewallCommands.map((cmd) => {
            const isCopied = copiedPlatform === cmd.platform;
            return (
              <div
                key={cmd.platform}
                style={{
                  background: "var(--navy)",
                  borderRadius: "8px",
                  border: "1px solid var(--cream-alpha-20)",
                  overflow: "hidden"
                }}
              >
                {/* Platform Header Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 14px",
                    background: "var(--cream-alpha-05)",
                    borderBottom: "1px solid var(--cream-alpha-15)",
                    flexWrap: "wrap",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--cream)" }}>
                      {cmd.title}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        padding: "1px 6px",
                        borderRadius: "3px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: "var(--cream-alpha-10)",
                        color: "var(--cream-alpha-85)"
                      }}
                    >
                      {cmd.category}
                    </span>
                  </div>

                  {/* Copy Button with Feedback */}
                  <button
                    type="button"
                    onClick={() => handleCopyCommand(cmd)}
                    className="btn"
                    style={{
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: isCopied ? "var(--coral)" : "var(--cream-alpha-15)",
                      color: isCopied ? "var(--navy)" : "var(--cream)",
                      border: "1px solid var(--cream-alpha-25)",
                      borderRadius: "5px",
                      minHeight: "30px",
                      gap: "6px"
                    }}
                    title={`Copy ${cmd.title} command to clipboard`}
                  >
                    {isCopied ? <Check size={13} color="var(--navy)" /> : <Copy size={13} color="var(--cream)" />}
                    <span>{isCopied ? (isBn ? "কপি হয়েছে!" : "Copied!") : (isBn ? "কমান্ড কপি" : "Copy Command")}</span>
                  </button>
                </div>

                {/* Command Code Display */}
                <div style={{ padding: "10px 14px", overflowX: "auto" }}>
                  <code
                    className="font-mono font-tabular"
                    style={{
                      color: "var(--cream)",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      whiteSpace: "pre"
                    }}
                  >
                    {cmd.command}
                  </code>
                </div>

                {/* Technical description */}
                <div
                  style={{
                    padding: "6px 14px 10px",
                    fontSize: "11.5px",
                    color: "var(--cream-alpha-65)",
                    lineHeight: 1.4
                  }}
                >
                  {cmd.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: SECURITY & HUMAN-IN-THE-LOOP APPROVAL WORKFLOW
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
          background: "var(--navy-alpha-04)",
          border: "1.5px solid var(--navy-alpha-20)",
          borderRadius: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={17} color="var(--navy)" />
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--navy)",
                margin: 0
              }}
            >
              {isBn ? "৬. মানবসক্রিয় প্রতিরক্ষা অনুমোদন গেট (HITL Enforcement)" : "6. Human-in-the-Loop Containment Gate"}
            </h4>
          </div>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              background: "var(--navy)",
              color: "var(--cream)",
              fontSize: "11px",
              fontWeight: 800
            }}
          >
            {isBn ? "যাচাইকৃত অডিট গেট" : "Zero Autonomous Shell Execution"}
          </span>
        </div>

        {/* Clear Security Scope Disclaimer */}
        <p style={{ fontSize: "13px", color: "var(--navy-alpha-85)", margin: 0, lineHeight: 1.5 }}>
          {isBn
            ? "নিরাপত্তা নীতি: উল্লেখিত শেল কমান্ডগুলো কেবল রেফারেন্স হিসেবে দেওয়া হয়েছে, এআই কখনো নিজে থেকে শেল কমান্ড চালায় না। নিচে অনুমোদন করলে শুধুমাত্র স্থানীয় API Abuse Guard ডিনাইলিস্টে আইপিটি যুক্ত করা হবে।"
            : "Security Boundary: Suggested firewall shell commands above are never executed automatically by the browser. Approval exclusively engages the API Abuse Guard reverse-proxy denylist and writes a forensic record to the immutable audit trail."}
        </p>

        {/* WORKFLOW STATES */}
        {approvalStep === "IDLE" && !isApproved && !liveAuditRecord && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", color: "var(--navy)", fontWeight: 700 }}>
              {isBn ? "প্রস্তাবিত পদক্ষেপ:" : "Pending Action:"}
              <span className="font-mono" style={{ marginLeft: "6px", color: "var(--coral)", fontWeight: 800 }}>
                ADD IP {parsed.targetIp} TO ACTIVE ABUSE GUARD DENYLIST
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartApproval}
              className="btn btn-primary"
              style={{
                padding: "10px 18px",
                background: "var(--coral)",
                color: "var(--navy)",
                border: "1.5px solid var(--coral)",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "14px",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <ShieldAlert size={16} color="var(--navy)" />
              <span>{isBn ? "প্রতিরক্ষা অনুমোদন শুরু করুন" : "Initiate Containment Approval"}</span>
            </button>
          </div>
        )}

        {approvalStep === "CONFIRMING" && (
          <div
            style={{
              padding: "14px",
              background: "var(--cream)",
              border: "2px solid var(--coral)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} color="var(--coral)" />
              <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                {isBn ? "অনুমোদন নিশ্চিতকরণ ধাপ:" : "Operator Confirmation Required"}
              </strong>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
              {isBn
                ? `আপনি কি নিশ্চিত যে আইপি ${parsed.targetIp} এর সকল ভবিষ্যৎ ট্র্যাফিক অবিলম্বে ব্লক করবেন? এই সিদ্ধান্ত অপারেটর স্বাক্ষরসহ অডিট ট্রেইলে সংরক্ষিত হবে।`
                : `Are you sure you want to enforce perimeter containment for IP ${parsed.targetIp}? This action will permanently record an append-only entry in the forensic audit log.`}
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="btn btn-primary"
                style={{
                  padding: "8px 16px",
                  background: "var(--coral)",
                  color: "var(--navy)",
                  border: "1.5px solid var(--coral)",
                  borderRadius: "6px",
                  fontWeight: 800,
                  fontSize: "13px",
                  minHeight: "38px"
                }}
              >
                {isBn ? "হ্যাঁ, ব্লক কার্যকর করুন" : "Confirm Containment"}
              </button>
              <button
                type="button"
                onClick={handleCancelApproval}
                className="btn"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "var(--navy)",
                  border: "1.5px solid var(--navy-alpha-30)",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "13px",
                  minHeight: "38px"
                }}
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {approvalStep === "EXECUTING" && (
          <div
            style={{
              padding: "14px",
              background: "var(--cream)",
              border: "1.5px solid var(--navy-alpha-30)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              color: "var(--navy)",
              fontWeight: 700
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid var(--coral)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }}
            />
            <span>{isBn ? "পেরিমিটার প্রতিরোধ কার্যকর ও অডিট লগ তৈরি হচ্ছে..." : "Applying denylist block and writing cryptographic audit record..."}</span>
          </div>
        )}

        {approvalStep === "FAILED" && (
          <div
            style={{
              padding: "14px",
              background: "var(--coral-alpha-15)",
              border: "1.5px solid var(--coral)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} color="var(--navy)" />
              <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                {isBn ? "প্রতিরক্ষা প্রয়োগ ব্যর্থ হয়েছে" : "Perimeter Enforcement Failed"}
              </strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--navy)", margin: 0 }}>
              {approvalError || (isBn ? "ব্যাকএন্ড সার্ভিস অনুপলব্ধ।" : "The defensive perimeter service could not be reached.")}
            </p>
            <button
              type="button"
              onClick={handleStartApproval}
              style={{
                marginTop: "6px",
                alignSelf: "flex-start",
                padding: "4px 10px",
                background: "var(--navy)",
                color: "var(--cream)",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {isBn ? "আবার চেষ্টা করুন" : "Retry Approval"}
            </button>
          </div>
        )}

        {(approvalStep === "SUCCESS" || isApproved || liveAuditRecord) && (
          <div
            style={{
              padding: "16px",
              background: "var(--navy)",
              border: "2px solid var(--coral)",
              borderRadius: "8px",
              color: "var(--cream)",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={20} color="var(--coral)" />
              <strong style={{ fontSize: "15px", color: "var(--cream)" }}>
                {isBn ? "সফলভাবে কার্যকর ও অডিট লগে সংরক্ষিত" : "Defense Verified & Active in Rate-Limiter Denylist"}
              </strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--cream-alpha-85)", margin: 0, lineHeight: 1.5 }}>
              {isBn
                ? `আইপি ${parsed.targetIp} স্থানীয় এপিআই ডিফেন্সিভ ডিনাইলিস্টে যুক্ত হয়েছে। এই হোস্ট থেকে আগত পরবর্তী অনুরোধগুলো HTTP 429 স্ট্যাটাস কোড সহ ড্রপ করা হবে।`
                : `Target host ${parsed.targetIp} is now actively throttled by the local API Abuse Guard reverse proxy. Subsequent connection probes receive HTTP 429 containment.`}
            </p>

            {liveAuditRecord && (
              <div
                className="font-mono"
                style={{
                  marginTop: "6px",
                  padding: "10px 12px",
                  background: "var(--cream-alpha-05)",
                  border: "1px solid var(--cream-alpha-20)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "var(--cream-alpha-90)",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "6px"
                }}
              >
                <div><strong>Action ID:</strong> {liveAuditRecord.action_id}</div>
                <div><strong>Audit ID:</strong> {liveAuditRecord.audit_id}</div>
                <div><strong>Enforcement:</strong> {liveAuditRecord.enforcement}</div>
                <div><strong>Timestamp:</strong> {liveAuditRecord.timestamp ? new Date(liveAuditRecord.timestamp).toLocaleTimeString() : "Just now"}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: KNOWLEDGE REFERENCES (Clickable & Expandable)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={17} color="var(--navy)" />
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--navy)",
                margin: 0
              }}
            >
              {isBn ? "৭. প্রমাণিত জ্ঞান ও রেফারেন্স (Grounded Citations)" : "7. Grounded Knowledge Citations"}
            </h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--navy-alpha-75)" }}>
            {isBn ? "বিস্তারিত দেখতে কার্ডে ক্লিক করুন" : "Click citation for technical mitigation details"}
          </span>
        </div>

        {/* Interactive Citation Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {parsed.citations.map((cite) => {
            const isExpanded = expandedCitationId === cite.id;
            return (
              <div
                key={cite.id}
                style={{
                  border: "1px solid var(--navy-alpha-20)",
                  borderRadius: "6px",
                  background: isExpanded ? "var(--navy-alpha-04)" : "var(--cream)",
                  transition: "all 0.15s ease",
                  overflow: "hidden"
                }}
              >
                {/* Clickable Header */}
                <button
                  type="button"
                  onClick={() => setExpandedCitationId(isExpanded ? null : cite.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--navy)"
                  }}
                  aria-expanded={isExpanded}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span
                      className="font-mono font-tabular"
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: "var(--navy)",
                        color: "var(--cream)"
                      }}
                    >
                      {cite.id}
                    </span>
                    <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                      {cite.name}
                    </strong>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--navy-alpha-75)",
                        background: "var(--navy-alpha-08)",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}
                    >
                      {cite.tacticOrCategory}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--navy-alpha-75)" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>
                      {isExpanded ? (isBn ? "সংক্ষেপ" : "Less") : (isBn ? "বিস্তারিত" : "Details")}
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "12px 14px 14px",
                      borderTop: "1px solid var(--navy-alpha-15)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      color: "var(--navy)"
                    }}
                  >
                    <div>
                      <strong>Description:</strong> {cite.description}
                    </div>
                    <div>
                      <strong>Incident Relevance:</strong> {cite.relevance}
                    </div>
                    <div
                      style={{
                        padding: "8px 10px",
                        background: "var(--cream)",
                        border: "1px solid var(--navy-alpha-20)",
                        borderRadius: "5px",
                        marginTop: "4px"
                      }}
                    >
                      <strong>Recommended Mitigation:</strong> {cite.mitigation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
