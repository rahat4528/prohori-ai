import React, { useState, useMemo } from "react";
import { Activity, Eye, Search, X, ShieldAlert } from "lucide-react";
import type { SecurityEvent } from "../types";

interface EventFeedProps {
  events: SecurityEvent[];
  onSelectEvent: (event: SecurityEvent) => void;
  selectedEventId?: string;
  globalLanguage: "en" | "bn";
  sourceFilter?: string;
  setSourceFilter?: (src: string) => void;
  severityFilter?: string;
  setSeverityFilter?: (sev: string) => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({
  events,
  onSelectEvent,
  selectedEventId,
  globalLanguage,
  sourceFilter: externalSourceFilter,
  setSourceFilter: setExternalSourceFilter,
  severityFilter: externalSeverityFilter,
  setSeverityFilter: setExternalSeverityFilter
}) => {
  const [internalSourceFilter, setInternalSourceFilter] = useState<string>("all");
  const [internalSeverityFilter, setInternalSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sourceFilter = externalSourceFilter !== undefined ? externalSourceFilter : internalSourceFilter;
  const setSourceFilter = setExternalSourceFilter || setInternalSourceFilter;

  const severityFilter = externalSeverityFilter !== undefined ? externalSeverityFilter : internalSeverityFilter;
  const setSeverityFilter = setExternalSeverityFilter || setInternalSeverityFilter;

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
      if (severityFilter !== "all" && e.severity !== severityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const typeMatch = (e.type || "").toLowerCase().includes(q);
        const sourceMatch = (e.source || "").toLowerCase().includes(q);
        const ipMatch = (e.details?.source_ip || e.details?.target_host || "").toLowerCase().includes(q);
        const userMatch = (e.details?.username_tried || e.details?.username || "").toLowerCase().includes(q);
        const pathMatch = (e.details?.path || e.details?.target_path || "").toLowerCase().includes(q);
        const cveMatch = (e.details?.cve_id || "").toLowerCase().includes(q);
        const mitreMatch = (e.analyst?.mitre_technique || "").toLowerCase().includes(q);

        return typeMatch || sourceMatch || ipMatch || userMatch || pathMatch || cveMatch || mitreMatch;
      }
      return true;
    });
  }, [events, sourceFilter, severityFilter, searchQuery]);

  const hasActiveFilters = sourceFilter !== "all" || severityFilter !== "all" || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSourceFilter("all");
    setSeverityFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="soc-card" style={{ display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div className="soc-card-header">
        <div className="soc-title">
          <Activity size={16} color="#38bdf8" />
          <span>LIVE DEFENSIVE TELEMETRY FEED (লাইভ ইভেন্ট ফিড)</span>
          <span className="badge" style={{ background: "rgba(56, 189, 248, 0.12)", color: "#7dd3fc" }}>
            {filteredEvents.length} / {events.length}
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Quick Search */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={13} style={{ position: "absolute", left: "10px", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IP, type, CVE..."
              className="input-control"
              style={{
                paddingLeft: "28px",
                paddingRight: searchQuery ? "26px" : "10px",
                width: "180px",
                height: "30px",
                fontSize: "11px"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "6px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer"
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Source Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="select-control"
              style={{ height: "30px" }}
            >
              <option value="all">All Sensors</option>
              <option value="honeypot">Honeypot Decoy</option>
              <option value="ratelimiter">Abuse Guard</option>
              <option value="scanner">Asset Discovery</option>
              <option value="analyst">AI Analyst</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="select-control"
              style={{ height: "30px" }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-ghost"
              style={{ height: "30px", padding: "0 8px", fontSize: "11px", color: "#f87171" }}
              title="Reset all search & filters"
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Events Table Container with Sticky Header */}
      <div style={{ overflowX: "auto", maxHeight: "450px", overflowY: "auto", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-medium)" }}>
            <tr style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.06em" }}>
              <th style={{ padding: "10px 12px" }}>Timestamp</th>
              <th style={{ padding: "10px 12px" }}>Source</th>
              <th style={{ padding: "10px 12px" }}>Severity</th>
              <th style={{ padding: "10px 12px" }}>Event Type</th>
              <th style={{ padding: "10px 12px" }}>Target / IP</th>
              <th style={{ padding: "10px 12px" }}>AI Triage & Context</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-tertiary)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <ShieldAlert size={24} color="#64748b" />
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      No telemetry events match your criteria
                    </span>
                    <span style={{ fontSize: "11px" }}>
                      Adjust your filters or click "Simulate Attack" in the header to inject traffic.
                    </span>
                  </div>
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
                      borderBottom: "1px solid #111a28",
                      background: isSelected ? "rgba(56, 189, 248, 0.12)" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "var(--bg-surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Timestamp */}
                    <td style={{ padding: "9px 12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }} className="font-mono">
                      {ev.ts ? ev.ts.slice(11, 19) : "--:--:--"}
                    </td>

                    {/* Sensor Source */}
                    <td style={{ padding: "9px 12px" }}>
                      <span className={`badge source-${ev.source}`}>
                        {ev.source}
                      </span>
                    </td>

                    {/* Severity */}
                    <td style={{ padding: "9px 12px" }}>
                      <span className={`badge badge-${ev.severity}`}>
                        {ev.severity}
                      </span>
                    </td>

                    {/* Event Type */}
                    <td style={{ padding: "9px 12px", fontWeight: 600, color: "var(--text-primary)" }} className="font-mono">
                      {ev.type}
                    </td>

                    {/* Source IP / Details */}
                    <td style={{ padding: "9px 12px", color: "#93c5fd" }} className="font-mono">
                      {ip}
                    </td>

                    {/* AI Analyst Triage Preview */}
                    <td style={{ padding: "9px 12px", maxWidth: "290px" }}>
                      {narrative ? (
                        <div style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "11px",
                          color: "#7dd3fc"
                        }}>
                          {ev.analyst?.citations?.[0] && (
                            <span style={{ marginRight: "4px", fontWeight: 700, color: "#38bdf8" }} className="font-mono">
                              [{ev.analyst.citations[0]}]
                            </span>
                          )}
                          {narrative}
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Awaiting analyst triage...
                        </span>
                      )}
                    </td>

                    {/* Inspect Icon Action */}
                    <td style={{ padding: "9px 12px", textAlign: "right" }}>
                      <button
                        style={{
                          background: isSelected ? "#2563eb" : "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          color: "#ffffff",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center"
                        }}
                        title="Inspect full event telemetry"
                      >
                        <Eye size={13} />
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
