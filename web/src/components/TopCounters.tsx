import React from "react";
import { AlertTriangle, ShieldCheck, Flame, Ban, Network } from "lucide-react";
import type { SecurityEvent } from "../types";

interface TopCountersProps {
  events: SecurityEvent[];
  incidentCount: number;
  onSelectSeverityFilter?: (sev: string) => void;
  onSelectSourceFilter?: (src: string) => void;
  selectedSeverity?: string;
  selectedSource?: string;
}

export const TopCounters: React.FC<TopCountersProps> = ({
  events,
  incidentCount,
  onSelectSeverityFilter,
  onSelectSourceFilter,
  selectedSeverity,
  selectedSource
}) => {
  const criticalHighCount = events.filter(
    (e) => e.severity === "critical" || e.severity === "high"
  ).length;

  const honeypotHits = events.filter((e) => e.source === "honeypot").length;
  const blockedRequests = events.filter(
    (e) => e.source === "ratelimiter" || e.type === "blocked_request"
  ).length;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
      gap: "12px",
      marginBottom: "16px"
    }}>
      {/* Total Events */}
      <div
        className="soc-card"
        onClick={() => {
          if (onSelectSeverityFilter) onSelectSeverityFilter("all");
          if (onSelectSourceFilter) onSelectSourceFilter("all");
        }}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          borderTop: "3px solid #38bdf8",
          background: selectedSeverity === "all" && selectedSource === "all" ? "var(--bg-elevated)" : "var(--bg-card)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            Ingested Events
          </span>
          <ShieldCheck size={16} color="#38bdf8" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "#f8fafc" }}>
          {events.length}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Unified event bus</span>
          <span className="badge" style={{ background: "rgba(56, 189, 248, 0.1)", color: "#7dd3fc", fontSize: "10px", padding: "1px 6px" }}>
            STREAMING
          </span>
        </div>
      </div>

      {/* Critical / High Alerts */}
      <div
        className="soc-card"
        onClick={() => onSelectSeverityFilter && onSelectSeverityFilter(selectedSeverity === "critical" ? "all" : "critical")}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          borderTop: "3px solid #ef4444",
          borderColor: criticalHighCount > 0 ? "rgba(239, 68, 68, 0.4)" : "var(--border-subtle)",
          boxShadow: criticalHighCount > 0 ? "var(--shadow-glow-critical)" : "var(--shadow-md)",
          background: selectedSeverity === "critical" ? "rgba(239, 68, 68, 0.1)" : "var(--bg-card)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#fca5a5", textTransform: "uppercase", fontWeight: 700 }}>
            Critical Alerts
          </span>
          <AlertTriangle size={16} color="#ef4444" className={criticalHighCount > 0 ? "pulse-active" : ""} />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "#ef4444" }}>
          {criticalHighCount}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "#fca5a5" }}>Urgent triage needed</span>
          <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", fontSize: "10px", padding: "1px 6px" }}>
            {criticalHighCount > 0 ? "ACTION" : "CLEAR"}
          </span>
        </div>
      </div>

      {/* Honeypot Decoy Hits */}
      <div
        className="soc-card"
        onClick={() => onSelectSourceFilter && onSelectSourceFilter(selectedSource === "honeypot" ? "all" : "honeypot")}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          borderTop: "3px solid #c084fc",
          background: selectedSource === "honeypot" ? "rgba(168, 85, 247, 0.1)" : "var(--bg-card)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#d8b4fe", textTransform: "uppercase", fontWeight: 700 }}>
            Honeypot Hits
          </span>
          <Flame size={16} color="#c084fc" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "#c084fc" }}>
          {honeypotHits}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Decoy traps engaged</span>
          <span className="badge" style={{ background: "rgba(168, 85, 247, 0.12)", color: "#d8b4fe", fontSize: "10px", padding: "1px 6px" }}>
            PORT 8081
          </span>
        </div>
      </div>

      {/* Rate Limiter Blocks */}
      <div
        className="soc-card"
        onClick={() => onSelectSourceFilter && onSelectSourceFilter(selectedSource === "ratelimiter" ? "all" : "ratelimiter")}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          borderTop: "3px solid #60a5fa",
          background: selectedSource === "ratelimiter" ? "rgba(59, 130, 246, 0.1)" : "var(--bg-card)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#93c5fd", textTransform: "uppercase", fontWeight: 700 }}>
            Abuse Blocks
          </span>
          <Ban size={16} color="#60a5fa" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "#60a5fa" }}>
          {blockedRequests}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>HTTP 429 throttles</span>
          <span className="badge" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#93c5fd", fontSize: "10px", padding: "1px 6px" }}>
            ACTIVE
          </span>
        </div>
      </div>

      {/* Correlated Incidents */}
      <div
        className="soc-card"
        style={{
          padding: "14px 16px",
          borderTop: "3px solid #34d399",
          background: "var(--bg-card)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#6ee7b7", textTransform: "uppercase", fontWeight: 700 }}>
            Correlated Incidents
          </span>
          <Network size={16} color="#34d399" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "#34d399" }}>
          {incidentCount}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Multi-stage campaigns</span>
          <span className="badge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#6ee7b7", fontSize: "10px", padding: "1px 6px" }}>
            KILL-CHAIN
          </span>
        </div>
      </div>
    </div>
  );
};
