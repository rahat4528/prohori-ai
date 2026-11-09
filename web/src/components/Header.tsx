import React, { useState, useEffect } from "react";
import { ShieldAlert, Radio, Database, Terminal, Presentation, Lock, Cloud, Clock } from "lucide-react";

interface HeaderProps {
  wsConnected: boolean;
  eventCount: number;
  globalLanguage: "en" | "bn";
  setGlobalLanguage: (lang: "en" | "bn") => void;
  onTriggerDemo: () => Promise<void> | void;
  onOpenAudit: () => void;
  onOpenPitchDeck: () => void;
  isLocalSovereignty: boolean;
  onToggleSovereignty: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  globalLanguage,
  setGlobalLanguage,
  onTriggerDemo,
  onOpenAudit,
  onOpenPitchDeck,
  isLocalSovereignty,
  onToggleSovereignty
}) => {
  const [clockTime, setClockTime] = useState<string>("");
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.toUTCString().slice(17, 25);
      const bst = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour12: false });
      setClockTime(`${bst} BST / ${utc} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateClick = async () => {
    setSimulating(true);
    try {
      await onTriggerDemo();
    } finally {
      setTimeout(() => setSimulating(false), 800);
    }
  };

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 20px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "10px",
      marginBottom: "16px",
      boxShadow: "var(--shadow-md)",
      gap: "16px",
      flexWrap: "wrap"
    }}>
      {/* Brand Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "260px" }}>
        <div style={{
          background: "linear-gradient(135deg, #101c30 0%, #070c16 100%)",
          border: "1px solid #38bdf8",
          boxShadow: "0 0 16px rgba(56, 189, 248, 0.2)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.04em", color: "#f8fafc", margin: 0 }}>
              PROHORI AI
            </h1>
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
              (প্রহরী এআই)
            </span>
            <span className="badge" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.35)" }}>
              v0.1.0-DEFENSE
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
            Autonomous AI-Native SOC &bull; Team Orionids &bull; SecureAI
          </p>
        </div>
      </div>

      {/* Clock & Telemetry Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {/* Live Operational Clock */}
        <div style={{
          display: "none",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "6px",
          fontSize: "11px",
          color: "#94a3b8"
        }}
        className="font-mono header-clock"
        >
          <Clock size={12} color="#38bdf8" />
          <span>{clockTime || "SYNCING..."}</span>
        </div>

        {/* Data Sovereignty Mode Toggle */}
        <button
          onClick={onToggleSovereignty}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            background: isLocalSovereignty ? "rgba(16, 185, 129, 0.12)" : "rgba(56, 189, 248, 0.12)",
            border: `1px solid ${isLocalSovereignty ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)"}`,
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            color: isLocalSovereignty ? "#6ee7b7" : "#7dd3fc",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
          className="font-mono"
          title="Toggle Data Sovereignty Mode: Local Ollama / Offline vs Cloud Hybrid"
        >
          {isLocalSovereignty ? <Lock size={12} /> : <Cloud size={12} />}
          <span>{isLocalSovereignty ? "SOVEREIGNTY: ON-PREM" : "MODE: CLOUD HYBRID"}</span>
        </button>

        {/* WebSocket Stream Indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 10px",
          background: wsConnected ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
          border: `1px solid ${wsConnected ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"}`,
          borderRadius: "6px",
          fontSize: "11px",
          color: wsConnected ? "#34d399" : "#f87171"
        }}
        className="font-mono"
        >
          <Radio size={12} className={wsConnected ? "pulse-active" : ""} />
          <span>{wsConnected ? "STREAM LIVE" : "DISCONNECTED"}</span>
        </div>
      </div>

      {/* Primary Actions & Language Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {/* Simulate Attack Button */}
        <button
          onClick={handleSimulateClick}
          disabled={simulating}
          className="btn btn-secondary"
          style={{ borderColor: "#38bdf8", color: "#38bdf8" }}
          title="Inject realistic attack telemetry from Honeypot & Abuse Guard"
        >
          <Terminal size={13} />
          <span>{simulating ? "Injecting..." : "Simulate Attack"}</span>
        </button>

        {/* Pitch Deck Presentation Modal Button */}
        <button
          onClick={onOpenPitchDeck}
          className="btn btn-secondary"
          style={{
            background: "linear-gradient(135deg, #16243b 0%, #0c1422 100%)",
            borderColor: "rgba(56, 189, 248, 0.4)",
            color: "#f8fafc"
          }}
          title="View 8-Slide Pitch Deck conforming to Congress Rubric"
        >
          <Presentation size={13} color="#38bdf8" />
          <span>Pitch Deck</span>
        </button>

        {/* Audit Log Drawer Button */}
        <button
          onClick={onOpenAudit}
          className="btn btn-secondary"
          style={{ borderColor: "rgba(16, 185, 129, 0.4)", color: "#34d399" }}
          title="Open Immutable Append-Only Responsible AI Audit Log"
        >
          <Database size={13} />
          <span>Audit Log</span>
        </button>

        {/* Language Switcher */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "6px",
          padding: "2px",
          marginLeft: "4px"
        }}>
          <button
            onClick={() => setGlobalLanguage("en")}
            style={{
              background: globalLanguage === "en" ? "#2563eb" : "transparent",
              color: globalLanguage === "en" ? "#ffffff" : "#94a3b8",
              border: "none",
              borderRadius: "4px",
              padding: "4px 9px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            EN
          </button>
          <button
            onClick={() => setGlobalLanguage("bn")}
            style={{
              background: globalLanguage === "bn" ? "#2563eb" : "transparent",
              color: globalLanguage === "bn" ? "#ffffff" : "#94a3b8",
              border: "none",
              borderRadius: "4px",
              padding: "4px 9px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            বাংলা
          </button>
        </div>
      </div>
    </header>
  );
};
