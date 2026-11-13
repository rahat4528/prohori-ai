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
          background: "var(--navy-alpha-75)",
          backdropFilter: "blur(4px)",
          zIndex: 1999
        }}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "540px",
          maxWidth: "92vw",
          background: "var(--cream)",
          color: "var(--navy)",
          borderLeft: "1px solid var(--navy-alpha-25)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          overflowY: "auto"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--navy-alpha-15)", paddingBottom: "16px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={22} color="var(--navy)" />
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", margin: 0, letterSpacing: "0.03em" }}>
                EVENT INSPECTOR
              </h2>
              <span style={{ fontSize: "13px", color: "var(--navy-alpha-75)" }}>
                বিস্তারিত টেলিমেট্রি ও এআই বিশ্লেষণ
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary-cream"
            style={{ padding: "6px 10px", minHeight: "36px" }}
            title="Close inspector (Esc)"
            aria-label="Close inspector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Attributes Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
          <div style={{ background: "var(--navy-alpha-04)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700 }}>Event Source</div>
            <span className="badge" style={{ marginTop: "6px", background: "var(--navy)", color: "var(--cream)" }}>
              {event.source}
            </span>
          </div>

          <div style={{ background: "var(--navy-alpha-04)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--navy-alpha-15)" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700 }}>Severity Level</div>
            <span className={`badge severity-badge-${event.severity.toLowerCase()}`} style={{ marginTop: "6px" }}>
              {event.severity}
            </span>
          </div>

          <div style={{ background: "var(--navy-alpha-04)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--navy-alpha-15)", gridColumn: "span 2" }}>
            <div style={{ fontSize: "11px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700 }}>Event ID & Timestamp</div>
            <div style={{ fontSize: "13px", color: "var(--navy)", marginTop: "4px" }} className="font-mono">
              {event.id} &bull; {event.ts}
            </div>
          </div>
        </div>

        {/* AI SOC Analyst Intelligence Section */}
        <div style={{
          background: "var(--navy-alpha-04)",
          border: "1px solid var(--navy-alpha-20)",
          borderRadius: "8px",
          padding: "18px",
          marginBottom: "18px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--navy)", fontWeight: 800, fontSize: "13px" }}>
              <Bot size={18} color="var(--navy)" />
              <span>AI SOC ANALYST TRIAGE NARRATIVE</span>
            </div>

            {/* Language Tabs */}
            <div style={{ display: "flex", background: "var(--cream)", borderRadius: "6px", border: "1px solid var(--navy-alpha-20)", padding: "2px" }}>
              <button
                onClick={() => setLangTabOverride("en")}
                style={{
                  background: langTab === "en" ? "var(--coral)" : "transparent",
                  color: "var(--navy)",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  cursor: "pointer"
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLangTabOverride("bn")}
                style={{
                  background: langTab === "bn" ? "var(--coral)" : "transparent",
                  color: "var(--navy)",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "4px 10px",
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                {analyst.citations?.map((c, i) => (
                  <span
                    key={i}
                    className="badge font-mono"
                    style={{ background: "var(--navy-alpha-08)", color: "var(--navy)", border: "1px solid var(--navy-alpha-25)" }}
                  >
                    Citation: {c}
                  </span>
                ))}
                {analyst.confidence && (
                  <span className="badge font-mono" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)", border: "1px solid var(--navy-alpha-30)" }}>
                    Confidence: {Math.round(analyst.confidence * 100)}%
                  </span>
                )}
                {analyst.provider && (
                  <span
                    className="badge font-mono"
                    style={{
                      background: "var(--navy)",
                      color: "var(--cream)",
                      border: "1px solid var(--navy)"
                    }}
                  >
                    {analyst.provider.includes("deterministic")
                      ? `Engine: Offline RAG`
                      : `LLM: ${analyst.provider}`}
                  </span>
                )}
              </div>

              {/* Narrative Paragraph */}
              <div style={{
                fontSize: "14px",
                lineHeight: 1.65,
                color: "var(--navy)",
                borderLeft: "3px solid var(--coral)",
                paddingLeft: "14px",
                marginBottom: "16px",
                whiteSpace: "pre-line"
              }}>
                {narrative || analyst.narrative_en}
              </div>

              {/* Recommended Countermeasure Box */}
              {analyst.recommended_action && (
                <div style={{
                  background: "var(--cream)",
                  border: "1px solid var(--navy-alpha-20)",
                  borderRadius: "8px",
                  padding: "14px",
                  marginTop: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <ShieldAlert size={16} color="var(--navy)" />
                    <span style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 800, textTransform: "uppercase" }}>
                      Recommended Defensive Countermeasure (HITL)
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--navy)", marginBottom: "12px", lineHeight: 1.5 }}>
                    {analyst.recommended_action}
                  </div>

                  {actionApproved ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--navy)", color: "var(--cream)", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                      <CheckCircle size={16} />
                      <span>APPROVED & ACTIVE IN PERIMETER DENYLIST</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleApproveAction}
                      disabled={approving}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: "13px", minHeight: "40px" }}
                    >
                      {approving ? "Enforcing Block..." : "Approve Countermeasure (Human-in-the-Loop)"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "16px", color: "var(--navy-alpha-75)" }}>
              <AlertOctagon size={24} style={{ margin: "0 auto 6px", display: "block", color: "var(--navy)" }} />
              <p style={{ fontSize: "14px" }}>No AI triage record exists for this event yet.</p>
            </div>
          )}

          {/* Retriage Button */}
          <button
            onClick={handleRetriageClick}
            disabled={retriaging}
            className="btn btn-secondary-cream"
            style={{ width: "100%", marginTop: "14px", padding: "10px", minHeight: "42px" }}
          >
            <RefreshCw size={15} />
            <span>{retriaging ? "Running Grounded RAG Triage..." : "Re-Run Autonomous Triage"}</span>
          </button>
        </div>

        {/* Raw Event Details (JSON) */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
            <FileText size={14} />
            <span>Raw Sensor Telemetry Details</span>
          </div>
          <pre style={{
            background: "var(--navy)",
            border: "1px solid var(--navy-alpha-30)",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "12px",
            color: "var(--cream)",
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
