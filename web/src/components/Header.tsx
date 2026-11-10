import React, { useState, useRef, useEffect } from "react";
import {
  ShieldAlert,
  Play,
  Languages,
  MoreVertical,
  Database,
  Presentation,
  Lock,
  Cloud,
  BookOpen,
  Keyboard,
  Cpu
} from "lucide-react";

interface HeaderProps {
  wsConnected: boolean;
  globalLanguage: "en" | "bn";
  setGlobalLanguage: (lang: "en" | "bn") => void;
  onTriggerDemo: () => Promise<void> | void;
  onOpenAudit: () => void;
  onOpenPitchDeck: () => void;
  isLocalSovereignty: boolean;
  onToggleSovereignty: () => void;
  onOpenShortcuts: () => void;
  activeProvider?: string;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  globalLanguage,
  setGlobalLanguage,
  onTriggerDemo,
  onOpenAudit,
  onOpenPitchDeck,
  isLocalSovereignty,
  onToggleSovereignty,
  onOpenShortcuts,
  activeProvider = "deterministic-offline-rag"
}) => {
  const [isRunningDemo, setIsRunningDemo] = useState<boolean>(false);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreOpen]);

  const handleRunDemoClick = async () => {
    setIsRunningDemo(true);
    try {
      await onTriggerDemo();
    } finally {
      setTimeout(() => setIsRunningDemo(false), 900);
    }
  };

  const isBn = globalLanguage === "bn";
  const isOffline = !activeProvider || activeProvider.toLowerCase().includes("deterministic") || activeProvider.toLowerCase().includes("offline");

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        marginBottom: "16px",
        boxShadow: "var(--shadow-md)",
        gap: "12px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 50
      }}
      role="banner"
    >
      {/* 1. Brand Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #101c30 0%, #070c16 100%)",
            border: "1px solid #38bdf8",
            boxShadow: "0 0 16px rgba(56, 189, 248, 0.25)",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#38bdf8"
          }}
          aria-hidden="true"
        >
          <ShieldAlert size={24} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "0.03em", color: "#f8fafc" }}>
              PROHORI AI
            </span>
            <span style={{ fontSize: "16px", color: "var(--text-secondary)", fontWeight: 600 }}>
              (প্রহরী)
            </span>
            {/* Live Status Dot */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 600,
                color: wsConnected ? "#34d399" : "#f87171",
                padding: "2px 8px",
                borderRadius: "999px",
                background: wsConnected ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                border: `1px solid ${wsConnected ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"}`
              }}
              title={wsConnected ? "Real-time WebSocket connected" : "WebSocket disconnected"}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: wsConnected ? "#10b981" : "#ef4444"
                }}
              />
              {wsConnected ? (isBn ? "সক্রিয়" : "Live") : (isBn ? "সংযোগ বিচ্ছিন্ন" : "Offline")}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
            {isBn ? "স্বায়ত্তশাসিত এআই ডিফেন্সিভ এসওসি" : "Autonomous AI Defensive SOC"}
          </p>
        </div>
      </div>

      {/* 2. Center: Honest AI Engine Badge */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          className="font-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            background: isOffline ? "rgba(100, 116, 139, 0.15)" : "rgba(192, 132, 252, 0.15)",
            color: isOffline ? "#cbd5e1" : "#e9d5ff",
            border: isOffline ? "1px solid rgba(148, 163, 184, 0.3)" : "1px solid rgba(192, 132, 252, 0.35)"
          }}
          title={isOffline ? "Grounded in local STIX 2.1 threat database with zero external network egress" : "Powered by generative neural LLM"}
        >
          <Cpu size={14} />
          <span>
            {isOffline
              ? (isBn ? "ইঞ্জিন: অফলাইন আরএজি (Deterministic RAG)" : "Engine: Offline RAG")
              : `LLM: ${activeProvider}`}
          </span>
        </span>
      </div>

      {/* 3. Right: Primary Action, Language Switch, and More Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Single "Run demo" Primary Button */}
        <button
          onClick={handleRunDemoClick}
          disabled={isRunningDemo}
          className="btn btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            fontSize: "15px",
            fontWeight: 700,
            background: "#0284c7",
            color: "#ffffff",
            border: "1px solid #38bdf8",
            borderRadius: "8px",
            cursor: isRunningDemo ? "not-allowed" : "pointer",
            boxShadow: "0 0 14px rgba(56, 189, 248, 0.3)",
            transition: "all 0.15s ease",
            minHeight: "44px"
          }}
          aria-label={isBn ? "আক্রমণ ডেমো চালান" : "Run attack detection demo"}
        >
          <Play size={16} fill="currentColor" />
          <span>{isRunningDemo ? (isBn ? "ডেমো চলছে..." : "Running Demo...") : (isBn ? "ডেমো চালান" : "Run demo")}</span>
        </button>

        {/* Language Switch */}
        <button
          onClick={() => setGlobalLanguage(isBn ? "en" : "bn")}
          className="btn btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#f8fafc",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-medium)",
            borderRadius: "8px",
            cursor: "pointer",
            minHeight: "44px"
          }}
          aria-label={isBn ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
          title={isBn ? "Switch to English" : "বাংলা ভাষায় দেখুন"}
        >
          <Languages size={16} color="#38bdf8" />
          <span>{isBn ? "English" : "বাংলা"}</span>
        </button>

        {/* "More" Menu Dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="btn btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "8px 12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#cbd5e1",
              background: "var(--bg-elevated)",
              border: `1px solid ${isMoreOpen ? "#38bdf8" : "var(--border-medium)"}`,
              borderRadius: "8px",
              cursor: "pointer",
              minHeight: "44px"
            }}
            aria-expanded={isMoreOpen}
            aria-haspopup="true"
            aria-label={isBn ? "অন্যান্য অপশন ও সেটিংস" : "More options and tools"}
          >
            <span>{isBn ? "অন্যান্য" : "More"}</span>
            <MoreVertical size={16} />
          </button>

          {isMoreOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "250px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-active)",
                borderRadius: "10px",
                boxShadow: "var(--shadow-lg)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                zIndex: 100
              }}
              role="menu"
            >
              {/* Audit Log */}
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenAudit();
                }}
                className="dropdown-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#f8fafc",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  minHeight: "44px"
                }}
                role="menuitem"
              >
                <Database size={16} color="#34d399" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>{isBn ? "অডিট ট্রেইল" : "Audit Trail"}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    {isBn ? "দায়িত্বশীল এআই রেকর্ড" : "Append-only defense log"}
                  </span>
                </div>
              </button>

              {/* Pitch Deck */}
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenPitchDeck();
                }}
                className="dropdown-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#f8fafc",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  minHeight: "44px"
                }}
                role="menuitem"
              >
                <Presentation size={16} color="#38bdf8" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>{isBn ? "পিচ ডেক" : "Pitch Deck"}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    {isBn ? "৮-স্লাইড উপস্থাপনা" : "8-slide presentation"}
                  </span>
                </div>
              </button>

              {/* Data Sovereignty Toggle */}
              <button
                onClick={() => {
                  onToggleSovereignty();
                }}
                className="dropdown-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#f8fafc",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  minHeight: "44px"
                }}
                role="menuitem"
              >
                {isLocalSovereignty ? <Lock size={16} color="#6ee7b7" /> : <Cloud size={16} color="#38bdf8" />}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>
                    {isLocalSovereignty
                      ? (isBn ? "সার্বভৌমত্ব: অন-প্রিম" : "Sovereignty: On-Prem")
                      : (isBn ? "মোড: ক্লাউড হাইব্রিড" : "Mode: Cloud Hybrid")}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    {isLocalSovereignty
                      ? (isBn ? "স্থানীয় ডেটা সুরক্ষা কার্যকর" : "Zero packet egress")
                      : (isBn ? "ক্লাউড এআই সক্ষম" : "Cloud AI enabled")}
                  </span>
                </div>
              </button>

              {/* API Docs Link */}
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMoreOpen(false)}
                className="dropdown-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#f8fafc",
                  textDecoration: "none",
                  borderRadius: "6px",
                  minHeight: "44px"
                }}
                role="menuitem"
              >
                <BookOpen size={16} color="#fbbf24" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>{isBn ? "এপিআই ডকুমেন্টস" : "API Documentation"}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    FastAPI Swagger UI
                  </span>
                </div>
              </a>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenShortcuts();
                }}
                className="dropdown-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#f8fafc",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  minHeight: "44px"
                }}
                role="menuitem"
              >
                <Keyboard size={16} color="#94a3b8" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>{isBn ? "কিবোর্ড শর্টকাট" : "Shortcuts (?)"}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    Shift+D, Shift+A, Shift+P
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
