import React, { useState, useEffect } from "react";
import { X, History, Bot, UserCheck, Download, Search } from "lucide-react";

interface AuditEntry {
  id: string;
  ts: string;
  action_type: string;
  actor: string;
  input_event_id?: string;
  model_used: string;
  citations?: string[];
  verdict: Record<string, any>;
  human_approved: boolean;
  operator_id?: string;
}

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  apiBase
}) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${apiBase}/audit?limit=50`)
        .then((r) => r.json())
        .then((d) => setLogs(d))
        .catch((e) => console.error("Error loading audit logs:", e))
        .finally(() => setLoading(false));
    }
  }, [isOpen, apiBase]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const actionMatch = log.action_type.toLowerCase().includes(q);
    const actorMatch = log.actor.toLowerCase().includes(q);
    const modelMatch = log.model_used.toLowerCase().includes(q);
    const verdictMatch = JSON.stringify(log.verdict).toLowerCase().includes(q);
    return actionMatch || actorMatch || modelMatch || verdictMatch;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prohori_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(6px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "12px",
          width: "920px",
          maxWidth: "96vw",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)"
        }}
        className="animate-fade-in"
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 22px",
          borderBottom: "1px solid var(--border-subtle)",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <History size={20} color="#34d399" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                  IMMUTABLE AUDIT LOG
                </h2>
                <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#6ee7b7", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  RESPONSIBLE AI VERIFIED
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                অপরিবর্তনীয় অডিট ট্রেইল ও ক্রিপ্টোগ্রাফিক টাইমস্ট্যাম্প
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleExportJson}
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "4px 10px" }}
              title="Export complete audit trail to JSON for regulatory compliance"
            >
              <Download size={13} />
              <span>Export Audit Trail</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: "6px" }}
              title="Close audit log (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ padding: "10px 22px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Search size={14} color="var(--text-tertiary)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter audit entries by action, operator, model, or verdict..."
            className="input-control"
            style={{ flex: 1, padding: "6px 12px", height: "32px", fontSize: "12px" }}
          />
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }} className="font-mono">
            {filteredLogs.length} entries
          </span>
        </div>

        {/* Content list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
              Loading audit logs from database...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
              No audit records matching your criteria.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span className="badge font-mono" style={{
                        background: log.action_type.includes("APPROVE") ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
                        color: log.action_type.includes("APPROVE") ? "#34d399" : "#93c5fd",
                        border: `1px solid ${log.action_type.includes("APPROVE") ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)"}`
                      }}>
                        {log.action_type}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        Actor: <strong style={{ color: "var(--text-primary)" }}>{log.actor}</strong>
                      </span>
                      <span className="badge font-mono" style={{ background: "var(--bg-elevated)", color: "#a5b4fc" }}>
                        Model: {log.model_used}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {log.human_approved ? (
                        <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                          <UserCheck size={11} style={{ marginRight: "3px" }} />
                          HUMAN APPROVED
                        </span>
                      ) : (
                        <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                          <Bot size={11} style={{ marginRight: "3px" }} />
                          AUTONOMOUS TRIAGE
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }} className="font-mono">
                        {log.ts?.slice(0, 19).replace("T", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Citations */}
                  {log.citations && log.citations.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Citations:</span>
                      {log.citations.map((c, i) => (
                        <span key={i} className="badge font-mono" style={{ background: "rgba(56, 189, 248, 0.1)", color: "#7dd3fc" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Verdict summary */}
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", background: "var(--bg-canvas)", padding: "8px 12px", borderRadius: "5px", border: "1px solid var(--border-subtle)" }} className="font-mono">
                    {JSON.stringify(log.verdict, null, 1).replace(/\n\s*/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
