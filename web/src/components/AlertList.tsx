import React, { useState } from "react";
import type { SecurityEvent } from "../types";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter
} from "lucide-react";
import { getFriendlyEventTitle, getSeverityConfig } from "../utils/alertUtils";

interface AlertListProps {
  events: SecurityEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: SecurityEvent) => void;
  globalLanguage: "en" | "bn";
  onTriggerDemo: () => void;
}

export const AlertList: React.FC<AlertListProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  globalLanguage,
  onTriggerDemo
}) => {
  const isBn = globalLanguage === "bn";
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEvents = events.filter((ev) => {
    if (filterSeverity !== "all" && ev.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ip = (ev.details?.source_ip || ev.details?.attacker_ip || ev.details?.client_ip || "").toLowerCase();
      const type = ev.type.toLowerCase();
      const title = getFriendlyEventTitle(ev.type, globalLanguage).toLowerCase();
      const mitre = (ev.analyst?.mitre_technique || "").toLowerCase();
      if (!ip.includes(q) && !type.includes(q) && !title.includes(q) && !mitre.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--cream)",
        border: "1.5px solid var(--navy-alpha-20)",
        borderRadius: "12px",
        overflow: "hidden",
        height: "100%",
        boxShadow: "var(--shadow-md)"
      }}
      aria-label={isBn ? "সরাসরি সিকিউরিটি অ্যালার্ট তালিকা" : "Live Security Alerts Feed"}
    >
      {/* Alert List Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1.5px solid var(--navy-alpha-15)",
          background: "var(--cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert size={22} color="var(--navy)" />
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
            {isBn ? "সরাসরি সতর্কতা" : "Live Alerts"}
          </h2>
          <span
            className="font-mono"
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              background: "var(--navy-alpha-12)",
              color: "var(--navy)",
              fontSize: "13px",
              fontWeight: 800,
              border: "1px solid var(--navy-alpha-30)"
            }}
          >
            {filteredEvents.length}
          </span>
        </div>

        {/* Severity Filter Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="var(--navy-alpha-75)" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{
              background: "var(--cream)",
              color: "var(--navy)",
              border: "1.5px solid var(--navy-alpha-30)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              minHeight: "44px"
            }}
            aria-label={isBn ? "তীব্রতা অনুযায়ী ফিল্টার" : "Filter alerts by severity"}
          >
            <option value="all">{isBn ? "সকল তীব্রতা (All)" : "All Severities"}</option>
            <option value="critical">{isBn ? "জরুরি (Critical)" : "Critical"}</option>
            <option value="high">{isBn ? "উচ্চ (High)" : "High"}</option>
            <option value="medium">{isBn ? "মাঝারি (Medium)" : "Medium"}</option>
            <option value="low">{isBn ? "নিম্ন (Low)" : "Low"}</option>
          </select>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div style={{ padding: "12px 18px", borderBottom: "1.5px solid var(--navy-alpha-15)", background: "var(--cream)" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={16} color="var(--navy-alpha-75)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={isBn ? "আইপি, আক্রমণ বা কৌশল দিয়ে খুঁজুন..." : "Filter by IP, technique, attack name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              background: "var(--cream)",
              border: "1.5px solid var(--navy-alpha-25)",
              borderRadius: "8px",
              color: "var(--navy)",
              fontSize: "15px",
              fontWeight: 600,
              minHeight: "44px"
            }}
            aria-label={isBn ? "সতর্কতা খুঁজুন" : "Search alerts"}
          />
        </div>
      </div>

      {/* Alert Cards Container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxHeight: "calc(100vh - 230px)",
          background: "var(--cream)"
        }}
        role="feed"
        aria-busy={false}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "52px 24px",
              textAlign: "center",
              color: "var(--navy)",
              gap: "16px"
            }}
          >
            <ShieldCheck size={52} color="var(--navy)" />
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--navy)" }}>
              {isBn ? "কোনো হুমকি পাওয়া যায়নি" : "No Active Security Alerts"}
            </h3>
            <p style={{ fontSize: "16px", maxWidth: "360px", color: "var(--navy-alpha-75)", margin: 0, lineHeight: 1.5 }}>
              {isBn
                ? "সিস্টেম স্বাভাবিক রয়েছে। আক্রমণ শনাক্তকরণ ও এআই বিশ্লেষণ দেখতে 'ডেমো চালান' বোতামে ক্লিক করুন।"
                : "All systems running normally. Click 'Run demo' above to test real threat triage and AI reasoning."}
            </p>
            <button
              onClick={onTriggerDemo}
              className="btn btn-primary"
              style={{
                marginTop: "10px",
                padding: "10px 22px",
                fontSize: "15px",
                fontWeight: 800,
                background: "var(--coral)",
                color: "var(--navy)",
                border: "1.5px solid var(--coral)",
                borderRadius: "8px",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <ShieldAlert size={16} color="var(--navy)" />
              <span>{isBn ? "ডেমো চালান" : "Run Demo Now"}</span>
            </button>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isSelected = ev.id === selectedEventId;
            const sev = getSeverityConfig(ev.severity, globalLanguage);
            const SevIcon = sev.icon;
            const friendlyTitle = getFriendlyEventTitle(ev.type, globalLanguage);
            const sourceIp =
              ev.details?.source_ip || ev.details?.attacker_ip || ev.details?.client_ip || "Internal Sensor";
            const targetInfo = ev.details?.target_service || ev.details?.endpoint || ev.details?.path || "";
            const mitre = ev.analyst?.mitre_technique;
            const formattedTime = ev.ts ? new Date(ev.ts).toLocaleTimeString() : "";

            return (
              <article
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectEvent(ev);
                  }
                }}
                tabIndex={0}
                className={`alert-feed-item severity-${ev.severity} ${isSelected ? "selected" : ""}`}
                role="article"
                aria-selected={isSelected}
              >
                {/* Top Row: Severity Tag + Tabular Time */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span
                    className="font-mono font-tabular"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 800,
                      background: sev.bg,
                      color: sev.color,
                      border: `1.5px solid ${sev.border}`,
                      letterSpacing: "0.03em"
                    }}
                  >
                    <SevIcon size={13} color={sev.color} />
                    <span>{sev.label}</span>
                  </span>

                  <span className="font-mono font-tabular" style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontWeight: 700 }}>
                    {formattedTime}
                  </span>
                </div>

                {/* Main Title */}
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", margin: 0, lineHeight: 1.35 }}>
                  {friendlyTitle}
                </h3>

                {/* Attacker IP & Sensor Telemetry */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", fontSize: "13px" }}>
                  <span className="font-mono font-tabular" style={{ color: "var(--navy-alpha-85)", fontWeight: 700 }}>
                    {sourceIp} {targetInfo ? `· ${targetInfo}` : ""}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      className="font-mono"
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "var(--navy-alpha-08)",
                        color: "var(--navy-alpha-75)",
                        border: "1px solid var(--navy-alpha-20)"
                      }}
                    >
                      {ev.source.toUpperCase()}
                    </span>

                    {mitre && (
                      <span
                        className="font-mono font-tabular"
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 800,
                          background: "var(--navy)",
                          color: "var(--cream)",
                          border: "1px solid var(--navy)"
                        }}
                        title={`MITRE ATT&CK Technique: ${mitre}`}
                      >
                        [{mitre}]
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
