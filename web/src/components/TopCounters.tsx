import React from "react";
import { AlertTriangle, ShieldCheck, Flame, Ban, Network } from "lucide-react";
import type { SecurityEvent } from "../types";


interface TopCountersProps {
  events: SecurityEvent[];
  incidentCount: number;
}

export const TopCounters: React.FC<TopCountersProps> = ({ events, incidentCount }) => {
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
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "12px",
      marginBottom: "16px"
    }}>
      {/* Total Events */}
      <div className="soc-card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Total Ingested Events
          </span>
          <ShieldCheck size={16} color="#38bdf8" />
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#f8fafc" }}>
          {events.length}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
          Live unified defensive bus
        </div>
      </div>

      {/* Critical / High Alerts */}
      <div className="soc-card" style={{ padding: "12px 16px", borderColor: criticalHighCount > 0 ? "rgba(239, 68, 68, 0.4)" : "var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#fca5a5", textTransform: "uppercase", fontWeight: 600 }}>
            Critical / High Alerts
          </span>
          <AlertTriangle size={16} color="#ef4444" />
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#ef4444" }}>
          {criticalHighCount}
        </div>
        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
          Requires immediate analyst review
        </div>
      </div>

      {/* Honeypot Decoy Hits */}
      <div className="soc-card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#d8b4fe", textTransform: "uppercase", fontWeight: 600 }}>
            Honeypot Decoy Hits
          </span>
          <Flame size={16} color="#c084fc" />
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#c084fc" }}>
          {honeypotHits}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
          Simulated credentials trapped
        </div>
      </div>

      {/* Rate Limiter Blocks */}
      <div className="soc-card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#93c5fd", textTransform: "uppercase", fontWeight: 600 }}>
            API Abuse Blocks
          </span>
          <Ban size={16} color="#60a5fa" />
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#60a5fa" }}>
          {blockedRequests}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
          Sliding-window HTTP 429 throttles
        </div>
      </div>

      {/* Correlated Incidents */}
      <div className="soc-card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#6ee7b7", textTransform: "uppercase", fontWeight: 600 }}>
            Attack Incidents
          </span>
          <Network size={16} color="#34d399" />
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#34d399" }}>
          {incidentCount}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
          Correlated multi-stage campaigns
        </div>
      </div>
    </div>
  );
};
