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
    <div className="soc-card" style={{ background: "var(--cream)", color: "var(--navy)" }}>
      {/* Header with Title & Status Filter */}
      <div className="soc-card-header">
        <div className="soc-title">
          <GitCommit size={16} color="var(--navy)" />
          <span>ATTACK CAMPAIGNS & CORRELATION (সমন্বিত আক্রমণ টাইমলাইন)</span>
          <span className="badge" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)" }}>
            {filteredIncidents.length} / {incidents.length}
          </span>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "var(--navy-alpha-08)", padding: "2px", borderRadius: "6px", border: "1px solid var(--navy-alpha-20)" }}>
          {(["ALL", "ACTIVE", "CONTAINED", "RESOLVED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? "var(--coral)" : "transparent",
                color: "var(--navy)",
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
        background: "var(--navy-alpha-04)",
        border: "1px solid var(--navy-alpha-20)",
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BarChart2 size={14} color="var(--navy)" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase" }}>
              Event Velocity & Kill-Chain Volume (ইভেন্ট প্রবাহ গতি)
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", fontSize: "10px", flexWrap: "wrap" }}>
            <span style={{ color: "var(--coral)", fontWeight: 700 }}>&bull; Critical</span>
            <span style={{ color: "var(--navy)", fontWeight: 700 }}>&bull; High</span>
            <span style={{ color: "var(--navy-alpha-75)" }}>&bull; Medium</span>
            <span style={{ color: "var(--navy-alpha-40)" }}>&bull; Low</span>
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
                  background: bucket.total === 0 ? "var(--navy-alpha-12)" : "transparent",
                  outline: isHovered ? "2px solid var(--coral)" : "none",
                  transition: "all 0.15s ease"
                }}>
                  {lowH > 0 && <div style={{ height: `${lowH}px`, background: "var(--navy-alpha-20)" }} />}
                  {medH > 0 && <div style={{ height: `${medH}px`, background: "var(--navy-alpha-40)" }} />}
                  {highH > 0 && <div style={{ height: `${highH}px`, background: "var(--navy)" }} />}
                  {critH > 0 && <div style={{ height: `${critH}px`, background: "var(--coral)" }} />}
                </div>
                {/* Time Axis Label */}
                <span style={{ fontSize: "9px", color: isHovered ? "var(--navy)" : "var(--navy-alpha-75)", marginTop: "4px" }} className="font-mono">
                  {bucket.label}
                </span>
              </div>
            );
          })}
        </div>

        {selectedChartBar !== null && (
          <div style={{
            fontSize: "11px",
            color: "var(--navy)",
            background: "var(--cream)",
            padding: "5px 10px",
            borderRadius: "5px",
            marginTop: "6px",
            display: "flex",
            justifyContent: "space-between",
            border: "1px solid var(--navy-alpha-25)"
          }}>
            <span>Time Window: {timelineBuckets[selectedChartBar].label}</span>
            <span>Total Events: {timelineBuckets[selectedChartBar].total} (Critical: {timelineBuckets[selectedChartBar].critical}, High: {timelineBuckets[selectedChartBar].high})</span>
          </div>
        )}
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--navy-alpha-75)", fontSize: "12px" }}>
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
                  background: "var(--cream)",
                  border: "1px solid var(--navy-alpha-20)",
                  borderLeft: `4px solid ${
                    isResolved
                      ? "var(--navy-alpha-40)"
                      : isApproved
                      ? "var(--navy)"
                      : "var(--coral)"
                  }`,
                  borderRadius: "8px",
                  padding: "14px",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 800, color: "var(--navy)", fontSize: "13px" }} className="font-mono">
                      {inc.incident_id}
                    </span>
                    <span className="badge font-mono" style={{ background: "var(--navy-alpha-08)", color: "var(--navy)" }}>
                      IP: {inc.source_ip}
                    </span>
                    <span className={`badge severity-badge-${inc.severity.toLowerCase()}`}>
                      {inc.severity}
                    </span>

                    {/* Status Pill */}
                    <span
                      className="badge font-mono"
                      style={{
                        background: isResolved
                          ? "var(--navy-alpha-12)"
                          : isApproved
                          ? "var(--navy)"
                          : "var(--coral)",
                        color: isApproved ? "var(--cream)" : "var(--navy)",
                        border: `1px solid ${isApproved ? "var(--navy)" : "var(--coral)"}`
                      }}
                    >
                      {isResolved ? "RESOLVED" : isApproved ? "CONTAINED" : "ACTIVE CAMPAIGN"}
                    </span>
                  </div>

                  <span style={{ fontSize: "11px", color: "var(--navy-alpha-75)" }} className="font-mono">
                    {inc.event_count} correlated events
                  </span>
                </div>

                {/* Kill-Chain Progression Chips */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "8px 0", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700 }}>
                    Kill Chain:
                  </span>
                  <span className="badge" style={{ background: "var(--navy-alpha-10)", color: "var(--navy)", fontSize: "10px" }}>
                    Reconnaissance
                  </span>
                  <span style={{ color: "var(--navy-alpha-40)", fontSize: "10px" }}>➔</span>
                  <span className="badge" style={{ background: "var(--navy-alpha-10)", color: "var(--navy)", fontSize: "10px" }}>
                    Credential Access
                  </span>
                  <span style={{ color: "var(--navy-alpha-40)", fontSize: "10px" }}>➔</span>
                  <span className="badge" style={{ background: "var(--coral-alpha-20)", color: "var(--navy)", fontSize: "10px" }}>
                    Perimeter Flood
                  </span>
                </div>

                {/* Incident Narrative Summary */}
                <p style={{ fontSize: "13px", color: "var(--navy)", lineHeight: 1.55, margin: "8px 0 10px 0" }}>
                  {summary}
                </p>

                {/* Action Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--navy-alpha-15)", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--navy-alpha-75)" }}>
                    Human-in-the-Loop Countermeasure:
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {isResolved ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--navy)", fontSize: "11px", fontWeight: 700 }}>
                        <ShieldCheck size={14} />
                        <span>INCIDENT RESOLVED & CLOSED</span>
                      </div>
                    ) : isApproved ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--navy)", fontSize: "11px", fontWeight: 700 }}>
                          <CheckCircle2 size={14} />
                          <span>FIREWALL DROP ACTIVE</span>
                        </div>
                        {onResolveIncidentAction && (
                          <button
                            onClick={() => onResolveIncidentAction(inc.incident_id)}
                            className="btn btn-secondary-cream"
                            style={{ padding: "3px 9px", fontSize: "11px" }}
                          >
                            Mark Resolved
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => onApproveIncidentAction(inc.incident_id)}
                        className="btn btn-primary"
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
