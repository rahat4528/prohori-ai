import React, { useState } from "react";
import { X, Bot, Shield, CheckCircle, RefreshCw, FileText, AlertOctagon } from "lucide-react";
import type { SecurityEvent } from "../types";


interface EventDetailDrawerProps {
  event: SecurityEvent | null;
  onClose: () => void;
  onRetriage: (eventId: string) => Promise<void>;
  globalLanguage: "en" | "bn";
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  onClose,
  onRetriage,
  globalLanguage
}) => {
  const [langTab, setLangTab] = useState<"en" | "bn">(globalLanguage);
  const [retriaging, setRetriaging] = useState(false);
  const [actionApproved, setActionApproved] = useState(false);

  if (!event) return null;

  const analyst = event.analyst;
  const narrative = langTab === "bn" ? analyst?.narrative_bn : analyst?.narrative_en;

  const handleRetriageClick = async () => {
    setRetriaging(true);
    try {
      await onRetriage(event.id);
    } finally {
      setRetriaging(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      width: "520px",
      maxWidth: "95vw",
      background: "#0a0f18",
      borderLeft: "1px solid #1e293b",
      boxShadow: "-8px 0 32px rgba(0,0,0,0.8)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      overflowY: "auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "14px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={18} color="#38bdf8" />
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
            EVENT INSPECTOR // বিস্তারিত অনুসন্ধান
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Primary Attributes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        <div style={{ background: "#0d131f", padding: "8px 12px", borderRadius: "6px", border: "1px solid #1e293b" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Event Source</div>
          <span className={`badge source-${event.source}`} style={{ marginTop: "4px" }}>
            {event.source}
          </span>
        </div>
        <div style={{ background: "#0d131f", padding: "8px 12px", borderRadius: "6px", border: "1px solid #1e293b" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Severity Level</div>
          <span className={`badge badge-${event.severity}`} style={{ marginTop: "4px" }}>
            {event.severity}
          </span>
        </div>
        <div style={{ background: "#0d131f", padding: "8px 12px", borderRadius: "6px", border: "1px solid #1e293b", gridColumn: "span 2" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Event ID & Timestamp</div>
          <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px" }} className="font-mono">
            {event.id} &bull; {event.ts}
          </div>
        </div>
      </div>

      {/* AI SOC Analyst Intelligence Section */}
      <div style={{
        background: "#0c1524",
        border: "1px solid #1e3a5f",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", fontWeight: 700, fontSize: "12px" }}>
            <Bot size={16} />
            <span>AI SOC ANALYST TRIAGE NARRATIVE</span>
          </div>

          {/* Lang Tabs */}
          <div style={{ display: "flex", background: "#090d15", borderRadius: "4px", border: "1px solid #1e293b" }}>
            <button
              onClick={() => setLangTab("en")}
              style={{
                background: langTab === "en" ? "#2563eb" : "transparent",
                color: "#fff",
                border: "none",
                fontSize: "10px",
                padding: "2px 8px",
                cursor: "pointer"
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLangTab("bn")}
              style={{
                background: langTab === "bn" ? "#2563eb" : "transparent",
                color: "#fff",
                border: "none",
                fontSize: "10px",
                padding: "2px 8px",
                cursor: "pointer"
              }}
            >
              বাংলা
            </button>
          </div>
        </div>

        {analyst ? (
          <div>
            {/* Citations & confidence */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {analyst.citations?.map((c, i) => (
                <span
                  key={i}
                  className="badge"
                  style={{ background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.4)" }}
                >
                  Citation: {c}
                </span>
              ))}
              {analyst.confidence && (
                <span className="badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
                  Confidence: {Math.round(analyst.confidence * 100)}%
                </span>
              )}
            </div>

            {/* Narrative Paragraph */}
            <div style={{
              fontSize: "12px",
              lineHeight: 1.6,
              color: "#e2e8f0",
              borderLeft: "3px solid #38bdf8",
              paddingLeft: "10px",
              marginBottom: "12px",
              whiteSpace: "pre-line"
            }}>
              {narrative || analyst.narrative_en}
            </div>

            {/* Recommended Countermeasure */}
            {analyst.recommended_action && (
              <div style={{
                background: "#080c14",
                border: "1px solid #1e293b",
                borderRadius: "6px",
                padding: "10px",
                marginTop: "10px"
              }}>
                <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                  Recommended Defensive Countermeasure (HITL)
                </div>
                <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "8px" }}>
                  {analyst.recommended_action}
                </div>

                {actionApproved ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "11px", fontWeight: 600 }}>
                    <CheckCircle size={14} />
                    <span>DEFENSIVE ACTION APPROVED BY OPERATOR</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setActionApproved(true)}
                    style={{
                      background: "#059669",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Approve Countermeasure (Human-in-the-Loop)
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "16px", color: "#64748b" }}>
            <AlertOctagon size={24} style={{ margin: "0 auto 6px", display: "block", color: "#f59e0b" }} />
            <p style={{ fontSize: "12px" }}>No AI triage record exists for this event yet.</p>
          </div>
        )}

        {/* Retriage Button */}
        <button
          onClick={handleRetriageClick}
          disabled={retriaging}
          style={{
            marginTop: "12px",
            width: "100%",
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: retriaging ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          <RefreshCw size={13} className={retriaging ? "pulse-active" : ""} />
          <span>{retriaging ? "Running Grounded RAG Triage..." : "Re-Run Autonomous Triage"}</span>
        </button>
      </div>

      {/* Raw Event Details (JSON) */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
          <FileText size={13} />
          <span>Raw Sensor Telemetry Details</span>
        </div>
        <pre style={{
          background: "#05080e",
          border: "1px solid #1e293b",
          borderRadius: "6px",
          padding: "12px",
          fontSize: "11px",
          color: "#94a3b8",
          overflowX: "auto",
          maxHeight: "220px"
        }} className="font-mono">
          {JSON.stringify(event.details, null, 2)}
        </pre>
      </div>
    </div>
  );
};
