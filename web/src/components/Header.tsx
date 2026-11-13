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
  Cpu,
  RotateCcw
} from "lucide-react";

interface HeaderProps {
  wsConnected: boolean;
  globalLanguage: "en" | "bn";
  setGlobalLanguage: (lang: "en" | "bn") => void;
  onTriggerDemo: () => Promise<void> | void;
  onResetDemo?: () => void;
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
  onResetDemo,
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
        padding: "14px 22px",
        background: "var(--navy)",
        border: "1px solid var(--cream-alpha-20)",
        borderRadius: "12px",
        marginBottom: "18px",
        boxShadow: "var(--shadow-md)",
        gap: "14px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 50
      }}
      role="banner"
    >
      {/* 1. Brand Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            background: "var(--navy)",
            border: "1.5px solid var(--cream-alpha-30)",
            boxShadow: "var(--shadow-sm)",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cream)"
          }}
          aria-hidden="true"
        >
          <ShieldAlert size={26} color="var(--cream)" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "0.04em", color: "var(--cream)" }}>
              PROHORI AI
            </span>
            <span style={{ fontSize: "16px", color: "var(--cream-alpha-85)", fontWeight: 700 }}>
              (প্রহরী)
            </span>
            {/* Live Status Badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 700,
                color: wsConnected ? "var(--cream)" : "var(--navy)",
                padding: "3px 10px",
                borderRadius: "999px",
                background: wsConnected ? "var(--cream-alpha-15)" : "var(--coral)",
                border: `1px solid ${wsConnected ? "var(--cream-alpha-30)" : "var(--coral)"}`
              }}
              title={wsConnected ? "Real-time WebSocket connected" : "WebSocket disconnected"}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: wsConnected ? "var(--cream)" : "var(--navy)"
                }}
              />
              {wsConnected ? (isBn ? "সক্রিয়" : "Live") : (isBn ? "সংযোগ বিচ্ছিন্ন" : "Offline")}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--cream-alpha-75)", margin: "2px 0 0 0" }}>
            {isBn ? "স্বায়ত্তশাসিত এআই ডিফেন্সিভ এসওসি" : "Autonomous AI Defensive SOC"}
          </p>
        </div>
      </div>

      {/* 2. Center: Honest AI Engine Badge (Cream on Navy) */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          className="font-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            background: "var(--cream-alpha-10)",
            color: "var(--cream)",
            border: "1px solid var(--cream-alpha-25)"
          }}
          title={isOffline ? "Grounded in local STIX 2.1 threat database with zero external network egress" : "Powered by generative neural LLM"}
        >
          <Cpu size={15} color="var(--cream)" />
          <span>
            {isOffline
              ? (isBn ? "ইঞ্জিন: অফলাইন আরএজি (Deterministic RAG)" : "Engine: Offline RAG")
              : `LLM: ${activeProvider}`}
          </span>
        </span>
      </div>

      {/* 3. Right: Primary Action (Coral CTA), Language Switch, and More Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Single "Run demo" Primary Button — Coral Attention Magnet (10%) */}
        <button
          onClick={handleRunDemoClick}
          disabled={isRunningDemo}
          className="btn btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            fontSize: "15px",
            fontWeight: 800,
            background: "var(--coral)",
            color: "var(--navy)",
            border: "1.5px solid var(--coral)",
            borderRadius: "8px",
            cursor: isRunningDemo ? "not-allowed" : "pointer",
            boxShadow: "var(--shadow-md)",
            minHeight: "44px"
          }}
          aria-label={isBn ? "আক্রমণ ডেমো চালান" : "Run attack detection demo"}
        >
          <Play size={16} fill="var(--navy)" color="var(--navy)" />
          <span>{isRunningDemo ? (isBn ? "ডেমো চলছে..." : "Running Demo...") : (isBn ? "ডেমো চালান" : "Run demo")}</span>
        </button>

        {/* Language Switch */}
        <button
          onClick={() => setGlobalLanguage(isBn ? "en" : "bn")}
          className="btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 14px",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--cream)",
            background: "var(--navy)",
            border: "1px solid var(--cream-alpha-30)",
            borderRadius: "8px",
            cursor: "pointer",
            minHeight: "44px"
          }}
          aria-label={isBn ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
          title={isBn ? "Switch to English" : "বাংলা ভাষায় দেখুন"}
        >
          <Languages size={16} color="var(--cream)" />
          <span>{isBn ? "English" : "বাংলা"}</span>
        </button>

        {/* "More" Menu Dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "10px 12px",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--cream)",
              background: "var(--navy)",
              border: `1px solid ${isMoreOpen ? "var(--coral)" : "var(--cream-alpha-30)"}`,
              borderRadius: "8px",
              cursor: "pointer",
              minHeight: "44px"
            }}
            aria-expanded={isMoreOpen}
            aria-haspopup="true"
            aria-label={isBn ? "অন্যান্য অপশন ও সেটিংস" : "More options and tools"}
          >
            <span>{isBn ? "অন্যান্য" : "More"}</span>
            <MoreVertical size={16} color="var(--cream)" />
          </button>

          {isMoreOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "260px",
                background: "var(--navy)",
                border: "1.5px solid var(--cream-alpha-30)",
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
                role="menuitem"
              >
                <Database size={16} color="var(--cream)" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "অডিট ট্রেইল" : "Audit Trail"}</span>
                  <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
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
                role="menuitem"
              >
                <Presentation size={16} color="var(--cream)" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "পিচ ডেক" : "Pitch Deck"}</span>
                  <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
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
                role="menuitem"
              >
                {isLocalSovereignty ? <Lock size={16} color="var(--cream)" /> : <Cloud size={16} color="var(--coral)" />}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, color: "var(--cream)" }}>
                    {isLocalSovereignty
                      ? (isBn ? "সার্বভৌমত্ব: অন-প্রিম" : "Sovereignty: On-Prem")
                      : (isBn ? "মোড: ক্লাউড হাইব্রিড" : "Mode: Cloud Hybrid")}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
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
                style={{ textDecoration: "none" }}
                role="menuitem"
              >
                <BookOpen size={16} color="var(--cream)" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "এপিআই ডকুমেন্টস" : "API Documentation"}</span>
                  <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
                    FastAPI Swagger UI
                  </span>
                </div>
              </a>

              {/* Reset Demo State (Clean Slate) */}
              {onResetDemo && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onResetDemo();
                  }}
                  className="dropdown-item"
                  role="menuitem"
                >
                  <RotateCcw size={16} color="var(--coral)" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700, color: "var(--coral)" }}>
                      {isBn ? "ডেমো রিসেট করুন" : "Reset Demo (Clean Slate)"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
                      {isBn ? "নতুন সেশনের জন্য তালিকা পরিষ্কার" : "Clear alerts for clean run"}
                    </span>
                  </div>
                </button>
              )}

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenShortcuts();
                }}
                className="dropdown-item"
                role="menuitem"
              >
                <Keyboard size={16} color="var(--cream)" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "কিবোর্ড শর্টকাট" : "Shortcuts (?)"}</span>
                  <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
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
