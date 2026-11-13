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
          borderTop: "3px solid var(--coral)",
          background: "var(--cream)",
          color: "var(--navy)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700 }}>
            Ingested Events
          </span>
          <ShieldCheck size={16} color="var(--navy)" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "var(--navy)" }}>
          {events.length}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--navy-alpha-75)" }}>Unified event bus</span>
          <span className="badge" style={{ background: "var(--navy-alpha-08)", color: "var(--navy)", fontSize: "10px", padding: "1px 6px" }}>
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
          borderTop: "3px solid var(--coral)",
          background: "var(--cream)",
          color: "var(--navy)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--navy)", textTransform: "uppercase", fontWeight: 700 }}>
            Critical Alerts
          </span>
          <AlertTriangle size={16} color="var(--coral)" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "var(--coral)" }}>
          {criticalHighCount}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--navy-alpha-75)" }}>Urgent triage needed</span>
          <span className="badge" style={{ background: "var(--coral)", color: "var(--navy)", fontSize: "10px", padding: "1px 6px" }}>
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
          borderTop: "3px solid var(--navy)",
          background: "var(--cream)",
          color: "var(--navy)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--navy)", textTransform: "uppercase", fontWeight: 700 }}>
            Honeypot Hits
          </span>
          <Flame size={16} color="var(--navy)" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "var(--navy)" }}>
          {honeypotHits}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--navy-alpha-75)" }}>Decoy traps engaged</span>
          <span className="badge" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)", fontSize: "10px", padding: "1px 6px" }}>
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
          borderTop: "3px solid var(--navy)",
          background: "var(--cream)",
          color: "var(--navy)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--navy)", textTransform: "uppercase", fontWeight: 700 }}>
            Abuse Blocks
          </span>
          <Ban size={16} color="var(--navy)" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "var(--navy)" }}>
          {blockedRequests}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--navy-alpha-75)" }}>HTTP 429 throttles</span>
          <span className="badge" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)", fontSize: "10px", padding: "1px 6px" }}>
            ACTIVE
          </span>
        </div>
      </div>

      {/* Correlated Incidents */}
      <div
        className="soc-card"
        style={{
          padding: "14px 16px",
          borderTop: "3px solid var(--navy)",
          background: "var(--cream)",
          color: "var(--navy)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--navy)", textTransform: "uppercase", fontWeight: 700 }}>
            Correlated Incidents
          </span>
          <Network size={16} color="var(--navy)" />
        </div>
        <div className="font-mono" style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px", color: "var(--navy)" }}>
          {incidentCount}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--navy-alpha-75)" }}>Multi-stage campaigns</span>
          <span className="badge" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)", fontSize: "10px", padding: "1px 6px" }}>
            KILL-CHAIN
          </span>
        </div>
      </div>
    </div>
  );
};
