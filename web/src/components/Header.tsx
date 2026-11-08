import React from "react";
import { ShieldAlert, Radio, Database, Terminal } from "lucide-react";


interface HeaderProps {
  wsConnected: boolean;
  eventCount: number;
  globalLanguage: "en" | "bn";
  setGlobalLanguage: (lang: "en" | "bn") => void;
  onTriggerDemo: () => void;
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  globalLanguage,
  setGlobalLanguage,
  onTriggerDemo,
  onOpenAudit
}) => {

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 20px",
      background: "#0a0f18",
      border: "1px solid #1e293b",
      borderRadius: "8px",
      marginBottom: "16px"
    }}>
      {/* Title & Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          border: "1px solid #3b82f6",
          padding: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#38bdf8"
        }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.06em", color: "#f8fafc" }}>
              PROHORI AI
            </h1>
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
              (প্রহরী এআই এসওসি)
            </span>
            <span className="badge" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.4)" }}>
              v0.1.0-DEFENSE
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "#64748b" }}>
            AI-Native Security Operations Center &bull; InfraSphere AI &rarr; SecureAI
          </p>
        </div>
      </div>

      {/* Operational Indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Data Sovereignty indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "6px",
          fontSize: "11px",
          color: "#6ee7b7",
          fontFamily: "monospace"
        }}>
          <Database size={13} />
          <span>DATA SOVEREIGNTY: ON-PREM</span>
        </div>

        {/* WebSocket Stream Indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          background: wsConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          border: `1px solid ${wsConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
          borderRadius: "6px",
          fontSize: "11px",
          color: wsConnected ? "#34d399" : "#f87171",
          fontFamily: "monospace"
        }}>
          <Radio size={13} className={wsConnected ? "pulse-active" : ""} />
          <span>{wsConnected ? "STREAM LIVE" : "OFFLINE"}</span>
        </div>

        {/* Trigger Demo Traffic Button */}
        <button
          onClick={onTriggerDemo}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
          title="Send test attack telemetry from local sensors"
        >
          <Terminal size={13} color="#38bdf8" />
          <span>Simulate Attack</span>
        </button>

        {/* Audit Log Button */}
        <button
          onClick={onOpenAudit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#1e293b",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
          title="View immutable responsible AI audit trail"
        >
          <Database size={13} />
          <span>Audit Log</span>
        </button>


        {/* Language Toggle (EN / বাংলা) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "#131b2a",
          border: "1px solid #1e293b",
          borderRadius: "6px",
          overflow: "hidden"
        }}>
          <button
            onClick={() => setGlobalLanguage("en")}
            style={{
              background: globalLanguage === "en" ? "#2563eb" : "transparent",
              color: globalLanguage === "en" ? "#fff" : "#94a3b8",
              border: "none",
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            EN
          </button>
          <button
            onClick={() => setGlobalLanguage("bn")}
            style={{
              background: globalLanguage === "bn" ? "#2563eb" : "transparent",
              color: globalLanguage === "bn" ? "#fff" : "#94a3b8",
              border: "none",
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            বাংলা
          </button>
        </div>
      </div>
    </header>
  );
};
