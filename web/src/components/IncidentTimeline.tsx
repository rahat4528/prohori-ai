import React from "react";
import { GitCommit, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { Incident } from "../types";


interface IncidentTimelineProps {
  incidents: Incident[];
  globalLanguage: "en" | "bn";
  onApproveIncidentAction: (incidentId: string) => void;
  approvedIncidents: Record<string, boolean>;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  incidents,
  globalLanguage,
  onApproveIncidentAction,
  approvedIncidents
}) => {
  return (
    <div className="soc-card">
      <div className="soc-card-header">
        <div className="soc-title">
          <GitCommit size={16} color="#34d399" />
          <span>ATTACK CAMPAIGNS & CORRELATION (সমন্বিত আক্রমণ টাইমলাইন)</span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>({incidents.length} active)</span>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "12px" }}>
          No multi-stage attack campaigns correlated yet. Single events are streaming in feed.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {incidents.map((inc) => {
            const isApproved = approvedIncidents[inc.incident_id];
            const summary = globalLanguage === "bn" ? inc.summary_bn : inc.summary_en;

            return (
              <div
                key={inc.incident_id}
                style={{
                  background: "#080d16",
                  border: "1px solid #1e293b",
                  borderLeft: `3px solid ${inc.severity === "critical" ? "#ef4444" : "#f97316"}`,
                  borderRadius: "6px",
                  padding: "12px"
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 800, color: "#f8fafc", fontSize: "12px" }} className="font-mono">
                      {inc.incident_id}
                    </span>
                    <span className="badge font-mono" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#93c5fd" }}>
                      IP: {inc.source_ip}
                    </span>

                    <span className={`badge badge-${inc.severity}`}>
                      {inc.severity}
                    </span>
                  </div>

                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {inc.event_count} correlated events
                  </span>
                </div>

                {/* Summary */}
                <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5, marginBottom: "8px" }}>
                  {summary}
                </p>

                {/* Action button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid #131b29" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Human-in-the-Loop Countermeasure:
                  </span>
                  {isApproved ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#34d399", fontSize: "11px", fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      <span>PERIMETER RULE DEPLOYED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onApproveIncidentAction(inc.incident_id)}
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <ShieldAlert size={12} />
                      <span>{globalLanguage === "bn" ? "আইপি ব্লক অনুমোদন করুন" : "Approve Firewall Block"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
