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
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
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
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert size={20} color="#38bdf8" />
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
            {isBn ? "সরাসরি সতর্কতা" : "Live Alerts"}
          </h2>
          <span
            className="font-mono"
            style={{
              padding: "2px 8px",
              borderRadius: "999px",
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              fontSize: "13px",
              fontWeight: 700,
              border: "1px solid rgba(56, 189, 248, 0.35)"
            }}
          >
            {filteredEvents.length}
          </span>
        </div>

        {/* Severity Filter Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={15} color="var(--text-tertiary)" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{
              background: "var(--bg-surface)",
              color: "#f8fafc",
              border: "1px solid var(--border-medium)",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              minHeight: "36px"
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
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={15} color="var(--text-tertiary)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={isBn ? "আইপি, আক্রমণ বা কৌশল দিয়ে খুঁজুন..." : "Filter by IP, technique, attack name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-medium)",
              borderRadius: "6px",
              color: "#f8fafc",
              fontSize: "14px"
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
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxHeight: "calc(100vh - 230px)"
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
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--text-secondary)",
              gap: "14px"
            }}
          >
            <ShieldCheck size={48} color="#10b981" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc" }}>
              {isBn ? "কোনো হুমকি পাওয়া যায়নি" : "No Active Security Alerts"}
            </h3>
            <p style={{ fontSize: "15px", maxWidth: "340px", color: "var(--text-secondary)", margin: 0 }}>
              {isBn
                ? "সিস্টেম স্বাভাবিক রয়েছে। আক্রমণ শনাক্তকরণ ও এআই বিশ্লেষণ দেখতে 'ডেমো চালান' বোতামে ক্লিক করুন।"
                : "All systems running normally. Click 'Run demo' above to test real threat triage and AI reasoning."}
            </p>
            <button
              onClick={onTriggerDemo}
              className="btn btn-secondary"
              style={{
                marginTop: "8px",
                padding: "8px 18px",
                fontSize: "14px",
                fontWeight: 600,
                borderColor: "#38bdf8",
                color: "#38bdf8",
                borderRadius: "6px",
                minHeight: "44px"
              }}
            >
              {isBn ? "⚡ ডেমো চালান" : "⚡ Run Demo Now"}
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
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                  border: isSelected ? "2px solid #38bdf8" : "1px solid var(--border-subtle)",
                  boxShadow: isSelected ? "0 0 16px rgba(56, 189, 248, 0.2)" : "var(--shadow-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  position: "relative"
                }}
                role="article"
                aria-selected={isSelected}
              >
                {/* Top Row: Severity Badge + Time */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 700,
                      background: sev.bg,
                      color: sev.color,
                      border: `1px solid ${sev.border}`
                    }}
                  >
                    <SevIcon size={13} />
                    <span>{sev.label}</span>
                  </span>

                  <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {formattedTime}
                  </span>
                </div>

                {/* Main Title (Plain Words) */}
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0, lineHeight: 1.35 }}>
                  {friendlyTitle}
                </h3>

                {/* Attacker & Grounding Chips */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", fontSize: "13px" }}>
                  <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
                    {sourceIp} {targetInfo ? `· ${targetInfo}` : ""}
                  </span>

                  {mitre && (
                    <span
                      className="font-mono"
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "rgba(56, 189, 248, 0.12)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.3)"
                      }}
                      title={`MITRE ATT&CK Technique: ${mitre}`}
                    >
                      [{mitre}]
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
