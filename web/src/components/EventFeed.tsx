import React, { useState } from "react";
import { Activity, Filter, Eye } from "lucide-react";
import type { SecurityEvent } from "../types";


interface EventFeedProps {
  events: SecurityEvent[];
  onSelectEvent: (event: SecurityEvent) => void;
  selectedEventId?: string;
  globalLanguage: "en" | "bn";
}

export const EventFeed: React.FC<EventFeedProps> = ({
  events,
  onSelectEvent,
  selectedEventId,
  globalLanguage
}) => {
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredEvents = events.filter((e) => {
    if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="soc-card">
      <div className="soc-card-header">
        <div className="soc-title">
          <Activity size={16} color="#38bdf8" />
          <span>LIVE DEFENSIVE TELEMETRY FEED (লাইভ ইভেন্ট ফিড)</span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>({filteredEvents.length} events)</span>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Filter size={13} color="#64748b" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              background: "#080c14",
              border: "1px solid #1e293b",
              color: "#cbd5e1",
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "4px",
              outline: "none"
            }}
          >
            <option value="all">All Sensors</option>
            <option value="honeypot">Honeypot Decoy</option>
            <option value="ratelimiter">Abuse Guard</option>
            <option value="scanner">Asset Scanner</option>
            <option value="analyst">AI Analyst</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: "#080c14",
              border: "1px solid #1e293b",
              color: "#cbd5e1",
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "4px",
              outline: "none"
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table container */}
      <div style={{ overflowX: "auto", maxHeight: "420px", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b", color: "#64748b", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.05em" }}>
              <th style={{ padding: "8px 10px" }}>Timestamp (UTC)</th>
              <th style={{ padding: "8px 10px" }}>Source</th>
              <th style={{ padding: "8px 10px" }}>Severity</th>
              <th style={{ padding: "8px 10px" }}>Event Type</th>
              <th style={{ padding: "8px 10px" }}>Source IP / Details</th>
              <th style={{ padding: "8px 10px" }}>AI Analyst Triage</th>
              <th style={{ padding: "8px 10px", textAlign: "right" }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  No security events matching filters. Trigger simulated demo traffic to stream live events.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => {
                const isSelected = ev.id === selectedEventId;
                const ip = ev.details?.source_ip || ev.details?.target_host || "127.0.0.1";
                const narrative =
                  globalLanguage === "bn"
                    ? ev.analyst?.narrative_bn || ev.analyst?.narrative_en
                    : ev.analyst?.narrative_en;

                return (
                  <tr
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    style={{
                      borderBottom: "1px solid #131a29",
                      background: isSelected ? "#172338" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#0e1522";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Timestamp */}
                    <td style={{ padding: "8px 10px", color: "#94a3b8", whiteSpace: "nowrap" }} className="font-mono">
                      {ev.ts ? ev.ts.slice(11, 19) : "--:--:--"}
                    </td>

                    {/* Source */}
                    <td style={{ padding: "8px 10px" }}>
                      <span className={`badge source-${ev.source}`}>
                        {ev.source}
                      </span>
                    </td>

                    {/* Severity */}
                    <td style={{ padding: "8px 10px" }}>
                      <span className={`badge badge-${ev.severity}`}>
                        {ev.severity}
                      </span>
                    </td>

                    {/* Type */}
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#f8fafc" }} className="font-mono">
                      {ev.type}
                    </td>

                    {/* Details / IP */}
                    <td style={{ padding: "8px 10px", color: "#cbd5e1" }} className="font-mono">
                      {ip}
                    </td>

                    {/* AI Analyst Triage Preview */}
                    <td style={{ padding: "8px 10px", maxWidth: "280px" }}>
                      {narrative ? (
                        <div style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "11px",
                          color: "#38bdf8"
                        }}>
                          {ev.analyst?.citations?.[0] && (
                            <span style={{ marginRight: "4px", fontWeight: 700 }}>
                              [{ev.analyst.citations[0]}]
                            </span>
                          )}
                          {narrative}
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#475569", fontStyle: "italic" }}>
                          Awaiting analyst...
                        </span>
                      )}
                    </td>

                    {/* Inspect button */}
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                      <button
                        style={{
                          background: isSelected ? "#2563eb" : "#1e293b",
                          border: "none",
                          color: "#fff",
                          borderRadius: "4px",
                          padding: "3px 6px",
                          cursor: "pointer"
                        }}
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
