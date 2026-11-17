import React, { useState } from "react";
import type { SecurityEvent } from "../types";
import { getFriendlyEventTitle, getSeverityConfig } from "../utils/alertUtils";
import { generateClientSideAnalystAnswer } from "../utils/analystFallback";
import {
  parseAnalystResponse,
  type FirewallCommand
} from "../utils/analystParser";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { AnalystResponseView, type AuditConfirmation } from "./AnalystResponseView";
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  MessageSquare,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  User,
  Terminal,
  Copy,
  Check,
  Lock,
  AlertTriangle,
  Layers,
  Network,
  Info
} from "lucide-react";

export type { AuditConfirmation };

interface SelectedAlertPanelProps {
  event: SecurityEvent | null;
  globalLanguage: "en" | "bn";
  apiBase: string;
  onApproveDefense: (actionId: string, target: string, actionType: string) => Promise<AuditConfirmation | void>;
  onRetriage: (eventId: string) => Promise<void>;
  approvedMap: Record<string, AuditConfirmation>;
}

export const SelectedAlertPanel: React.FC<SelectedAlertPanelProps> = ({
  event,
  globalLanguage,
  apiBase,
  onApproveDefense,
  onRetriage,
  approvedMap
}) => {
  const isBn = globalLanguage === "bn";
  const [isRetriaging, setIsRetriaging] = useState<boolean>(false);
  const [narrativeLang, setNarrativeLang] = useState<"en" | "bn">(globalLanguage);

  // Firewall copy state
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Citation expansion state
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  // Human-in-the-Loop Approval state machine: IDLE -> CONFIRMING -> EXECUTING -> SUCCESS / FAILED
  const [approvalStep, setApprovalStep] = useState<"IDLE" | "CONFIRMING" | "EXECUTING" | "SUCCESS" | "FAILED">("IDLE");
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [localAuditRecord, setLocalAuditRecord] = useState<AuditConfirmation | null>(null);

  // Ask Analyst inline conversation state
  const [isAskOpen, setIsAskOpen] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [askAnswer, setAskAnswer] = useState<string>("");
  const [askProvider, setAskProvider] = useState<string>("");
  const [askCitations, setAskCitations] = useState<string[]>([]);
  const [askError, setAskError] = useState<string>("");

  if (!event) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "52px 24px",
          textAlign: "center",
          background: "var(--cream)",
          border: "1px solid var(--navy-alpha-20)",
          borderRadius: "12px",
          color: "var(--navy)",
          gap: "16px",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <ShieldAlert size={56} color="var(--navy)" />
        <h3 style={{ fontSize: "21px", fontWeight: 800, color: "var(--navy)" }}>
          {isBn ? "কোনো সতর্কতা নির্বাচিত নয়" : "No Alert Selected"}
        </h3>
        <p style={{ fontSize: "16px", maxWidth: "420px", color: "var(--navy-alpha-75)", margin: 0, lineHeight: 1.5 }}>
          {isBn
            ? "বামপাশের তালিকা থেকে যেকোনো সতর্কতায় ক্লিক করে কৃত্রিম বুদ্ধিমত্তার (AI) সম্পূর্ণ অডিট ডসিয়ার, ফরেনসিক প্রমাণ ও প্রতিরক্ষা সুপারিশ দেখুন।"
            : "Select any security alert on the left to inspect the complete autonomous AI incident dossier, forensic telemetry, firewall rules, and human-in-the-loop action gate."}
        </p>
      </div>
    );
  }

  const sev = getSeverityConfig(event.severity, globalLanguage);
  const SevIcon = sev.icon;
  const friendlyTitle = getFriendlyEventTitle(event.type, globalLanguage);
  const sourceIp =
    event.details?.source_ip ||
    event.details?.attacker_ip ||
    event.details?.client_ip ||
    "192.168.1.189";

  const targetResource = sourceIp;
  const actionKey = `${event.id}_${targetResource}`;
  const persistentApproval = approvedMap[actionKey];
  const activeAudit = persistentApproval || localAuditRecord;
  const isApproved = !!activeAudit;

  // Derive narrative text according to selected language toggle
  const rawNarrative =
    narrativeLang === "bn"
      ? event.analyst?.narrative_bn || event.analyst?.narrative_en || ""
      : event.analyst?.narrative_en || event.analyst?.narrative_bn || "";

  // Parse structured threat intelligence from narrative and telemetry
  const parsed = parseAnalystResponse(
    rawNarrative,
    sourceIp,
    event.analyst?.citations || [],
    narrativeLang === "bn"
  );

  const confidenceScore = Math.round((event.analyst?.confidence || 0.94) * 100);

  // Retriage event
  const handleRetriageClick = async () => {
    setIsRetriaging(true);
    try {
      await onRetriage(event.id);
    } finally {
      setIsRetriaging(false);
    }
  };

  // Copy platform firewall rule to clipboard
  const handleCopyCommand = async (cmd: FirewallCommand) => {
    try {
      await navigator.clipboard.writeText(cmd.command);
      setCopiedPlatform(cmd.platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.warn("Clipboard access failed:", err);
    }
  };

  // Progressive Approval Flow
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
      const result = await onApproveDefense(actionId, targetResource, actionType);
      if (result) {
        setLocalAuditRecord(result);
      }
      setApprovalStep("SUCCESS");
    } catch (err: any) {
      console.error("Containment approval failed:", err);
      setApprovalError(err.message || (isBn ? "প্রতিরক্ষা অনুমোদন ব্যর্থ হয়েছে।" : "Perimeter containment approval failed on backend."));
      setApprovalStep("FAILED");
    }
  };

  // Submit query to "Ask the Analyst" (with sovereign fallback)
  const handleExecuteAsk = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isStreaming) return;

    setQuery(text);
    setIsStreaming(true);
    setAskAnswer("");
    setAskError("");
    setAskProvider("");
    setAskCitations([]);

    try {
      const response = await fetch(`${apiBase}/analyst/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          event_context: {
            id: event.id,
            source: event.source,
            severity: event.severity,
            type: event.type,
            details: event.details,
            analyst: event.analyst
          },
          language: globalLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Analyst API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAskAnswer(data.answer);
      setAskProvider(data.provider || "deterministic-offline-rag");
      setAskCitations(data.citations || []);
    } catch (err: any) {
      // Sovereign client fallback when offline or static deployment
      try {
        const fallback = generateClientSideAnalystAnswer(text, event, globalLanguage);
        setAskAnswer(fallback.answer);
        setAskProvider("client-side-offline-rag (sovereign)");
        setAskCitations(fallback.citations);
      } catch {
        setAskError(err.message || (isBn ? "এআই বিশ্লেষকের সাথে সংযোগ ব্যর্থ হয়েছে।" : "Failed to reach AI Analyst backend."));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteAsk(query);
  };

  const formattedTime = event.ts ? new Date(event.ts).toLocaleTimeString() : "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--cream)",
        border: "1px solid var(--navy-alpha-20)",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "var(--shadow-md)",
        height: "100%",
        overflowY: "auto",
        gap: "24px"
      }}
      role="region"
      aria-label={isBn ? "নির্বাচিত সতর্কতার অডিট ডসিয়ার" : "Selected Alert Threat Dossier"}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. UNIFIED DOSSIER HEADER
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingBottom: "18px",
          borderBottom: "1.5px solid var(--navy-alpha-15)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          {/* Metadata Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Severity Badge with Accessible Shape */}
            <span
              className="font-mono font-tabular"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 800,
                background: sev.bg,
                color: sev.color,
                border: `1.5px solid ${sev.border}`
              }}
            >
              <SevIcon size={14} color={sev.color} />
              <span aria-hidden="true">{sev.shape}</span>
              <span>{sev.label}</span>
            </span>

            {/* IP Address & Scope Tag */}
            <span
              className="font-mono font-tabular"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 800,
                background: "var(--navy)",
                color: "var(--cream)"
              }}
            >
              IP: {sourceIp}
            </span>

            {/* RFC 1918 Classification */}
            <span
              className="font-mono font-tabular"
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                background: parsed.isPrivateIp ? "var(--navy-alpha-10)" : "var(--coral-alpha-15)",
                color: "var(--navy)",
                border: `1px solid ${parsed.isPrivateIp ? "var(--navy-alpha-25)" : "var(--coral)"}`
              }}
            >
              {parsed.ipClassification}
            </span>

            {/* Sensor Tag */}
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: "6px",
                background: "var(--navy-alpha-08)",
                color: "var(--navy)",
                border: "1px solid var(--navy-alpha-20)",
                textTransform: "capitalize"
              }}
            >
              {isBn ? "উৎস:" : "Sensor:"} {event.source}
            </span>

            {formattedTime && (
              <span className="font-mono font-tabular" style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontWeight: 700, marginLeft: "4px" }}>
                {formattedTime}
              </span>
            )}
          </div>

          {/* Re-triage Action Button */}
          <button
            onClick={handleRetriageClick}
            disabled={isRetriaging}
            className="btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              background: "var(--cream)",
              color: "var(--navy)",
              border: "1px solid var(--navy-alpha-30)",
              borderRadius: "6px",
              minHeight: "36px"
            }}
            title="Re-run RAG intelligence over this incident"
            aria-label={isBn ? "পুনরায় বিশ্লেষণ করুন" : "Re-triage incident"}
          >
            <RotateCw size={14} color="var(--navy)" style={{ animation: isRetriaging ? "spin 0.8s linear infinite" : "none" }} />
            <span>{isRetriaging ? (isBn ? "বিশ্লেষণ হচ্ছে..." : "Analyzing...") : (isBn ? "পুনরায় বিশ্লেষণ" : "Re-Triage")}</span>
          </button>
        </div>

        {/* Incident Headline */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--navy)", margin: 0, lineHeight: 1.3 }}>
          {friendlyTitle}
        </h2>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. GROUNDED TRIAGE VERDICT & NARRATIVE
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "এআই বিশ্লেষকের সিদ্ধান্ত ও সারসংক্ষেপ" : "Analyst Triage Verdict"}
            </h3>
            <span
              className="font-mono font-tabular"
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "4px",
                background: "var(--navy-alpha-10)",
                color: "var(--navy)"
              }}
            >
              {confidenceScore}% {isBn ? "আত্মবিশ্বাস" : "CONFIDENCE"}
            </span>
          </div>

          {/* Bilingual Narrative Toggle */}
          <div className="segmented-control">
            <button
              onClick={() => setNarrativeLang("en")}
              className={`segmented-btn ${narrativeLang === "en" ? "active" : ""}`}
              aria-label="View narrative in English"
            >
              English
            </button>
            <button
              onClick={() => setNarrativeLang("bn")}
              className={`segmented-btn ${narrativeLang === "bn" ? "active" : ""}`}
              aria-label="বাংলা ভাষায় বিবরণ দেখুন"
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Markdown-Rendered Narrative */}
        <div style={{ maxWidth: "75ch", fontSize: "15px", lineHeight: 1.65, color: "var(--navy)" }}>
          <MarkdownRenderer content={parsed.summaryText} />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FORENSIC EVIDENCE & BOUNDARY ASSESSMENT GRID
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
          background: "var(--navy-alpha-04)",
          border: "1px solid var(--navy-alpha-15)",
          borderRadius: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Network size={17} color="var(--navy)" />
          <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
            {isBn ? "ফরেনসিক প্রমাণ ও নেটওয়ার্ক পরিধি" : "Forensic Evidence & Scope"}
          </h4>
        </div>

        {/* 4-Column Tactical Telemetry Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px"
          }}
        >
          <div style={{ padding: "8px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "উৎস আইপি ঠিকানা" : "Originating IP"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)", marginTop: "2px" }}>
              {sourceIp}
            </div>
          </div>

          <div style={{ padding: "8px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "শনাক্তকরণ কারণ" : "Detection Trigger"}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
              {event.type.replace(/_/g, " ").toUpperCase()} ({event.source.toUpperCase()})
            </div>
          </div>

          <div style={{ padding: "8px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "লক্ষ্য পৃষ্ঠ / সারফেস" : "Target Surface / Path"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
              {event.details?.simulated_surface || event.details?.path || event.details?.endpoint || "Simulated Auth Surface"}
            </div>
          </div>

          <div style={{ padding: "8px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "উইন্ডোতে প্রচেষ্টার সংখ্যা" : "Observed Volume"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "13px", fontWeight: 800, color: "var(--navy)", marginTop: "2px" }}>
              {event.details?.attempts_in_window || event.details?.attempts || event.details?.count || 1} {isBn ? "টি অনুরোধ" : "requests"}
            </div>
          </div>
        </div>

        {/* Boundary Assessment Note */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            background: "var(--cream)",
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
          4. FIREWALL RULES BY PLATFORM (Copyable Terminal Blocks)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={17} color="var(--navy)" />
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "পেরিমিটার ফায়ারওয়াল কমান্ড (প্ল্যাটফর্ম অনুযায়ী)" : "Perimeter Containment Rules"}
            </h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontStyle: "italic" }}>
            {isBn ? "*কমান্ডগুলো নেটওয়ার্ক রাউটার বা ফায়ারওয়ালে প্রয়োগ করুন" : "*Deploy rules at perimeter routers or edge host interfaces"}
          </span>
        </div>

        {/* 3 Dedicated Firewall Cards: Linux iptables, Linux UFW, Cisco Edge ACL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                      className="font-mono font-tabular"
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
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. HUMAN-IN-THE-LOOP CONTAINMENT ACTION GATE
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
          background: "var(--navy-alpha-04)",
          border: "1px solid var(--navy-alpha-20)",
          borderRadius: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={17} color="var(--navy)" />
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "মানবসক্রিয় প্রতিরক্ষা অনুমোদন গেট (HITL Gate)" : "Human-in-the-Loop Containment Gate"}
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
            {isBn ? "যাচাইকৃত অডিট গেট" : "Mandatory Operator Confirmation"}
          </span>
        </div>

        <p style={{ fontSize: "13px", color: "var(--navy-alpha-85)", margin: 0, lineHeight: 1.5 }}>
          {isBn
            ? "নিরাপত্তা নীতি: উল্লেখিত শেল কমান্ডগুলো কেবল রেফারেন্স হিসেবে দেওয়া হয়েছে, এআই কখনো নিজে থেকে শেল কমান্ড চালায় না। নিচে অনুমোদন করলে শুধুমাত্র স্থানীয় API Abuse Guard ডিনাইলিস্টে আইপিটি যুক্ত করা হবে।"
            : "Security Boundary: Suggested firewall shell commands above are never executed automatically by the browser. Approval exclusively engages the API Abuse Guard reverse-proxy denylist and writes a forensic record to the immutable audit trail."}
        </p>

        {/* WORKFLOW STATES */}
        {approvalStep === "IDLE" && !isApproved && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", color: "var(--navy)", fontWeight: 700 }}>
              {isBn ? "প্রস্তাবিত পদক্ষেপ:" : "Pending Action:"}
              <span className="font-mono" style={{ marginLeft: "6px", color: "var(--coral)", fontWeight: 800 }}>
                ADD IP {sourceIp} TO ACTIVE ABUSE GUARD DENYLIST
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartApproval}
              className="btn btn-primary"
              style={{
                padding: "12px 20px",
                background: "var(--coral)",
                color: "var(--navy)",
                border: "1.5px solid var(--coral)",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "15px",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <ShieldAlert size={18} color="var(--navy)" />
              <span>{isBn ? "প্রতিরক্ষা অনুমোদন করুন (Approve Defense)" : "Approve Defense Countermeasure"}</span>
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
                ? `আপনি কি নিশ্চিত যে আইপি ${sourceIp} এর সকল ভবিষ্যৎ ট্র্যাফিক অবিলম্বে ব্লক করবেন? এই সিদ্ধান্ত অপারেটর স্বাক্ষরসহ অডিট ট্রেইলে সংরক্ষিত হবে।`
                : `Are you sure you want to enforce perimeter containment for IP ${sourceIp}? This action will permanently record an append-only entry in the forensic audit log.`}
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
              className="btn btn-primary"
              style={{
                marginTop: "6px",
                alignSelf: "flex-start",
                padding: "6px 12px",
                background: "var(--coral)",
                color: "var(--navy)",
                border: "1px solid var(--coral)",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 700
              }}
            >
              {isBn ? "আবার চেষ্টা করুন" : "Retry Approval"}
            </button>
          </div>
        )}

        {(approvalStep === "SUCCESS" || isApproved) && (
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
                ? `আইপি ${sourceIp} স্থানীয় এপিআই ডিফেন্সিভ ডিনাইলিস্টে যুক্ত হয়েছে। এই হোস্ট থেকে আগত পরবর্তী অনুরোধগুলো HTTP 429 স্ট্যাটাস কোড সহ ড্রপ করা হবে।`
                : `Target host ${sourceIp} is actively throttled by the local API Abuse Guard reverse proxy. Subsequent connection probes receive HTTP 429 containment.`}
            </p>

            {activeAudit && (
              <div
                className="font-mono font-tabular"
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
                <div><strong>Action ID:</strong> {activeAudit.action_id}</div>
                <div><strong>Audit ID:</strong> {activeAudit.audit_id}</div>
                <div><strong>Enforcement:</strong> {activeAudit.enforcement}</div>
                <div><strong>Timestamp:</strong> {activeAudit.timestamp ? new Date(activeAudit.timestamp).toLocaleTimeString() : "Just now"}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. GROUNDED INTELLIGENCE CITATIONS (Clickable & Expandable)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={17} color="var(--navy)" />
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "প্রমাণিত জ্ঞান ও রেফারেন্স (Grounded Citations)" : "Grounded Knowledge Citations"}
            </h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--navy-alpha-75)" }}>
            {isBn ? "কার্ডে ক্লিক করে বিস্তারিত প্রশমন নীতি দেখুন" : "Click citation for technical mitigation details"}
          </span>
        </div>

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
                      [{cite.id}]
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
                    <div><strong>Description:</strong> {cite.description}</div>
                    <div><strong>Incident Relevance:</strong> {cite.relevance}</div>
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

      {/* ─────────────────────────────────────────────────────────────
          7. ASK THE AI ANALYST (Interactive Follow-Up Investigation)
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1.5px solid var(--navy-alpha-15)",
          paddingTop: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <button
          onClick={() => setIsAskOpen(!isAskOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            border: "none",
            color: "var(--navy)",
            fontSize: "16px",
            fontWeight: 800,
            cursor: "pointer",
            padding: "4px 0",
            minHeight: "44px"
          }}
          aria-expanded={isAskOpen}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare size={18} color="var(--navy)" />
            <span>{isBn ? "এই হুমকি সম্পর্কে এআই বিশ্লেষককে জিজ্ঞাসা করুন" : "Ask AI Analyst About This Threat"}</span>
          </div>
          {isAskOpen ? <ChevronUp size={18} color="var(--navy)" /> : <ChevronDown size={18} color="var(--navy)" />}
        </button>

        {isAskOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Quick Prompt Suggestion Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button
                type="button"
                disabled={isStreaming}
                onClick={() =>
                  handleExecuteAsk(
                    isBn
                      ? "এই আক্রমণের মূল কৌশল এবং ক্ষতি করার সম্ভাবনা ব্যাখ্যা করুন।"
                      : "Explain the primary attack vector and potential impact."
                  )
                }
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "var(--cream)",
                  color: "var(--navy)",
                  border: "1px solid var(--navy-alpha-30)",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Sparkles size={14} color="var(--navy)" />
                <span>{isBn ? "প্রাথমিক ভেক্টর?" : "Primary vector?"}</span>
              </button>

              <button
                type="button"
                disabled={isStreaming}
                onClick={() =>
                  handleExecuteAsk(
                    isBn
                      ? "এটি প্রতিরোধ করতে ফায়ারওয়ালে কী নিয়ম যোগ করতে হবে?"
                      : "What firewall rules should I add to prevent this?"
                  )
                }
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "var(--cream)",
                  color: "var(--navy)",
                  border: "1px solid var(--navy-alpha-30)",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Shield size={14} color="var(--navy)" />
                <span>{isBn ? "ফায়ারওয়াল কমান্ড" : "Firewall commands"}</span>
              </button>

              <button
                type="button"
                disabled={isStreaming}
                onClick={() =>
                  handleExecuteAsk(
                    isBn
                      ? "এটি কি অভ্যন্তরীণ নিরাপত্তা লঙ্ঘন নাকি বহিঃস্থ আক্রমণ?"
                      : "Is this an insider threat or external scan?"
                  )
                }
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "var(--cream)",
                  color: "var(--navy)",
                  border: "1px solid var(--navy-alpha-30)",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <User size={14} color="var(--navy)" />
                <span>{isBn ? "ইনসাইডার নাকি বহিঃস্থ?" : "Insider or external?"}</span>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskSubmit} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isBn
                    ? "বাংলায় বা ইংরেজিতে প্রশ্ন লিখুন (যেমন: ফায়ারওয়াল নিয়ম কী?)..."
                    : "Ask in English or Bangla (e.g. firewall commands, attacker IP)..."
                }
                disabled={isStreaming}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "var(--cream)",
                  border: "1px solid var(--navy-alpha-30)",
                  borderRadius: "8px",
                  color: "var(--navy)",
                  fontSize: "15px",
                  fontWeight: 600,
                  minHeight: "44px"
                }}
                aria-label={isBn ? "এআই বিশ্লেষকের জন্য প্রশ্ন" : "Question for AI Analyst"}
              />
              <button
                type="submit"
                disabled={isStreaming || !query.trim()}
                className="btn btn-primary"
                style={{
                  padding: "10px 18px",
                  background: "var(--coral)",
                  color: "var(--navy)",
                  border: "1.5px solid var(--coral)",
                  borderRadius: "8px",
                  fontWeight: 800,
                  minHeight: "44px"
                }}
                aria-label={isBn ? "প্রশ্ন পাঠান" : "Send question"}
              >
                <Send size={15} color="var(--navy)" />
                <span>{isStreaming ? (isBn ? "উত্তর আসছে..." : "Thinking...") : (isBn ? "পাঠান" : "Ask")}</span>
              </button>
            </form>

            {/* Answer Display */}
            {askError && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--coral-alpha-15)",
                  border: "1.5px solid var(--coral)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "var(--navy)"
                }}
                role="alert"
              >
                {askError}
              </div>
            )}

            {askAnswer && (
              <AnalystResponseView
                rawAnswer={askAnswer}
                provider={askProvider}
                citations={askCitations}
                event={event}
                globalLanguage={globalLanguage}
                apiBase={apiBase}
                onApproveDefense={onApproveDefense}
                isApproved={isApproved}
                approvalAudit={activeAudit}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
