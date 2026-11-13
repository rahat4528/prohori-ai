import React, { useState } from "react";
import type { SecurityEvent } from "../types";
import { getFriendlyEventTitle, getSeverityConfig } from "../utils/alertUtils";
import { generateClientSideAnalystAnswer } from "../utils/analystFallback";
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  MessageSquare,
  Cpu,
  RotateCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface AuditConfirmation {
  audit_id: string;
  action_id: string;
  target: string;
  timestamp: string;
  enforcement: string;
  status: string;
}

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
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRetriaging, setIsRetriaging] = useState<boolean>(false);
  const [narrativeLang, setNarrativeLang] = useState<"en" | "bn">(globalLanguage);

  // Ask Analyst inline state
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
          border: "1.5px solid var(--navy-alpha-20)",
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
        <p style={{ fontSize: "16px", maxWidth: "400px", color: "var(--navy-alpha-75)", margin: 0, lineHeight: 1.5 }}>
          {isBn
            ? "বামপাশের তালিকা থেকে যেকোনো সতর্কতায় ক্লিক করে কৃত্রিম বুদ্ধিমত্তার (AI) বিস্তারিত বিশ্লেষণ ও প্রতিক্রিয়া দেখুন।"
            : "Click any security alert on the left to review autonomous AI threat analysis, verified citations, and approved defense countermeasures."}
        </p>
      </div>
    );
  }

  const sev = getSeverityConfig(event.severity, globalLanguage);
  const SevIcon = sev.icon;
  const friendlyTitle = getFriendlyEventTitle(event.type, globalLanguage);
  const sourceIp =
    event.details?.source_ip || event.details?.attacker_ip || event.details?.client_ip || "Internal Sensor";
  const analyst = event.analyst;
  const citations = analyst?.citations || [];
  const mitre = analyst?.mitre_technique;
  const targetResource = sourceIp;
  const actionKey = `${event.id}_${targetResource}`;
  const approvalAudit = approvedMap[actionKey];

  const narrativeText =
    narrativeLang === "bn"
      ? analyst?.narrative_bn || analyst?.narrative_en
      : analyst?.narrative_en || analyst?.narrative_bn;

  const defaultAction =
    narrativeLang === "bn"
      ? (analyst?.recommendations?.[0]?.description_bn ||
         analyst?.recommendations?.[0]?.action_type ||
         "পেরিমিটার ডিনাইলিস্টে আইপি যুক্ত করে ট্র্যাফিক সীমিত করুন।")
      : (analyst?.recommendations?.[0]?.description_en ||
         analyst?.recommendations?.[0]?.action_type ||
         "Add adversary IP to perimeter denylist and throttle traffic via rate limiter.");

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const rec = analyst?.recommendations?.[0];
      await onApproveDefense(
        rec?.action_id || "act_containment_01",
        targetResource,
        rec?.action_type || "rate_limit_containment"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleRetriageClick = async () => {
    setIsRetriaging(true);
    try {
      await onRetriage(event.id);
    } finally {
      setIsRetriaging(false);
    }
  };

  // Submit query to "Ask the Analyst" (with resilient sovereign fallback)
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
      // Sovereign / offline client fallback: if backend is unreachable (e.g. static Vercel deployment),
      // generate instant cited reasoning in the browser.
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

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--cream)",
        border: "1.5px solid var(--navy-alpha-20)",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "var(--shadow-md)",
        height: "100%",
        overflowY: "auto"
      }}
      aria-label={isBn ? "নির্বাচিত সতর্কতার বিস্তারিত বিশ্লেষণ" : "Selected Alert Threat Analysis"}
    >
      {/* 1. Header: Severity + Target + Title + Retriage */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          paddingBottom: "16px",
          borderBottom: "1.5px solid var(--navy-alpha-15)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Severity Badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 800,
                background: sev.bg,
                color: sev.color,
                border: `1.5px solid ${sev.border}`
              }}
            >
              <SevIcon size={15} color={sev.color} />
              <span>{sev.label}</span>
            </span>

            <span className="font-mono" style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)" }}>
              IP: {sourceIp}
            </span>

            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "6px",
                background: "var(--cream)",
                color: "var(--navy)",
                border: "1.5px solid var(--navy-alpha-30)"
              }}
            >
              {isBn ? "সেন্সর" : "Sensor"}: {event.source.toUpperCase()}
            </span>
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--navy)", margin: "4px 0 0 0", lineHeight: 1.3 }}>
            {friendlyTitle}
          </h2>
        </div>

        {/* Retriage Button */}
        <button
          onClick={handleRetriageClick}
          disabled={isRetriaging}
          className="btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            fontSize: "14px",
            fontWeight: 700,
            background: "var(--cream)",
            color: "var(--navy)",
            border: "1.5px solid var(--navy-alpha-30)",
            borderRadius: "8px",
            minHeight: "44px"
          }}
          title="Re-run RAG intelligence over this event"
          aria-label={isBn ? "পুনরায় বিশ্লেষণ করুন" : "Re-triage event"}
        >
          <RotateCw size={15} color="var(--navy)" />
          <span>{isRetriaging ? (isBn ? "বিশ্লেষণ হচ্ছে..." : "Analyzing...") : (isBn ? "পুনরায় বিশ্লেষণ" : "Re-Triage")}</span>
        </button>
      </div>

      {/* 2. Grounded Threat Intelligence Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", margin: "16px 0" }}>
        <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy-alpha-75)" }}>
          {isBn ? "ভেরিফায়েড থ্রেট সাইটেশন:" : "Grounded Citations:"}
        </span>
        {mitre && (
          <span
            className="font-mono"
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 800,
              background: "var(--navy)",
              color: "var(--cream)",
              border: "1px solid var(--navy)"
            }}
          >
            MITRE [{mitre}]
          </span>
        )}
        {citations.map((c) => (
          <span
            key={c}
            className="font-mono"
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 800,
              background: "var(--navy-alpha-12)",
              color: "var(--navy)",
              border: "1px solid var(--navy-alpha-40)"
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* 3. Section: WHAT HAPPENED */}
      <div
        style={{
          background: "var(--navy-alpha-04)",
          border: "1.5px solid var(--navy-alpha-15)",
          borderRadius: "10px",
          padding: "18px 20px",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
            {isBn ? "কী ঘটেছে (What Happened)" : "What Happened"}
          </h3>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => setNarrativeLang("en")}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "4px",
                background: narrativeLang === "en" ? "var(--navy)" : "transparent",
                color: narrativeLang === "en" ? "var(--cream)" : "var(--navy-alpha-75)",
                border: "1px solid var(--navy-alpha-30)",
                cursor: "pointer"
              }}
            >
              English
            </button>
            <button
              onClick={() => setNarrativeLang("bn")}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "4px",
                background: narrativeLang === "bn" ? "var(--navy)" : "transparent",
                color: narrativeLang === "bn" ? "var(--cream)" : "var(--navy-alpha-75)",
                border: "1px solid var(--navy-alpha-30)",
                cursor: "pointer"
              }}
            >
              বাংলা
            </button>
          </div>
        </div>

        <p style={{ fontSize: "16px", lineHeight: 1.65, color: "var(--navy)", margin: 0 }}>
          {narrativeText || (isBn ? "বিশ্লেষণ লোড হচ্ছে..." : "Loading autonomous threat triage...")}
        </p>
      </div>

      {/* 4. Section: RECOMMENDED DEFENSE */}
      <div
        style={{
          background: "var(--navy-alpha-04)",
          border: "1.5px solid var(--navy-alpha-15)",
          borderRadius: "10px",
          padding: "18px 20px",
          marginBottom: "18px"
        }}
      >
        <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--navy)", margin: "0 0 8px 0" }}>
          {isBn ? "প্রস্তাবিত পদক্ষেপ (Recommended Action)" : "Recommended Defense"}
        </h3>
        <p style={{ fontSize: "16px", lineHeight: 1.6, color: "var(--navy)", margin: 0 }}>
          {defaultAction}
        </p>
      </div>

      {/* 5. APPROVE DEFENSE ACTION GATE — Coral Attention CTA */}
      <div style={{ marginBottom: "22px" }}>
        {approvalAudit ? (
          /* Approved Confirmation Card (Navy surface on Cream with Coral outline) */
          <div
            style={{
              padding: "18px 20px",
              background: "var(--navy)",
              border: "2px solid var(--coral)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
            role="status"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={24} color="var(--coral)" />
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--cream)" }}>
                {isBn ? "প্রতিরক্ষা কার্যকর হয়েছে (Approved)" : "Defense Approved by Operator"}
              </span>
            </div>
            <p style={{ fontSize: "15px", color: "var(--cream)", margin: 0, lineHeight: 1.5 }}>
              {isBn
                ? `আক্রমণকারী আইপি ${approvalAudit.target} পেরিমিটার ডিনাইলিস্টে যুক্ত হয়েছে। পরবর্তী অনুরোধ অবিলম্বে ব্লক করা হবে।`
                : `Attacker IP ${approvalAudit.target} is placed in the active perimeter denylist. Subsequent requests are dropped.`}
            </p>
            {/* Direct Audit Trail Record Display */}
            <div
              className="font-mono"
              style={{
                marginTop: "6px",
                padding: "10px 14px",
                background: "var(--navy)",
                border: "1px solid var(--cream-alpha-20)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "var(--cream-alpha-85)",
                display: "flex",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <div><strong>Action ID:</strong> {approvalAudit.action_id}</div>
              <div><strong>Audit ID:</strong> {approvalAudit.audit_id}</div>
              <div><strong>Enforcement:</strong> {approvalAudit.enforcement}</div>
              <div><strong>Timestamp:</strong> {approvalAudit.timestamp}</div>
            </div>
          </div>
        ) : (
          /* Prominent Action Button — Coral Attention CTA */
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "14px 22px",
                fontSize: "17px",
                fontWeight: 800,
                background: "var(--coral)",
                color: "var(--navy)",
                border: "1.5px solid var(--coral)",
                borderRadius: "10px",
                cursor: isApproving ? "not-allowed" : "pointer",
                boxShadow: "var(--shadow-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                minHeight: "48px"
              }}
              aria-label={isBn ? "এই আক্রমণের বিরুদ্ধে প্রতিরোধ অনুমোদন করুন" : "Approve defensive perimeter containment"}
            >
              <ShieldAlert size={22} color="var(--navy)" />
              <span>
                {isApproving
                  ? (isBn ? "অনুমোদন করা হচ্ছে..." : "Applying Perimeter Defense...")
                  : (isBn ? "🛡️ প্রতিরক্ষা অনুমোদন করুন (Approve Defense)" : "🛡️ Approve Defense Countermeasure")}
              </span>
            </button>
            <p style={{ fontSize: "13px", color: "var(--navy-alpha-75)", margin: 0, textAlign: "center" }}>
              {isBn
                ? "মানবসক্রিয় অনুমোদন গেট: এই বোতাম চাপলে আক্রমণকারীর আইপি সক্রিয় ডিনাইলিস্টে যুক্ত হয় এবং অডিট ট্রেইলে সংরক্ষিত হয়।"
                : "Human-in-the-Loop Gate: Adds the adversary IP to the active rate-limiter denylist and records an entry in the append-only audit log."}
            </p>
          </div>
        )}
      </div>

      {/* 6. Section: ASK THE ANALYST */}
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
            fontSize: "17px",
            fontWeight: 800,
            cursor: "pointer",
            padding: "4px 0",
            minHeight: "44px"
          }}
          aria-expanded={isAskOpen}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare size={20} color="var(--navy)" />
            <span>{isBn ? "এই হুমকি সম্পর্কে এআই বিশ্লেষককে জিজ্ঞাসা করুন" : "Ask AI Analyst About This Threat"}</span>
          </div>
          {isAskOpen ? <ChevronUp size={20} color="var(--navy)" /> : <ChevronDown size={20} color="var(--navy)" />}
        </button>

        {isAskOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Quick Suggestion Chips */}
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
                  border: "1.5px solid var(--navy-alpha-30)",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>💡</span>
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
                  border: "1.5px solid var(--navy-alpha-30)",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>🛡️</span>
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
                  border: "1.5px solid var(--navy-alpha-30)",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>👤</span>
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
                  padding: "12px 16px",
                  background: "var(--cream)",
                  border: "1.5px solid var(--navy-alpha-30)",
                  borderRadius: "8px",
                  color: "var(--navy)",
                  fontSize: "15px",
                  fontWeight: 600
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
                <Send size={16} color="var(--navy)" />
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
              <div
                style={{
                  padding: "16px 18px",
                  background: "var(--navy-alpha-04)",
                  border: "1.5px solid var(--navy-alpha-20)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Cpu size={16} color="var(--navy)" />
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)" }}>
                      {isBn ? "বিশ্লেষকের উত্তর:" : "Analyst Response:"}
                    </span>
                  </div>
                  {askProvider && (
                    <span className="font-mono" style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontWeight: 700 }}>
                      Backend: {askProvider}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--navy)", margin: 0, whiteSpace: "pre-wrap" }}>
                  {askAnswer}
                </p>

                {askCitations.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--navy-alpha-75)" }}>
                      Citations:
                    </span>
                    {askCitations.map((c) => (
                      <span
                        key={c}
                        className="font-mono"
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 800,
                          background: "var(--navy)",
                          color: "var(--cream)"
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
