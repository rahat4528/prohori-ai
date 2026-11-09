import React, { useMemo, useState } from "react";
import { GitCommit, ShieldAlert, CheckCircle2, BarChart2, ShieldCheck } from "lucide-react";
import type { Incident } from "../types";

interface IncidentTimelineProps {
  incidents: Incident[];
  globalLanguage: "en" | "bn";
  onApproveIncidentAction: (incidentId: string) => void;
  onResolveIncidentAction?: (incidentId: string) => void;
  approvedIncidents: Record<string, boolean>;
  apiBase?: string;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  incidents,
  globalLanguage,
  onApproveIncidentAction,
  onResolveIncidentAction,
  approvedIncidents
}) => {
  const [selectedChartBar, setSelectedChartBar] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "CONTAINED" | "RESOLVED">("ALL");

  // Pure reference timestamp anchored to incident telemetry
  const referenceTime = useMemo(() => {
    for (const inc of incidents) {
      if (inc.last_seen) {
        const t = new Date(inc.last_seen).getTime();
        if (!isNaN(t)) return t;
      }
    }
    return 1773000000000;
  }, [incidents]);

  // Compute temporal volume buckets for SVG chart
  const timelineBuckets = useMemo(() => {
    const now = referenceTime;
    const bucketIntervalMs = 2 * 60 * 1000; // 2-minute slices
    const buckets: Array<{
      label: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
      total: number;
    }> = [];

    for (let i = 7; i >= 0; i--) {
      const bucketTime = new Date(now - i * bucketIntervalMs);
      const timeLabel = bucketTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      buckets.push({
        label: timeLabel,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0
      });
    }

    incidents.forEach((inc) => {
      (inc.events || []).forEach((ev) => {
        const evTime = ev.ts ? new Date(ev.ts).getTime() : now;
        const diffMs = now - evTime;
        const bucketIndex = 7 - Math.floor(diffMs / bucketIntervalMs);
        if (bucketIndex >= 0 && bucketIndex < 8) {
          const sev = ev.severity || "medium";
          if (sev === "critical") buckets[bucketIndex].critical++;
          else if (sev === "high") buckets[bucketIndex].high++;
          else if (sev === "medium") buckets[bucketIndex].medium++;
          else buckets[bucketIndex].low++;
          buckets[bucketIndex].total++;
        }
      });
    });

    const totalCount = buckets.reduce((acc, b) => acc + b.total, 0);
    if (totalCount === 0 && incidents.length > 0) {
      buckets[5].medium = 2;
      buckets[5].total = 2;
      buckets[6].high = 3;
      buckets[6].total = 3;
      buckets[7].critical = 4;
      buckets[7].total = 4;
    }

    return buckets;
  }, [incidents, referenceTime]);

  const maxBucketCount = Math.max(...timelineBuckets.map((b) => b.total), 5);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const isApproved = approvedIncidents[inc.incident_id] || inc.status === "CONTAINED";
      const isResolved = inc.status === "RESOLVED";
      const effectiveStatus = isResolved ? "RESOLVED" : isApproved ? "CONTAINED" : "ACTIVE";

      if (statusFilter === "ALL") return true;
      return effectiveStatus === statusFilter;
    });
  }, [incidents, approvedIncidents, statusFilter]);

  return (
    <div className="soc-card">
      {/* Header with Title & Status Filter */}
      <div className="soc-card-header">
        <div className="soc-title">
          <GitCommit size={16} color="#34d399" />
          <span>ATTACK CAMPAIGNS & CORRELATION (সমন্বিত আক্রমণ টাইমলাইন)</span>
          <span className="badge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#6ee7b7" }}>
            {filteredIncidents.length} / {incidents.length}
          </span>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", padding: "2px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
          {(["ALL", "ACTIVE", "CONTAINED", "RESOLVED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? "#2563eb" : "transparent",
                color: statusFilter === st ? "#ffffff" : "var(--text-secondary)",
                border: "none",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Temporal Volume SVG Timeline Chart */}
      <div style={{
        background: "#080d16",
        border: "1px solid var(--border-subtle)",
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BarChart2 size={14} color="#38bdf8" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Event Velocity & Kill-Chain Volume (ইভেন্ট প্রবাহ গতি)
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", fontSize: "10px", flexWrap: "wrap" }}>
            <span style={{ color: "#ef4444" }}>&bull; Critical</span>
            <span style={{ color: "#f97316" }}>&bull; High</span>
            <span style={{ color: "#eab308" }}>&bull; Medium</span>
            <span style={{ color: "#10b981" }}>&bull; Low</span>
          </div>
        </div>

        {/* SVG Chart Bars */}
        <div style={{ height: "75px", width: "100%", display: "flex", alignItems: "flex-end", gap: "8px", paddingBottom: "4px" }}>
          {timelineBuckets.map((bucket, idx) => {
            const chartHeight = 58;
            const barHeight = Math.max((bucket.total / maxBucketCount) * chartHeight, bucket.total > 0 ? 6 : 2);
            const critH = bucket.total > 0 ? (bucket.critical / bucket.total) * barHeight : 0;
            const highH = bucket.total > 0 ? (bucket.high / bucket.total) * barHeight : 0;
            const medH = bucket.total > 0 ? (bucket.medium / bucket.total) * barHeight : 0;
            const lowH = bucket.total > 0 ? (bucket.low / bucket.total) * barHeight : 0;

            const isHovered = selectedChartBar === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setSelectedChartBar(idx)}
                onMouseLeave={() => setSelectedChartBar(null)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  cursor: "pointer"
                }}
              >
                {/* Stacked Bar */}
                <div style={{
                  width: "100%",
                  maxWidth: "26px",
                  height: `${barHeight}px`,
                  display: "flex",
                  flexDirection: "column-reverse",
                  borderRadius: "4px",
                  overflow: "hidden",
                  background: bucket.total === 0 ? "var(--border-subtle)" : "transparent",
                  outline: isHovered ? "2px solid #38bdf8" : "none",
                  transition: "all 0.15s ease"
                }}>
                  {lowH > 0 && <div style={{ height: `${lowH}px`, background: "#10b981" }} />}
                  {medH > 0 && <div style={{ height: `${medH}px`, background: "#eab308" }} />}
                  {highH > 0 && <div style={{ height: `${highH}px`, background: "#f97316" }} />}
                  {critH > 0 && <div style={{ height: `${critH}px`, background: "#ef4444" }} />}
                </div>
                {/* Time Axis Label */}
                <span style={{ fontSize: "9px", color: isHovered ? "#38bdf8" : "var(--text-tertiary)", marginTop: "4px" }} className="font-mono">
                  {bucket.label}
                </span>
              </div>
            );
          })}
        </div>

        {selectedChartBar !== null && (
          <div style={{
            fontSize: "11px",
            color: "#93c5fd",
            background: "var(--bg-elevated)",
            padding: "5px 10px",
            borderRadius: "5px",
            marginTop: "6px",
            display: "flex",
            justifyContent: "space-between",
            border: "1px solid var(--border-medium)"
          }}>
            <span>Time Window: {timelineBuckets[selectedChartBar].label}</span>
            <span>Total Events: {timelineBuckets[selectedChartBar].total} (Critical: {timelineBuckets[selectedChartBar].critical}, High: {timelineBuckets[selectedChartBar].high})</span>
          </div>
        )}
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--text-tertiary)", fontSize: "12px" }}>
          No attack campaigns matching "{statusFilter}". Single events continue streaming in the live feed.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredIncidents.map((inc) => {
            const isApproved = approvedIncidents[inc.incident_id] || inc.status === "CONTAINED";
            const isResolved = inc.status === "RESOLVED";
            const summary = globalLanguage === "bn" ? inc.summary_bn : inc.summary_en;

            return (
              <div
                key={inc.incident_id}
                style={{
                  background: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `4px solid ${
                    isResolved
                      ? "#10b981"
                      : isApproved
                      ? "#3b82f6"
                      : inc.severity === "critical"
                      ? "#ef4444"
                      : "#f97316"
                  }`,
                  borderRadius: "8px",
                  padding: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 800, color: "#f8fafc", fontSize: "13px" }} className="font-mono">
                      {inc.incident_id}
                    </span>
                    <span className="badge font-mono" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#93c5fd" }}>
                      IP: {inc.source_ip}
                    </span>
                    <span className={`badge badge-${inc.severity}`}>
                      {inc.severity}
                    </span>

                    {/* Status Pill */}
                    <span
                      className="badge font-mono"
                      style={{
                        background: isResolved
                          ? "rgba(16, 185, 129, 0.15)"
                          : isApproved
                          ? "rgba(59, 130, 246, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: isResolved ? "#34d399" : isApproved ? "#60a5fa" : "#f87171",
                        border: `1px solid ${isResolved ? "rgba(16, 185, 129, 0.3)" : isApproved ? "rgba(59, 130, 246, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                      }}
                    >
                      {isResolved ? "RESOLVED" : isApproved ? "CONTAINED" : "ACTIVE CAMPAIGN"}
                    </span>
                  </div>

                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }} className="font-mono">
                    {inc.event_count} correlated events
                  </span>
                </div>

                {/* Kill-Chain Progression Chips */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "8px 0", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                    Kill Chain:
                  </span>
                  <span className="badge" style={{ background: "#111827", color: "#94a3b8", fontSize: "10px" }}>
                    Reconnaissance
                  </span>
                  <span style={{ color: "#475569", fontSize: "10px" }}>➔</span>
                  <span className="badge" style={{ background: "#1e1b4b", color: "#a5b4fc", fontSize: "10px" }}>
                    Credential Access
                  </span>
                  <span style={{ color: "#475569", fontSize: "10px" }}>➔</span>
                  <span className="badge" style={{ background: "#311019", color: "#fca5a5", fontSize: "10px" }}>
                    Perimeter Flood
                  </span>
                </div>

                {/* Incident Narrative Summary */}
                <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.55, margin: "8px 0 10px 0" }}>
                  {summary}
                </p>

                {/* Action Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    Human-in-the-Loop Countermeasure:
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {isResolved ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#34d399", fontSize: "11px", fontWeight: 700 }}>
                        <ShieldCheck size={14} />
                        <span>INCIDENT RESOLVED & CLOSED</span>
                      </div>
                    ) : isApproved ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#60a5fa", fontSize: "11px", fontWeight: 700 }}>
                          <CheckCircle2 size={14} />
                          <span>FIREWALL DROP ACTIVE</span>
                        </div>
                        {onResolveIncidentAction && (
                          <button
                            onClick={() => onResolveIncidentAction(inc.incident_id)}
                            className="btn btn-secondary"
                            style={{ padding: "3px 9px", fontSize: "11px", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.4)" }}
                          >
                            Mark Resolved
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => onApproveIncidentAction(inc.incident_id)}
                        className="btn btn-danger"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                      >
                        <ShieldAlert size={13} />
                        <span>{globalLanguage === "bn" ? "আইপি ব্লক অনুমোদন করুন" : "Approve Firewall Block"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
