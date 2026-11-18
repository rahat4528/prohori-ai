import React, { useState } from "react";
import type { SecurityEvent } from "../types";
import {
  getFriendlyEventTitle,
  getSeverityConfig,
  getBeginnerIncidentBreakdown,
  getIpFriendlyInfo,
  getMitreFriendlyInfo
} from "../utils/alertUtils";
import { generateClientSideAnalystAnswer } from "../utils/analystFallback";
import {
  parseAnalystResponse,
  type FirewallCommand
} from "../utils/analystParser";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { AnalystResponseView, type AuditConfirmation } from "./AnalystResponseView";
import { InfoTooltip } from "./InfoTooltip";
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
  Terminal,
  Copy,
  Check,
  Lock,
  AlertTriangle,
  Layers,
  Network,
  Info,
  Activity,
  Globe,
  ListChecks,
  Code2,
  HelpCircle
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

  // Advanced technical details toggle
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

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
        <p style={{ fontSize: "16px", maxWidth: "440px", color: "var(--navy-alpha-75)", margin: 0, lineHeight: 1.5 }}>
          {isBn
            ? "বামপাশের তালিকা থেকে যেকোনো সতর্কতায় ক্লিক করে সহজ বাংলায় এআই নিরাপত্তা বিশ্লেষণ, কী ঘটেছে তার ব্যাখ্যা, এবং আক্রমণকারীকে ব্লক করার উপায় দেখুন।"
            : "Select any security alert on the left to see an easy-to-understand AI security analysis, a breakdown of what happened, and commands to block the attacker."}
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

  // Beginner breakdown & IP info
  const breakdown = getBeginnerIncidentBreakdown(event, globalLanguage);
  const ipInfo = getIpFriendlyInfo(sourceIp, globalLanguage);

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
      aria-label={isBn ? "নির্বাচিত সতর্কতার বিস্তারিত এআই বিশ্লেষণ" : "Selected Alert Threat Analysis"}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. UNIFIED INCIDENT HEADER
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
            {/* Severity Badge */}
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

            {/* IP Address Tag */}
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
              <InfoTooltip
                term={ipInfo.isPrivate ? "Private IP (LAN)" : "Public IP (WAN)"}
                isBn={isBn}
                size={13}
              />
            </span>

            {/* Network Location Tag */}
            <span
              className="font-mono font-tabular"
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                background: ipInfo.isPrivate ? "var(--navy-alpha-10)" : "var(--coral-alpha-15)",
                color: "var(--navy)",
                border: `1px solid ${ipInfo.isPrivate ? "var(--navy-alpha-25)" : "var(--coral)"}`
              }}
              title={ipInfo.simpleMeaning}
            >
              {ipInfo.typeLabel}
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
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <span>{isBn ? "উৎস:" : "Sensor:"} {event.source === "honeypot" ? (isBn ? "হানিপট" : "Honeypot") : event.source === "ratelimiter" ? (isBn ? "রেট লিমিটার" : "Rate Limiter") : event.source}</span>
              <InfoTooltip
                term={event.source === "honeypot" ? "Honeypot" : event.source === "ratelimiter" ? "Rate Limiter" : undefined}
                isBn={isBn}
                size={12}
              />
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
            title="Re-run AI analysis over this incident"
            aria-label={isBn ? "পুনরায় বিশ্লেষণ করুন" : "Re-analyze incident"}
          >
            <RotateCw size={14} color="var(--navy)" style={{ animation: isRetriaging ? "spin 0.8s linear infinite" : "none" }} />
            <span>{isRetriaging ? (isBn ? "বিশ্লেষণ হচ্ছে..." : "Analyzing...") : (isBn ? "পুনরায় বিশ্লেষণ" : "Re-Analyze")}</span>
          </button>
        </div>

        {/* Clear Incident Headline */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--navy)", margin: 0, lineHeight: 1.3 }}>
          {friendlyTitle}
        </h2>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BEGINNER-FRIENDLY INCIDENT BREAKDOWN (What, Why, Who, What To Do)
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "18px",
          background: "var(--navy-alpha-04)",
          border: "1.5px solid var(--navy-alpha-15)",
          borderRadius: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HelpCircle size={18} color="var(--navy)" />
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "সংক্ষেপ: সহজ ভাষায় এই ঘটনাটি বুঝুন" : "Quick Guide: What You Need to Know"}
            </h3>
          </div>
          <span style={{ fontSize: "12px", color: "var(--navy-alpha-70)", fontStyle: "italic" }}>
            {isBn ? "অ-প্রকৌশলীদের জন্য সহজ ব্যাখ্যা" : "Non-technical beginner breakdown"}
          </span>
        </div>

        {/* 4 Cards: What Happened, Why It Matters, Who is the Attacker, What To Do */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "12px"
          }}
        >
          {/* Box 1: What Happened */}
          <div
            style={{
              padding: "14px",
              background: "var(--cream)",
              borderRadius: "8px",
              border: "1px solid var(--navy-alpha-15)",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--navy)", fontWeight: 800, fontSize: "13.5px" }}>
              <Activity size={16} color="var(--navy)" />
              <span>{isBn ? "১. কী ঘটেছে?" : "1. What Happened?"}</span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--navy-alpha-85)", lineHeight: 1.5 }}>
              {breakdown.whatHappened}
            </p>
          </div>

          {/* Box 2: Why It Matters */}
          <div
            style={{
              padding: "14px",
              background: "var(--cream)",
              borderRadius: "8px",
              border: "1px solid var(--navy-alpha-15)",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--coral)", fontWeight: 800, fontSize: "13.5px" }}>
              <AlertTriangle size={16} color="var(--coral)" />
              <span style={{ color: "var(--navy)" }}>{isBn ? "২. এটি কেন বিপজ্জনক?" : "2. Why It Matters"}</span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--navy-alpha-85)", lineHeight: 1.5 }}>
              {breakdown.whyItMatters}
            </p>
          </div>

          {/* Box 3: Who is the Attacker */}
          <div
            style={{
              padding: "14px",
              background: "var(--cream)",
              borderRadius: "8px",
              border: "1px solid var(--navy-alpha-15)",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--navy)", fontWeight: 800, fontSize: "13.5px" }}>
              <Globe size={16} color="var(--navy)" />
              <span>{isBn ? "৩. আক্রমণকারী কে?" : "3. Who is the Attacker?"}</span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--navy-alpha-85)", lineHeight: 1.5 }}>
              {breakdown.whoIsAttacker}
            </p>
          </div>

          {/* Box 4: What You Should Do */}
          <div
            style={{
              padding: "14px",
              background: "var(--cream)",
              borderRadius: "8px",
              border: "1px solid var(--navy-alpha-15)",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--navy)", fontWeight: 800, fontSize: "13.5px" }}>
              <ListChecks size={16} color="var(--navy)" />
              <span>{isBn ? "৪. আপনার কী করা উচিত?" : "4. What Should You Do?"}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "var(--navy-alpha-85)", lineHeight: 1.5 }}>
              {breakdown.whatToDo.map((step, idx) => (
                <li key={idx} style={{ marginBottom: "3px" }}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. AI SECURITY ANALYSIS (Formerly Analyst Triage Verdict)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
                {isBn ? "এআই নিরাপত্তা বিশ্লেষণ" : "AI Security Analysis"}
              </h3>
              <span
                className="font-mono font-tabular"
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "var(--navy-alpha-10)",
                  color: "var(--navy)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span>{confidenceScore}% {isBn ? "নিশ্চয়তা" : "CONFIDENCE"}</span>
                <InfoTooltip term="Confidence Score" isBn={isBn} size={11} />
              </span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--navy-alpha-70)" }}>
              {isBn
                ? "প্রহরী এআই রিয়েল-টাইমে নেটওয়ার্ক ট্র্যাফিক বিশ্লেষণ করে ঝুঁকির মাত্রা ও প্রতিরক্ষার সুপারিশ নির্ধারণ করেছে।"
                : "PROHORI AI analyzed the network traffic in real time and determined this incident's risk level and recommended actions."}
            </p>
          </div>

          {/* Bilingual Narrative Toggle */}
          <div className="segmented-control">
            <button
              onClick={() => setNarrativeLang("en")}
              className={`segmented-btn ${narrativeLang === "en" ? "active" : ""}`}
              aria-label="View analysis in English"
            >
              English
            </button>
            <button
              onClick={() => setNarrativeLang("bn")}
              className={`segmented-btn ${narrativeLang === "bn" ? "active" : ""}`}
              aria-label="বাংলা ভাষায় বিশ্লেষণ দেখুন"
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
          4. WHAT HAPPENED? (TECHNICAL EVIDENCE) (Formerly Forensic Evidence & Scope)
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Network size={17} color="var(--navy)" />
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "কী ঘটেছে? (প্রযুক্তিগত প্রমাণ)" : "What Happened? (Technical Evidence)"}
            </h4>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--navy-alpha-70)" }}>
            {isBn
              ? "ঘটনার সময় আমাদের ডিকয় হানিপট ও সেন্সর দ্বারা সরাসরি সংগৃহীত নেটওয়ার্ক তথ্য।"
              : "Real connection details captured by our honeypots and sensors when the incident took place."}
          </p>
        </div>

        {/* 4-Column Tactical Telemetry Grid with Clear Explanatory Subtitles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "10px"
          }}
        >
          {/* Col 1: Originating IP */}
          <div style={{ padding: "10px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "আক্রমণকারী আইপি ঠিকানা" : "Attacker IP Address"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)", marginTop: "2px" }}>
              {sourceIp}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--navy-alpha-60)", marginTop: "2px" }}>
              {isBn ? "যে ঠিকানা থেকে ট্র্যাফিক এসেছে" : "Device sending this traffic"}
            </div>
          </div>

          {/* Col 2: Detection Trigger */}
          <div style={{ padding: "10px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "শনাক্তকরণ কারণ" : "What Triggered Alert"}
            </div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
              {getFriendlyEventTitle(event.type, globalLanguage)}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--navy-alpha-60)", marginTop: "2px" }}>
              {isBn ? `সেন্সর: ${event.source}` : `Sensor: ${event.source}`}
            </div>
          </div>

          {/* Col 3: Target Surface / Path */}
          <div style={{ padding: "10px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "টার্গেট করা সিস্টেম / পথ" : "Targeted URL / System"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
              {event.details?.simulated_surface || event.details?.path || event.details?.endpoint || "/api/v1/auth/login"}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--navy-alpha-60)", marginTop: "2px" }}>
              {isBn ? "যে সার্ভিসটিতে আঘাত হানা হয়েছে" : "Application service targeted"}
            </div>
          </div>

          {/* Col 4: Observed Volume */}
          <div style={{ padding: "10px 12px", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-65)", fontWeight: 700, textTransform: "uppercase" }}>
              {isBn ? "অনুরোধের সংখ্যা" : "Number of Requests"}
            </div>
            <div className="font-mono font-tabular" style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)", marginTop: "2px" }}>
              {event.details?.attempts_in_window || event.details?.attempts || event.details?.count || 1} {isBn ? "টি প্রচেষ্টা" : "requests recorded"}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--navy-alpha-60)", marginTop: "2px" }}>
              {isBn ? "সময়সীমার মধ্যে প্রাপ্ত সংযোগ" : "Observed in monitor window"}
            </div>
          </div>
        </div>

        {/* Boundary Assessment Note in plain words */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            background: "var(--cream)",
            border: "1px solid var(--navy-alpha-20)",
            fontSize: "13px",
            lineHeight: 1.5,
            color: "var(--navy)",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px"
          }}
        >
          <Info size={17} color="var(--navy)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>{isBn ? "আইপি ঠিকানা ও নেটওয়ার্ক সীমানা বিশ্লেষণ:" : "Network Location Assessment:"}</strong>{" "}
            {ipInfo.dangerContext}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. HOW TO BLOCK THE ATTACKER (Formerly Perimeter Containment Rules)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={17} color="var(--navy)" />
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
                {isBn ? "আক্রমণকারীকে যেভাবে ব্লক করবেন (ফায়ারওয়াল কমান্ড)" : "How to Block the Attacker (Firewall Commands)"}
              </h4>
            </div>
            <span style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontStyle: "italic" }}>
              {isBn ? "*কমান্ডগুলো কপি করে আপনার সার্ভারে প্রয়োগ করুন" : "*Copy and execute on your server terminal or router"}
            </span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--navy-alpha-70)" }}>
            {isBn
              ? "নিচের কমান্ডগুলো আপনার সার্ভারের ফায়ারওয়ালে যোগ করলে এই আইপি থেকে আসা সকল ক্ষতিকর ডেটা প্যাকেট স্বয়ংক্রিয়ভাবে বাতিল হবে।"
              : "Execute these commands on your host terminal or firewall to immediately instruct the operating system to drop all incoming packets from this IP."}
          </p>
        </div>

        {/* 3 Dedicated Firewall Cards: Linux iptables, Linux UFW, Cisco Edge ACL with Before-Command Explanation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                {/* Header row with Platform Name, Category, and Copy Button */}
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
                    <span style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--cream)" }}>
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
                    <span>{isCopied ? (isBn ? "কপি হয়েছে!" : "Copied!") : (isBn ? "কমান্ড কপি করুন" : "Copy Command")}</span>
                  </button>
                </div>

                {/* Explicit Explanation BEFORE showing command: Where to run, When to run, What it does */}
                <div
                  style={{
                    padding: "10px 14px",
                    background: "var(--cream-alpha-04)",
                    borderBottom: "1px solid var(--cream-alpha-10)",
                    fontSize: "12px",
                    color: "var(--cream-alpha-85)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    lineHeight: 1.45
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--coral)" }}>{isBn ? "কোথায় চালাবেন:" : "Where to run:"}</strong>{" "}
                    {cmd.whereToRun}
                  </div>
                  <div>
                    <strong style={{ color: "var(--cream)" }}>{isBn ? "কখন চালাবেন:" : "When to run:"}</strong>{" "}
                    {cmd.whenToRun}
                  </div>
                  <div>
                    <strong style={{ color: "var(--cream)" }}>{isBn ? "এটি কী করবে:" : "What it does:"}</strong>{" "}
                    {cmd.whatItDoes}
                  </div>
                </div>

                {/* Actual Terminal Command */}
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
          6. ONE-CLICK ATTACKER CONTAINMENT (Formerly Human-in-the-Loop Gate)
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
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "এক-ক্লিকে আক্রমণকারী প্রতিরোধ (অপারেটর নিশ্চিতকরণ)" : "One-Click Attacker Blocking (Confirmation Required)"}
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
            {isBn ? "নিরাপদ অডিট গেট" : "Safe Human Confirmation Gate"}
          </span>
        </div>

        <p style={{ fontSize: "13px", color: "var(--navy-alpha-85)", margin: 0, lineHeight: 1.5 }}>
          {isBn
            ? "নিরাপত্তা নীতি: উল্লেখিত শেল কমান্ডগুলো আপনার সুবিধার জন্য দেওয়া হয়েছে। প্রহরী এআই আপনার সম্মতি ছাড়া নিজে থেকে কোনো কমান্ড চালায় না। নিচে অনুমোদন করলে এই আইপিটি অবিলম্বে এপিআই অপব্যবহার প্রতিরোধ তালিকায় যুক্ত হবে এবং অডিট ট্রেইলে সংরক্ষিত হবে।"
            : "Safety Guarantee: Suggested terminal commands above are never executed automatically by PROHORI. Approving below instantly adds this IP to the API Abuse Guard denylist and records an immutable entry in the append-only audit trail."}
        </p>

        {/* WORKFLOW STATES */}
        {approvalStep === "IDLE" && !isApproved && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", color: "var(--navy)", fontWeight: 700 }}>
              {isBn ? "প্রস্তাবিত পদক্ষেপ:" : "Recommended Defensive Action:"}
              <span className="font-mono font-tabular" style={{ marginLeft: "6px", color: "var(--coral)", fontWeight: 800 }}>
                BLOCK IP {sourceIp} IN API ABUSE GUARD
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
              <span>{isBn ? "আক্রমণকারীকে ব্লক করুন (Approve Defense)" : "Approve Defense: Block This Attacker"}</span>
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
                {isBn ? "ব্লক নিশ্চিত করুন:" : "Operator Confirmation Required"}
              </strong>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
              {isBn
                ? `আপনি কি নিশ্চিত যে আইপি ${sourceIp} থেকে আগত সকল ভবিষ্যৎ সংযোগ অবিলম্বে ব্লক করবেন? এই সিদ্ধান্তটি আপনার ডিজিটাল স্বাক্ষরসহ অডিট লগে সংরক্ষণ করা হবে।`
                : `Are you sure you want to block all incoming traffic from IP ${sourceIp}? This defensive action will be logged in the permanent audit trail with your timestamp.`}
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
                {isBn ? "হ্যাঁ, ব্লক কার্যকর করুন" : "Yes, Block Attacker"}
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
            <span>{isBn ? "ব্লক কার্যকর হচ্ছে এবং অডিট লগে এন্ট্রি তৈরি হচ্ছে..." : "Applying denylist block and writing append-only audit record..."}</span>
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
                {isBn ? "ব্লক প্রয়োগ ব্যর্থ হয়েছে" : "Perimeter Enforcement Failed"}
              </strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--navy)", margin: 0 }}>
              {approvalError || (isBn ? "সার্ভিসের সাথে যোগাযোগ করা যায়নি।" : "The defensive perimeter service could not be reached.")}
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
                {isBn ? "আক্রমণকারী ব্লক হয়েছে এবং অডিট লগে সংরক্ষিত" : "Attacker Blocked & Defense Verified in Audit Trail"}
              </strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--cream-alpha-85)", margin: 0, lineHeight: 1.5 }}>
              {isBn
                ? `আইপি ${sourceIp} সফলভাবে ডিনাইলিস্টে যুক্ত হয়েছে। এই হোস্ট থেকে আগত পরবর্তী সকল রিকোয়েস্ট HTTP 429 কোড দিয়ে বাতিল করা হবে।`
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
          7. ATTACK TECHNIQUE DETAILS (MITRE & Security Standards)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={17} color="var(--navy)" />
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
                {isBn ? "আক্রমণ কৌশল ও নিরাপত্তা নির্দেশিকা (MITRE ATT&CK)" : "Security Rules & Attack Patterns Explained (MITRE ATT&CK)"}
              </h4>
              <InfoTooltip term="MITRE ATT&CK" isBn={isBn} size={14} />
            </div>
            <span style={{ fontSize: "12px", color: "var(--navy-alpha-75)" }}>
              {isBn ? "কার্ডে ক্লিক করে বিস্তারিত প্রশমন নীতি দেখুন" : "Click citation for technical mitigation details"}
            </span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--navy-alpha-70)" }}>
            {isBn
              ? "আন্তর্জাতিক সাইবার নিরাপত্তা মানদণ্ড অনুসারে এই আক্রমণ কীভাবে কাজ করে এবং কীভাবে স্থায়ী সমাধান করবেন তার বিবরণ।"
              : "Official cybersecurity references explaining how this attack method operates and how to prevent it."}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {parsed.citations.map((cite) => {
            const isExpanded = expandedCitationId === cite.id;
            const mitreInfo = getMitreFriendlyInfo(cite.id, globalLanguage);
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
                      {mitreInfo.friendlyName || cite.name}
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
                    <div>
                      <strong>{isBn ? "সহজ ব্যাখ্যা:" : "Simple Explanation:"}</strong>{" "}
                      {mitreInfo.simpleExplanation || cite.description}
                    </div>
                    <div>
                      <strong>{isBn ? "প্রাসঙ্গিকতা:" : "Incident Relevance:"}</strong>{" "}
                      {cite.relevance}
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
                      <strong>{isBn ? "প্রতিরোধ পরামর্শ:" : "Recommended Mitigation:"}</strong>{" "}
                      {mitreInfo.mitigationTip || cite.mitigation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. EXPANDABLE ADVANCED FORENSIC DETAILS (For Developers & Engineers)
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          border: "1px solid var(--navy-alpha-20)",
          borderRadius: "8px",
          background: "var(--cream)",
          overflow: "hidden"
        }}
      >
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--navy-alpha-04)",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            color: "var(--navy)"
          }}
          aria-expanded={isAdvancedOpen}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Code2 size={17} color="var(--navy)" />
            <span style={{ fontSize: "14px", fontWeight: 800 }}>
              {isBn ? "উন্নত প্রযুক্তিগত ফরেনসিক বিবরণ (ডেভেলপার ও প্রকৌশলীদের জন্য)" : "Advanced Technical Details (For Developers & Engineers)"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--navy-alpha-75)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700 }}>
              {isAdvancedOpen ? (isBn ? "লুকান" : "Hide") : (isBn ? "প্রদর্শন করুন" : "Show")}
            </span>
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isAdvancedOpen && (
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid var(--navy-alpha-15)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "var(--cream)"
            }}
          >
            <p style={{ margin: 0, fontSize: "12.5px", color: "var(--navy-alpha-75)", lineHeight: 1.45 }}>
              {isBn
                ? "নিচে সম্পূর্ণ কাঁচা (Raw) টেলিমেট্রি অবজেক্ট ও সেন্সর প্যারামিটার দেওয়া হয়েছে যা প্রোগ্রাম্যাটিক তদন্ত ও ডিবাগিংয়ে সাহায্য করে।"
                : "Full raw telemetry payload and sensor parameters preserved for programmatic investigation, SIEM ingestion, and debugging."}
            </p>

            {/* Quick Metadata Key-Value Grid */}
            <div
              className="font-mono font-tabular"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "8px",
                fontSize: "12px",
                padding: "10px",
                background: "var(--navy-alpha-04)",
                borderRadius: "6px",
                border: "1px solid var(--navy-alpha-15)",
                color: "var(--navy)"
              }}
            >
              <div><strong>Event ID:</strong> {event.id}</div>
              <div><strong>Sensor Type:</strong> {event.source}</div>
              <div><strong>Raw Type:</strong> {event.type}</div>
              <div><strong>ISO Timestamp:</strong> {event.ts}</div>
              <div><strong>Severity:</strong> {event.severity}</div>
              <div><strong>Confidence:</strong> {event.analyst?.confidence ?? 0.94}</div>
            </div>

            {/* Raw JSON Code Viewer */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)" }}>
                {isBn ? "কাঁচা ইভেন্ট পেলোড (Raw JSON):" : "Raw Event Payload (JSON):"}
              </div>
              <pre
                className="font-mono font-tabular"
                style={{
                  margin: 0,
                  padding: "12px",
                  background: "var(--navy)",
                  color: "var(--cream)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  overflowX: "auto",
                  maxHeight: "220px"
                }}
              >
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          9. ASK THE AI ANALYST (Interactive Follow-Up Investigation)
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
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MessageSquare size={18} color="var(--navy)" />
              <span>{isBn ? "এই ঘটনা সম্পর্কে এআই-কে জিজ্ঞাসা করুন" : "Ask PROHORI AI About This Incident"}</span>
            </div>
            <p style={{ margin: "2px 0 0 28px", fontSize: "12px", color: "var(--navy-alpha-70)", fontWeight: 500, textAlign: "left" }}>
              {isBn ? "সহজ বাংলায় বা ইংরেজিতে প্রশ্ন করে বিস্তারিত জানুন" : "Ask questions in plain English or বাংলা to learn more"}
            </p>
          </div>
          {isAskOpen ? <ChevronUp size={18} color="var(--navy)" /> : <ChevronDown size={18} color="var(--navy)" />}
        </button>

        {isAskOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Quick Prompt Suggestion Chips in simple language */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button
                type="button"
                disabled={isStreaming}
                onClick={() =>
                  handleExecuteAsk(
                    isBn
                      ? "এই আক্রমণটি কতটা বিপজ্জনক এবং এতে কী ক্ষতি হতে পারে?"
                      : "How dangerous is this attack and what damage could it cause?"
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
                <span>{isBn ? "কতটা বিপজ্জনক?" : "How dangerous is it?"}</span>
              </button>

              <button
                type="button"
                disabled={isStreaming}
                onClick={() =>
                  handleExecuteAsk(
                    isBn
                      ? "আমি কীভাবে নিশ্চিত হব যে আক্রমণকারী পুরোপুরি ব্লক হয়েছে?"
                      : "How do I make sure the attacker is completely blocked?"
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
                <span>{isBn ? "ব্লক কীভাবে নিশ্চিত করব?" : "How to confirm blocking?"}</span>
              </button>

              <button
                type="button"
                disabled={isStreaming}
                onClick={() =>
                  handleExecuteAsk(
                    isBn
                      ? "এই আক্রমণকারী কি আমার অভ্যন্তরীণ নেটওয়ার্কের নাকি বাইরের ইন্টারনেটের?"
                      : "Is this attacker someone on my local network or outside on the internet?"
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
                <Globe size={14} color="var(--navy)" />
                <span>{isBn ? "লোকাল নাকি বহিরাগত?" : "Inside or outside network?"}</span>
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
                    ? "সহজ বাংলায় বা ইংরেজিতে প্রশ্ন লিখুন (যেমন: এই আইপি কীভাবে ব্লক করব?)..."
                    : "Ask in plain English or বাংলা (e.g. How to block this IP? What does this mean?)..."
                }
                disabled={isStreaming}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "var(--cream)",
                  border: "1px solid var(--navy-alpha-30)",
                  borderRadius: "8px",
                  color: "var(--navy)",
                  fontSize: "14.5px",
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
