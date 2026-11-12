import React, { useState } from "react";
import type { SecurityEvent } from "../types";
import { getFriendlyEventTitle, getSeverityConfig } from "../utils/alertUtils";
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
          padding: "48px 24px",
          textAlign: "center",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "12px",
          color: "var(--text-secondary)",
          gap: "16px",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <ShieldAlert size={54} color="#38bdf8" />
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc" }}>
          {isBn ? "কোনো সতর্কতা নির্বাচিত নয়" : "No Alert Selected"}
        </h3>
        <p style={{ fontSize: "16px", maxWidth: "380px", color: "var(--text-secondary)", margin: 0 }}>
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
    analyst?.recommended_action ||
    (isBn
      ? `পেরিমিটার ফায়ারওয়ালে অবিলম্বে আক্রমণকারী আইপি ${sourceIp} ব্লক করুন এবং প্রবেশাধিকার সীমিত করুন।`
      : `Block source IP ${sourceIp} at perimeter edge firewall and enforce multi-factor authentication.`);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const actionId = `ACT-BLOCK-${event.id.slice(0, 8)}`;
      await onApproveDefense(actionId, targetResource, "PERIMETER_FIREWALL_DROP");
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

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isStreaming) return;

    setIsStreaming(true);
    setAskError("");
    setAskAnswer("");
    const userQuery = query.trim();
    setQuery("");

    try {
      const resp = await fetch(`${apiBase}/analyst/ask/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, language: globalLanguage })
      });

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.replace("data: ", ""));
                if (data.chunk) {
                  fullText += data.chunk;
                  setAskAnswer(fullText);
                }
                if (data.done) {
                  setAskProvider(data.provider || "AI Engine");
                  setAskCitations(data.citations || []);
                  setIsStreaming(false);
                }
              } catch {
                // Ignore SSE chunk json parse errors
              }
            }
          }
        }
      }
    } catch (err: any) {
      setAskError(err?.message || "Failed to reach AI analyst");
      setIsStreaming(false);
    }
  };

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        overflowY: "auto",
        maxHeight: "calc(100vh - 120px)",
        boxShadow: "var(--shadow-md)",
        padding: "20px"
      }}
      aria-label={isBn ? "নির্বাচিত সতর্কতার বিস্তারিত এআই বিশ্লেষণ" : "Detailed AI Analysis for Selected Alert"}
    >
      {/* 1. Header Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Severity + Source IP Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 700,
                background: sev.bg,
                color: sev.color,
                border: `1px solid ${sev.border}`
              }}
            >
              <SevIcon size={15} />
              <span>{sev.label}</span>
            </span>

            <span className="font-mono" style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
              IP: {sourceIp}
            </span>

            <span
              style={{
                fontSize: "12px",
                padding: "2px 8px",
                borderRadius: "4px",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-medium)"
              }}
            >
              {isBn ? "সেন্সর" : "Sensor"}: {event.source.toUpperCase()}
            </span>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc", margin: "4px 0 0 0" }}>
            {friendlyTitle}
          </h2>
        </div>

        {/* Retriage Button */}
        <button
          onClick={handleRetriageClick}
          disabled={isRetriaging}
          className="btn btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            minHeight: "44px"
          }}
          title="Re-run RAG intelligence over this event"
          aria-label={isBn ? "পুনরায় বিশ্লেষণ করুন" : "Re-triage event"}
        >
          <RotateCw size={14} className={isRetriaging ? "pulse-active" : ""} />
          <span>{isRetriaging ? (isBn ? "বিশ্লেষণ হচ্ছে..." : "Analyzing...") : (isBn ? "পুনরায় বিশ্লেষণ" : "Re-Triage")}</span>
        </button>
      </div>

      {/* 2. Grounded Threat Intelligence Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", margin: "14px 0" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-tertiary)" }}>
          {isBn ? "ভেরিফায়েড থ্রেট সাইটেশন:" : "Grounded Citations:"}
        </span>
        {mitre && (
          <span
            className="font-mono"
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.4)"
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
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.4)"
            }}
          >
            [{c}]
          </span>
        ))}
        {event.analyst?.provider && (
          <span
            className="font-mono"
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              background: event.analyst.provider.includes("deterministic")
                ? "rgba(148, 163, 184, 0.15)"
                : "rgba(168, 85, 247, 0.15)",
              color: event.analyst.provider.includes("deterministic") ? "#94a3b8" : "#c084fc",
              border: event.analyst.provider.includes("deterministic")
                ? "1px solid rgba(148, 163, 184, 0.4)"
                : "1px solid rgba(168, 85, 247, 0.4)"
            }}
          >
            {event.analyst.provider.includes("deterministic")
              ? `Engine: Offline RAG (${event.analyst.provider})`
              : `LLM: ${event.analyst.provider}`}
          </span>
        )}
      </div>

      {/* 3. Section: WHAT HAPPENED (Narrative) */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "10px",
          padding: "16px 18px",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8", margin: 0 }}>
            {isBn ? "কী ঘটেছে (What Happened)" : "What Happened"}
          </h3>
          {/* Language Toggle for Narrative */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => setNarrativeLang("en")}
              style={{
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "4px",
                background: narrativeLang === "en" ? "#0284c7" : "transparent",
                color: narrativeLang === "en" ? "#ffffff" : "var(--text-tertiary)",
                border: "1px solid var(--border-medium)",
                cursor: "pointer"
              }}
            >
              EN
            </button>
            <button
              onClick={() => setNarrativeLang("bn")}
              style={{
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "4px",
                background: narrativeLang === "bn" ? "#0284c7" : "transparent",
                color: narrativeLang === "bn" ? "#ffffff" : "var(--text-tertiary)",
                border: "1px solid var(--border-medium)",
                cursor: "pointer"
              }}
            >
              বাংলা
            </button>
          </div>
        </div>

        <p style={{ fontSize: "16px", lineHeight: 1.65, color: "#f8fafc", margin: 0 }}>
          {narrativeText || (isBn ? "বিশ্লেষণ লোড হচ্ছে..." : "Loading autonomous threat triage...")}
        </p>
      </div>

      {/* 4. Section: RECOMMENDED DEFENSE */}
      <div
        style={{
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "10px",
          padding: "16px 18px",
          marginBottom: "16px"
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#34d399", margin: "0 0 8px 0" }}>
          {isBn ? "প্রস্তাবিত পদক্ষেপ (Recommended Action)" : "Recommended Defense"}
        </h3>
        <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#f8fafc", margin: 0 }}>
          {defaultAction}
        </p>
      </div>

      {/* 5. APPROVE DEFENSE ACTION GATE */}
      <div style={{ marginBottom: "20px" }}>
        {approvalAudit ? (
          /* Approved Confirmation Card */
          <div
            style={{
              padding: "16px 18px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "2px solid #10b981",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
            role="status"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={22} color="#10b981" />
              <span style={{ fontSize: "17px", fontWeight: 800, color: "#6ee7b7" }}>
                {isBn ? "প্রতিরক্ষা কার্যকর হয়েছে (Approved)" : "Defense Approved by Operator"}
              </span>
            </div>
            <p style={{ fontSize: "15px", color: "#f8fafc", margin: 0 }}>
              {isBn
                ? `আক্রমণকারী আইপি ${approvalAudit.target} পেরিমিটার ডিনাইলিস্টে যুক্ত হয়েছে। পরবর্তী অনুরোধ অবিলম্বে ব্লক করা হবে।`
                : `Attacker IP ${approvalAudit.target} is placed in the active perimeter denylist. Subsequent requests are dropped.`}
            </p>
            {/* Direct Audit Trail Record Display */}
            <div
              className="font-mono"
              style={{
                marginTop: "6px",
                padding: "8px 12px",
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#cbd5e1"
              }}
            >
              <div><strong>Action ID:</strong> {approvalAudit.action_id}</div>
              <div><strong>Audit ID:</strong> {approvalAudit.audit_id}</div>
              <div><strong>Enforcement:</strong> {approvalAudit.enforcement}</div>
              <div><strong>Timestamp:</strong> {approvalAudit.timestamp}</div>
            </div>
          </div>
        ) : (
          /* Prominent Action Button */
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "14px 20px",
                fontSize: "17px",
                fontWeight: 800,
                background: "#059669",
                color: "#ffffff",
                border: "1px solid #10b981",
                borderRadius: "10px",
                cursor: isApproving ? "not-allowed" : "pointer",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                minHeight: "48px"
              }}
              aria-label={isBn ? "এই আক্রমণের বিরুদ্ধে প্রতিরোধ অনুমোদন করুন" : "Approve defensive perimeter containment"}
            >
              <ShieldAlert size={20} />
              <span>
                {isApproving
                  ? (isBn ? "অনুমোদন করা হচ্ছে..." : "Applying Perimeter Defense...")
                  : (isBn ? "🛡️ প্রতিরক্ষা অনুমোদন করুন (Approve Defense)" : "🛡️ Approve Defense Countermeasure")}
              </span>
            </button>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0, textAlign: "center" }}>
              {isBn
                ? "মানবসক্রিয় অনুমোদন গেট: এই বোতাম চাপলে আক্রমণকারীর আইপি সক্রিয় ডিনাইলিস্টে যুক্ত হয় এবং অডিট ট্রেইলে সংরক্ষিত হয়।"
                : "Human-in-the-Loop Gate: Adds the adversary IP to the active rate-limiter denylist and records an entry in the append-only audit log."}
            </p>
          </div>
        )}
      </div>

      {/* 6. Section: ASK THE ANALYST (Built right into this threat context!) */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
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
            color: "#f8fafc",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            padding: "4px 0",
            minHeight: "44px"
          }}
          aria-expanded={isAskOpen}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={18} color="#38bdf8" />
            <span>{isBn ? "এই হুমকি সম্পর্কে এআই বিশ্লেষককে জিজ্ঞাসা করুন" : "Ask AI Analyst About This Threat"}</span>
          </div>
          {isAskOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isAskOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Quick Suggestion Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setQuery(isBn ? "এই আক্রমণের মূল কৌশল এবং ক্ষতি করার সম্ভাবনা ব্যাখ্যা করুন।" : "Explain the primary attack vector and potential impact.")}
                style={{
                  fontSize: "13px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  color: "#cbd5e1",
                  border: "1px solid var(--border-medium)",
                  cursor: "pointer"
                }}
              >
                {isBn ? "💡 মূল কৌশল কী?" : "💡 Primary vector?"}
              </button>
              <button
                type="button"
                onClick={() => setQuery(isBn ? "এই আইপি কীভাবে পারিপার্শ্বিক ফায়ারওয়ালে ব্লক করব?" : "What are the exact firewall containment commands?")}
                style={{
                  fontSize: "13px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  color: "#cbd5e1",
                  border: "1px solid var(--border-medium)",
                  cursor: "pointer"
                }}
              >
                {isBn ? "🛡️ ফায়ারওয়াল ব্লক পদ্ধতি" : "🛡️ Firewall commands"}
              </button>
              <button
                type="button"
                onClick={() => setQuery(isBn ? "এটি কি অভ্যন্তরীণ নিরাপত্তা লঙ্ঘন নাকি বহিঃস্থ আক্রমণ?" : "Is this an insider threat or external scan?")}
                style={{
                  fontSize: "13px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  color: "#cbd5e1",
                  border: "1px solid var(--border-medium)",
                  cursor: "pointer"
                }}
              >
                {isBn ? "🔍 ইনসাইডার থ্রেট নাকি বহিঃস্থ?" : "🔍 Insider or external?"}
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskSubmit} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isBn ? "বাংলায় বা ইংরেজিতে প্রশ্ন লিখুন..." : "Ask in English or Bangla..."}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  fontSize: "15px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "#f8fafc"
                }}
                aria-label={isBn ? "বিশ্লেষককে প্রশ্ন করুন" : "Ask the AI analyst a question"}
              />
              <button
                type="submit"
                disabled={isStreaming || !query.trim()}
                className="btn btn-primary"
                style={{
                  padding: "10px 18px",
                  fontSize: "15px",
                  fontWeight: 700,
                  background: "#0284c7",
                  border: "1px solid #38bdf8",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  minHeight: "44px"
                }}
              >
                <Send size={15} />
                <span>{isStreaming ? (isBn ? "লিখছে..." : "Generating...") : (isBn ? "জিজ্ঞাসা" : "Ask")}</span>
              </button>
            </form>

            {/* Streaming Output Box */}
            {(askAnswer || isStreaming || askError) && (
              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                {askProvider && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Cpu size={12} />
                    <span>Answered via: {askProvider}</span>
                  </span>
                )}
                {askError && (
                  <div style={{ color: "#f87171", fontSize: "14px" }}>
                    {askError}
                  </div>
                )}
                {askAnswer && (
                  <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#f8fafc", margin: 0, whiteSpace: "pre-wrap" }}>
                    {askAnswer}
                  </p>
                )}
                {askCitations.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    {askCitations.map((c) => (
                      <span
                        key={c}
                        className="font-mono"
                        style={{
                          fontSize: "11px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(56, 189, 248, 0.12)",
                          color: "#38bdf8"
                        }}
                      >
                        [{c}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
