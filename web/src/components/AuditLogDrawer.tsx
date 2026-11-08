import React, { useState, useEffect } from "react";
import { X, History, Bot, UserCheck } from "lucide-react";


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

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#0a0f18",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        width: "900px",
        maxWidth: "96vw",
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 16px 40px rgba(0,0,0,0.8)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #1e293b"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <History size={18} color="#34d399" />
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
              IMMUTABLE AUDIT LOG // অপরিবর্তনীয় অডিট ট্রেইল
            </h2>
            <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#6ee7b7", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              RESPONSIBLE AI & SOVEREIGNTY VERIFIED
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              No audit records generated yet. Ingest an event or approve a countermeasure to create verified logs.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: "#080c14",
                    border: "1px solid #1e293b",
                    borderRadius: "6px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="badge" style={{
                        background: log.action_type.includes("APPROVE") ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                        color: log.action_type.includes("APPROVE") ? "#34d399" : "#93c5fd"
                      }}>
                        {log.action_type}
                      </span>
                      <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
                        Actor: <strong>{log.actor}</strong>
                      </span>
                      <span className="badge" style={{ background: "#162032", color: "#94a3b8" }}>
                        Model: {log.model_used}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {log.human_approved ? (
                        <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                          <UserCheck size={10} style={{ marginRight: "3px" }} />
                          HUMAN APPROVED
                        </span>
                      ) : (
                        <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                          <Bot size={10} style={{ marginRight: "3px" }} />
                          AUTONOMOUS TRIAGE
                        </span>
                      )}
                      <span style={{ fontSize: "10px", color: "#64748b" }} className="font-mono">
                        {log.ts?.slice(0, 19).replace("T", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Citations */}
                  {log.citations && log.citations.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", color: "#64748b" }}>Grounded Citations:</span>
                      {log.citations.map((c, i) => (
                        <span key={i} className="badge" style={{ background: "rgba(56, 189, 248, 0.1)", color: "#7dd3fc" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Verdict summary */}
                  <div style={{ fontSize: "11px", color: "#94a3b8", background: "#05080e", padding: "6px 10px", borderRadius: "4px" }} className="font-mono">
                    {JSON.stringify(log.verdict)}
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
