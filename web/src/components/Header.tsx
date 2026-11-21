import React, { useState, useRef, useEffect } from "react";
import { ProhoriLogo } from "./ProhoriLogo";
import {
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
  RotateCcw,
  Wifi,
  Menu,
  X
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
  apiBase?: string;
  connectedDevicesCount?: number;
  onOpenConnectedDevices?: () => void;
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
  activeProvider = "deterministic-offline-rag",
  apiBase = "http://localhost:8000",
  connectedDevicesCount = 1,
  onOpenConnectedDevices
}) => {
  const [isRunningDemo, setIsRunningDemo] = useState<boolean>(false);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  // Close dropdowns on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMoreOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        // Only close if not clicking the toggle button
        const isToggleBtn = (target as HTMLElement).closest(".mobile-header-menu-btn");
        if (!isToggleBtn) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      {/* 1. Official Prohori AI Brand Identity & Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <a
          href="/"
          style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center" }}
          aria-label="Prohori AI - Home"
        >
          <ProhoriLogo markSize={36} showSubtitle={true} isBn={isBn} variant="reverse" />
        </a>

        {/* Live Status Tactical Beacon */}
        <span
          className="font-mono font-tabular"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: 800,
            color: wsConnected ? "var(--cream)" : "var(--navy)",
            padding: "3px 8px",
            borderRadius: "4px",
            background: wsConnected ? "var(--cream-alpha-15)" : "var(--coral)",
            border: `1px solid ${wsConnected ? "var(--cream-alpha-30)" : "var(--coral)"}`,
            letterSpacing: "0.04em"
          }}
          title={wsConnected ? "Real-time WebSocket telemetry stream active" : "WebSocket stream reconnecting (offline resilient fallback active)"}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: wsConnected ? "var(--cream)" : "var(--navy)",
              display: "inline-block"
            }}
          />
          {wsConnected ? (isBn ? "টেলিমেট্রি লাইভ" : "STREAM LIVE") : (isBn ? "পুনঃসংযোগ..." : "STREAM STANDBY")}
        </span>

        {/* Live Connected LAN/Wi-Fi Devices Indicator */}
        {onOpenConnectedDevices && (
          <button
            onClick={onOpenConnectedDevices}
            className="btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 800,
              color: "var(--cream)",
              padding: "3px 10px",
              borderRadius: "4px",
              background: "var(--cream-alpha-15)",
              border: "1px solid var(--cream-alpha-30)",
              cursor: "pointer",
              letterSpacing: "0.02em"
            }}
            title={isBn ? "সংযুক্ত ডিভাইসসমূহ পর্যালোচনা করুন" : "View connected LAN / Wi-Fi devices"}
            aria-label={isBn ? `${connectedDevicesCount}টি ডিভাইস সংযুক্ত` : `${connectedDevicesCount} Connected Devices`}
          >
            <Wifi size={13} color="var(--cream)" />
            <span>
              {connectedDevicesCount} {isBn ? "ডিভাইস" : connectedDevicesCount === 1 ? "Device" : "Devices"}
            </span>
          </button>
        )}
      </div>

      {/* 2. Center: Honest AI Engine Badge (Cream on Navy) */}
      <div className="desktop-header-badge" style={{ display: "flex", alignItems: "center" }}>
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
          title={
            isOffline
              ? "Sovereign Air-Gapped Intelligence: Grounded in local STIX 2.1 threat database with 100% on-premises execution and zero cloud egress"
              : `Active Neural LLM: ${activeProvider}`
          }
        >
          <Cpu size={15} color="var(--cream)" />
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--cream)",
              display: "inline-block"
            }}
          />
          <span>
            {isOffline
              ? (isBn ? "সার্বভৌম আরএজি: সক্রিয় (অন-প্রিম)" : "Sovereign RAG: Active (On-Prem)")
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
          <span
            className="font-mono font-tabular"
            style={{
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "4px",
              background: "var(--navy-alpha-15)",
              color: "var(--navy)",
              fontWeight: 800,
              marginLeft: "4px"
            }}
          >
            Shift+D
          </span>
        </button>

        {/* Mobile Hamburger Menu Toggle Button (Shows on small screens only) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="btn mobile-header-menu-btn"
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 12px",
            color: "var(--cream)",
            background: "var(--navy)",
            border: `1px solid ${isMobileMenuOpen ? "var(--coral)" : "var(--cream-alpha-30)"}`,
            borderRadius: "8px",
            cursor: "pointer",
            minHeight: "44px",
            minWidth: "44px"
          }}
          aria-expanded={isMobileMenuOpen}
          aria-haspopup="true"
          aria-label={isBn ? "মোবাইল নেভিগেশন মেনু খুলুন বা বন্ধ করুন" : "Toggle mobile navigation menu"}
        >
          {isMobileMenuOpen ? <X size={20} color="var(--cream)" /> : <Menu size={20} color="var(--cream)" />}
        </button>

        {/* Language Switch */}
        <button
          onClick={() => setGlobalLanguage(isBn ? "en" : "bn")}
          className="btn desktop-header-lang"
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
        <div ref={menuRef} className="desktop-header-more" style={{ position: "relative" }}>
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

              {/* Connected Devices */}
              {onOpenConnectedDevices && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenConnectedDevices();
                  }}
                  className="dropdown-item"
                  role="menuitem"
                >
                  <Wifi size={16} color="var(--cream)" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700, color: "var(--cream)" }}>
                      {isBn ? "সংযুক্ত ডিভাইসসমূহ" : "Connected Devices"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
                      {connectedDevicesCount} {isBn ? "টি ডিভাইস সংযুক্ত" : connectedDevicesCount === 1 ? "device online" : "devices online"}
                    </span>
                  </div>
                </button>
              )}

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
                href={`${apiBase}/docs`}
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

      {/* 4. Mobile Navigation Drawer (Visible on small screens when hamburger is tapped) */}
      {isMobileMenuOpen && (
        <nav
          ref={mobileMenuRef}
          className="mobile-nav-drawer"
          role="navigation"
          aria-label={isBn ? "মোবাইল নেভিগেশন মেনু" : "Mobile navigation menu"}
          style={{
            width: "100%",
            background: "var(--navy)",
            borderTop: "1px solid var(--cream-alpha-20)",
            paddingTop: "12px",
            marginTop: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {/* Mobile Language Switcher */}
          <button
            onClick={() => {
              setGlobalLanguage(isBn ? "en" : "bn");
              setIsMobileMenuOpen(false);
            }}
            className="dropdown-item"
            style={{ minHeight: "44px" }}
          >
            <Languages size={18} color="var(--cream)" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, color: "var(--cream)" }}>
                {isBn ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              </span>
              <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
                {isBn ? "Currently in Bengali" : "বর্তমানে ইংরেজিতে প্রদর্শিত"}
              </span>
            </div>
          </button>

          {/* Connected Devices (Mobile) */}
          {onOpenConnectedDevices && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenConnectedDevices();
              }}
              className="dropdown-item"
              style={{ minHeight: "44px" }}
            >
              <Wifi size={18} color="var(--cream)" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 700, color: "var(--cream)" }}>
                  {isBn ? "সংযুক্ত ডিভাইসসমূহ" : "Connected Devices"}
                </span>
                <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
                  {connectedDevicesCount} {isBn ? "টি ডিভাইস অনলাইন" : connectedDevicesCount === 1 ? "device online" : "devices online"}
                </span>
              </div>
            </button>
          )}

          {/* Audit Log (Mobile) */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenAudit();
            }}
            className="dropdown-item"
            style={{ minHeight: "44px" }}
          >
            <Database size={18} color="var(--cream)" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "অডিট ট্রেইল" : "Audit Trail"}</span>
              <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
                {isBn ? "দায়িত্বশীল এআই রেকর্ড" : "Append-only defense log"}
              </span>
            </div>
          </button>

          {/* Pitch Deck (Mobile) */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenPitchDeck();
            }}
            className="dropdown-item"
            style={{ minHeight: "44px" }}
          >
            <Presentation size={18} color="var(--cream)" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "পিচ ডেক" : "Pitch Deck"}</span>
              <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>
                {isBn ? "৮-স্লাইড উপস্থাপনা" : "8-slide presentation"}
              </span>
            </div>
          </button>

          {/* Data Sovereignty Toggle (Mobile) */}
          <button
            onClick={() => {
              onToggleSovereignty();
              setIsMobileMenuOpen(false);
            }}
            className="dropdown-item"
            style={{ minHeight: "44px" }}
          >
            {isLocalSovereignty ? <Lock size={18} color="var(--cream)" /> : <Cloud size={18} color="var(--coral)" />}
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

          {/* API Docs Link (Mobile) */}
          <a
            href={`${apiBase}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="dropdown-item"
            style={{ textDecoration: "none", minHeight: "44px" }}
          >
            <BookOpen size={18} color="var(--cream)" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "এপিআই ডকুমেন্টস" : "API Documentation"}</span>
              <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>FastAPI Swagger UI</span>
            </div>
          </a>

          {/* Reset Demo State (Mobile) */}
          {onResetDemo && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onResetDemo();
              }}
              className="dropdown-item"
              style={{ minHeight: "44px" }}
            >
              <RotateCcw size={18} color="var(--coral)" />
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

          {/* Keyboard Shortcuts (Mobile) */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenShortcuts();
            }}
            className="dropdown-item"
            style={{ minHeight: "44px" }}
          >
            <Keyboard size={18} color="var(--cream)" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, color: "var(--cream)" }}>{isBn ? "কিবোর্ড শর্টকাট" : "Shortcuts (?)"}</span>
              <span style={{ fontSize: "11px", color: "var(--cream-alpha-75)" }}>Shift+D, Shift+A, Shift+P</span>
            </div>
          </button>
        </nav>
      )}
    </header>
  );
};
