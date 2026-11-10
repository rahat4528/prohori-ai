import React, { useState, useEffect } from "react";
import { X, Bot, Shield, CheckCircle, RefreshCw, FileText, AlertOctagon, ShieldAlert } from "lucide-react";
import type { SecurityEvent } from "../types";

interface EventDetailDrawerProps {
  event: SecurityEvent | null;
  onClose: () => void;
  onRetriage: (eventId: string) => Promise<void>;
  globalLanguage: "en" | "bn";
  apiBase?: string;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  onClose,
  onRetriage,
  globalLanguage,
  apiBase = "http://localhost:8000"
}) => {
  const [langTabOverride, setLangTabOverride] = useState<"en" | "bn" | null>(null);
  const langTab = langTabOverride ?? globalLanguage;
  const [retriaging, setRetriaging] = useState(false);
  const [actionApproved, setActionApproved] = useState(false);
  const [approving, setApproving] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && event) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event, onClose]);

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

  const handleApproveAction = async () => {
    const targetIp = event.details?.source_ip || event.details?.target_host || "192.168.1.189";
    setApproving(true);
    try {
      const apiKey = import.meta.env.VITE_PROHORI_API_KEY || "";
      const headers: Record<string, string> = apiKey
        ? { "Content-Type": "application/json", "X-API-Key": apiKey }
        : { "Content-Type": "application/json" };
      const resp = await fetch(`${apiBase}/audit/approve`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          action_id: `ACT-EV-${event.id.slice(0, 8)}`,
          target: targetIp,
          action_type: "PERIMETER_FIREWALL_DROP",
          operator_id: "SOC_CONSOLE_OPERATOR"
        })
      });
      if (resp.ok) {
        setActionApproved(true);
      }
    } catch (e) {
      console.error("Failed to approve countermeasure:", e);
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.65)",
          backdropFilter: "blur(3px)",
          zIndex: 999
        }}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "520px",
          maxWidth: "92vw",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          padding: "22px",
          overflowY: "auto"
        }}
        className="animate-slide-in"
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={20} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#f8fafc", margin: 0, letterSpacing: "0.03em" }}>
                EVENT INSPECTOR
              </h2>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                বিস্তারিত টেলিমেট্রি ও এআই বিশ্লেষণ
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: "6px" }}
            title="Close inspector (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Attributes Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div style={{ background: "var(--bg-elevated)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Event Source</div>
            <span className={`badge source-${event.source}`} style={{ marginTop: "4px" }}>
              {event.source}
            </span>
          </div>

          <div style={{ background: "var(--bg-elevated)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Severity Level</div>
            <span className={`badge badge-${event.severity}`} style={{ marginTop: "4px" }}>
              {event.severity}
            </span>
          </div>

          <div style={{ background: "var(--bg-elevated)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", gridColumn: "span 2" }}>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Event ID & Timestamp</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "3px" }} className="font-mono">
              {event.id} &bull; {event.ts}
            </div>
          </div>
        </div>

        {/* AI SOC Analyst Intelligence Section */}
        <div style={{
          background: "var(--bg-card-subtle)",
          border: "1px solid #1e3a5f",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", fontWeight: 700, fontSize: "12px" }}>
              <Bot size={16} />
              <span>AI SOC ANALYST TRIAGE NARRATIVE</span>
            </div>

            {/* Language Tabs */}
            <div style={{ display: "flex", background: "var(--bg-canvas)", borderRadius: "4px", border: "1px solid var(--border-subtle)", padding: "2px" }}>
              <button
                onClick={() => setLangTabOverride("en")}
                style={{
                  background: langTab === "en" ? "#2563eb" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "3px",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  cursor: "pointer"
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLangTabOverride("bn")}
                style={{
                  background: langTab === "bn" ? "#2563eb" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "3px",
                  fontSize: "10px",
                  fontWeight: 700,
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
              {/* Citations & Confidence */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {analyst.citations?.map((c, i) => (
                  <span
                    key={i}
                    className="badge font-mono"
                    style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.35)" }}
                  >
                    Citation: {c}
                  </span>
                ))}
                {analyst.confidence && (
                  <span className="badge font-mono" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.35)" }}>
                    Confidence: {Math.round(analyst.confidence * 100)}%
                  </span>
                )}
                {analyst.provider && (
                  <span
                    className="badge font-mono"
                    style={{
                      background: analyst.provider.includes("deterministic")
                        ? "rgba(100, 116, 139, 0.15)"
                        : "rgba(168, 85, 247, 0.15)",
                      color: analyst.provider.includes("deterministic") ? "#94a3b8" : "#d8b4fe",
                      border: analyst.provider.includes("deterministic")
                        ? "1px solid rgba(100, 116, 139, 0.35)"
                        : "1px solid rgba(168, 85, 247, 0.35)",
                    }}
                  >
                    {analyst.provider.includes("deterministic")
                      ? `Engine: Offline RAG (${analyst.provider})`
                      : `LLM: ${analyst.provider}`}
                  </span>
                )}
              </div>

              {/* Narrative Paragraph */}
              <div style={{
                fontSize: "12px",
                lineHeight: 1.65,
                color: "#e2e8f0",
                borderLeft: "3px solid #38bdf8",
                paddingLeft: "12px",
                marginBottom: "14px",
                whiteSpace: "pre-line"
              }}>
                {narrative || analyst.narrative_en}
              </div>

              {/* Recommended Countermeasure Box */}
              {analyst.recommended_action && (
                <div style={{
                  background: "var(--bg-canvas)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "12px",
                  marginTop: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <ShieldAlert size={14} color="#f59e0b" />
                    <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>
                      Recommended Defensive Countermeasure (HITL)
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: 1.5 }}>
                    {analyst.recommended_action}
                  </div>

                  {actionApproved ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "11px", fontWeight: 700 }}>
                      <CheckCircle size={15} />
                      <span>APPROVED & ACTIVE IN PERIMETER DENYLIST</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleApproveAction}
                      disabled={approving}
                      className="btn btn-success"
                      style={{ padding: "5px 12px", fontSize: "11px" }}
                    >
                      {approving ? "Enforcing Block..." : "Approve Countermeasure (Human-in-the-Loop)"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "16px", color: "var(--text-tertiary)" }}>
              <AlertOctagon size={24} style={{ margin: "0 auto 6px", display: "block", color: "#f59e0b" }} />
              <p style={{ fontSize: "12px" }}>No AI triage record exists for this event yet.</p>
            </div>
          )}

          {/* Retriage Button */}
          <button
            onClick={handleRetriageClick}
            disabled={retriaging}
            className="btn btn-secondary"
            style={{ width: "100%", marginTop: "12px", padding: "8px" }}
          >
            <RefreshCw size={13} className={retriaging ? "pulse-active" : ""} />
            <span>{retriaging ? "Running Grounded RAG Triage..." : "Re-Run Autonomous Triage"}</span>
          </button>
        </div>

        {/* Raw Event Details (JSON) */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
            <FileText size={13} />
            <span>Raw Sensor Telemetry Details</span>
          </div>
          <pre style={{
            background: "#04070c",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "12px",
            fontSize: "11px",
            color: "#94a3b8",
            overflowX: "auto",
            maxHeight: "220px",
            lineHeight: 1.5
          }} className="font-mono">
            {JSON.stringify(event.details, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
};
