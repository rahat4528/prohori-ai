import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { AlertList } from "./components/AlertList";
import { SelectedAlertPanel, type AuditConfirmation } from "./components/SelectedAlertPanel";
import { AuditLogDrawer } from "./components/AuditLogDrawer";
import { PitchDeckModal } from "./components/PitchDeckModal";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { EventDetailDrawer } from "./components/EventDetailDrawer";
import type { SecurityEvent, Incident } from "./types";
import { Shield, Lock, Cpu, BookOpen, ShieldAlert, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/stream";
const API_KEY = import.meta.env.VITE_PROHORI_API_KEY || "";
const jsonHeaders: Record<string, string> = API_KEY
  ? { "Content-Type": "application/json", "X-API-Key": API_KEY }
  : { "Content-Type": "application/json" };

export const App: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [, setIncidents] = useState<Incident[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [globalLanguage, setGlobalLanguage] = useState<"en" | "bn">("en");
  const [approvedMap, setApprovedMap] = useState<Record<string, AuditConfirmation>>({});
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isRawDrawerOpen, setIsRawDrawerOpen] = useState<boolean>(false);
  const [isLocalSovereignty, setIsLocalSovereignty] = useState<boolean>(true);
  const [activeProvider, setActiveProvider] = useState<string>("deterministic-offline-rag");
  const [activeMobileTab, setActiveMobileTab] = useState<"alerts" | "analysis">("alerts");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Responsive mobile detector
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 1. Fetch initial telemetry and sovereignty status
  const fetchTelemetry = useCallback(async () => {
    try {
      const [eventsRes, incRes, sovRes] = await Promise.all([
        fetch(`${API_BASE}/events?limit=100`),
        fetch(`${API_BASE}/analyst/incidents`),
        fetch(`${API_BASE}/sovereignty/status`).catch(() => null)
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        const evList: SecurityEvent[] = data.events || [];
        setEvents(evList);
        // Default select newest event if none selected
        setSelectedEvent((prev) => {
          if (!prev && evList.length > 0) return evList[0];
          if (prev) {
            const updated = evList.find((e) => e.id === prev.id);
            return updated || prev;
          }
          return null;
        });
      }

      if (incRes.ok) {
        const incData = await incRes.json();
        setIncidents(incData.incidents || []);
      }

      if (sovRes && sovRes.ok) {
        const sovData = await sovRes.json();
        setIsLocalSovereignty(sovData.sovereignty_mode === "BANGLADESH_ON_PREM_ONLY" || sovData.sovereignty_mode === "LOCAL_SOVEREIGNTY");
        if (sovData.active_llm_backend) {
          if (sovData.active_llm_backend === "ollama") {
            setActiveProvider("ollama-local (llama3.2)");
          } else if (sovData.active_llm_backend === "offline") {
            setActiveProvider("deterministic-offline-rag");
          } else {
            setActiveProvider(sovData.active_llm_backend);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch telemetry from API:", err);
    }
  }, []);

  // 2. Establish live WebSocket stream with automatic reconnection
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchTelemetry();
    });

    let retryTimeout: any;

    const connectWs = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "new_event" && data.event) {
              setEvents((prev) => [data.event, ...prev.filter((e) => e.id !== data.event.id)]);
              // Auto-select latest streamed event for instant feedback
              setSelectedEvent(data.event);
              fetch(`${API_BASE}/analyst/incidents`)
                .then((r) => r.json())
                .then((d) => setIncidents(d.incidents || []))
                .catch(() => {});
            } else if (data.type === "event_enriched" && data.event) {
              setEvents((prev) =>
                prev.map((e) => (e.id === data.event.id ? data.event : e))
              );
              setSelectedEvent((prev) => (prev?.id === data.event.id ? data.event : prev));
            } else if (data.type === "incident_status_changed" && data.incident_id) {
              setIncidents((prev) =>
                prev.map((i) =>
                  i.incident_id === data.incident_id ? { ...i, status: data.status } : i
                )
              );
            }
          } catch (e) {
            console.error("Error processing websocket message:", e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          retryTimeout = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setWsConnected(false);
        retryTimeout = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    const interval = setInterval(fetchTelemetry, 10000);

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchTelemetry]);

  // 3. Trigger simulated attack telemetry (single "Run demo" action)
  const handleTriggerDemo = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          source: "honeypot",
          severity: "high",
          type: "brute_force_suspected",
          details: {
            source_ip: "192.168.1.189",
            username_tried: "admin",
            password_tried: "toor",
            attempts_in_window: 7,
            simulated_surface: "fake_admin_login"
          }
        })
      });

      if (resp.ok) {
        const newEv = await resp.json();
        setEvents((prev) => [newEv, ...prev.filter((e) => e.id !== newEv.id)]);
        setSelectedEvent(newEv);
        if (isMobile) {
          setActiveMobileTab("analysis");
        }
      }
    } catch (err) {
      console.error("Failed to post demo event:", err);
    }
  }, [isMobile]);

  // 4. Toggle Data Sovereignty Mode
  const handleToggleSovereignty = async () => {
    const nextMode = isLocalSovereignty ? "cloud" : "local";
    try {
      const resp = await fetch(`${API_BASE}/sovereignty/toggle`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ mode: nextMode })
      });
      if (resp.ok) {
        setIsLocalSovereignty(!isLocalSovereignty);
        setActiveProvider(nextMode === "local" ? "ollama-local (llama3.2)" : "cloud-hybrid");
      }
    } catch (e) {
      console.error("Failed to toggle sovereignty:", e);
    }
  };

  // 5. Retriage Event
  const handleRetriage = async (eventId: string) => {
    try {
      const resp = await fetch(`${API_BASE}/analyst/triage/${eventId}`, {
        method: "POST"
      });
      if (resp.ok) {
        const updated = await resp.json();
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setSelectedEvent(updated);
      }
    } catch (err) {
      console.error("Retriage request failed:", err);
    }
  };

  // 6. Human-in-the-Loop Countermeasure Approval
  const handleApproveDefense = async (
    actionId: string,
    target: string,
    actionType: string
  ): Promise<AuditConfirmation | void> => {
    try {
      const resp = await fetch(`${API_BASE}/audit/approve`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          action_id: actionId,
          target: target,
          action_type: actionType,
          operator_id: "SOC_CONSOLE_OPERATOR"
        })
      });

      if (resp.ok) {
        const data: AuditConfirmation = await resp.json();
        const actionKey = selectedEvent ? `${selectedEvent.id}_${target}` : actionId;
        setApprovedMap((prev) => ({
          ...prev,
          [actionKey]: data,
          [actionId]: data
        }));
        // Refresh incidents
        fetchTelemetry();
        return data;
      }
    } catch (err) {
      console.error("Failed to approve defense action:", err);
    }
  };

  // 7. Global Accessible Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "Escape") {
        setIsAuditOpen(false);
        setIsPitchDeckOpen(false);
        setIsShortcutsOpen(false);
        setIsRawDrawerOpen(false);
      } else if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.shiftKey && (e.key === "D" || e.key === "S")) {
        e.preventDefault();
        handleTriggerDemo();
      } else if (e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsAuditOpen((prev) => !prev);
      } else if (e.shiftKey && e.key === "P") {
        e.preventDefault();
        setIsPitchDeckOpen((prev) => !prev);
      } else if (e.shiftKey && e.key === "L") {
        e.preventDefault();
        setGlobalLanguage((prev) => (prev === "en" ? "bn" : "en"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTriggerDemo]);

  const isBn = globalLanguage === "bn";

  return (
    <div className="soc-container">
      {/* 1. Top Simplified Header */}
      <Header
        wsConnected={wsConnected}
        globalLanguage={globalLanguage}
        setGlobalLanguage={setGlobalLanguage}
        onTriggerDemo={handleTriggerDemo}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        isLocalSovereignty={isLocalSovereignty}
        onToggleSovereignty={handleToggleSovereignty}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        activeProvider={activeProvider}
      />

      {/* 2. Mobile Tab Switcher (< 900px) */}
      <div className="mobile-tab-bar" role="tablist" aria-label="Mobile View Switcher">
        <button
          role="tab"
          aria-selected={activeMobileTab === "alerts"}
          onClick={() => setActiveMobileTab("alerts")}
          className={`mobile-tab-btn ${activeMobileTab === "alerts" ? "active" : ""}`}
        >
          <ShieldAlert size={16} />
          <span>{isBn ? `সরাসরি সতর্কতা (${events.length})` : `Live Alerts (${events.length})`}</span>
        </button>
        <button
          role="tab"
          aria-selected={activeMobileTab === "analysis"}
          onClick={() => setActiveMobileTab("analysis")}
          className={`mobile-tab-btn ${activeMobileTab === "analysis" ? "active" : ""}`}
        >
          <Sparkles size={16} />
          <span>{isBn ? "এআই হুমকি বিশ্লেষণ" : "Threat Analysis"}</span>
        </button>
      </div>

      {/* 3. Main Simplified 2-Column SOC Layout */}
      <main className="simplified-grid" role="main">
        {/* Left Column: Live Alert Feed */}
        <div style={{ display: isMobile && activeMobileTab !== "alerts" ? "none" : "block" }}>
          <AlertList
            events={events}
            selectedEventId={selectedEvent?.id || null}
            onSelectEvent={(ev) => {
              setSelectedEvent(ev);
              if (isMobile) {
                setActiveMobileTab("analysis");
              }
            }}
            globalLanguage={globalLanguage}
            onTriggerDemo={handleTriggerDemo}
          />
        </div>

        {/* Right Column: Selected Alert Intelligence & Action Gate */}
        <div style={{ display: isMobile && activeMobileTab !== "analysis" ? "none" : "block" }}>
          <SelectedAlertPanel
            event={selectedEvent}
            globalLanguage={globalLanguage}
            apiBase={API_BASE}
            onApproveDefense={handleApproveDefense}
            onRetriage={handleRetriage}
            approvedMap={approvedMap}
          />
        </div>
      </main>

      {/* 4. Footer */}
      <footer
        style={{
          marginTop: "28px",
          padding: "14px 20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13px",
          color: "var(--text-tertiary)"
        }}
        role="contentinfo"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontWeight: 600 }}>
            <Shield size={15} color="#38bdf8" />
            <span>Prohori Sentinel &bull; International AI Builders Congress 2026</span>
          </span>
          <span
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#34d399",
              padding: "3px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            <Lock size={12} />
            <span>Controls: Zero packet egress in sovereignty mode</span>
          </span>
          <span
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
              padding: "3px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            <Cpu size={12} />
            <span>Local Model: Llama 3.2 / Offline RAG</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <a
            href={`${API_BASE}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#38bdf8", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
          >
            <BookOpen size={13} />
            <span>Interactive API Docs</span>
          </a>
          <button
            onClick={() => setIsRawDrawerOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "13px",
              textDecoration: "underline"
            }}
          >
            {isBn ? "কাঁচা ফরেনসিক তথ্য" : "Raw Forensic Event"}
          </button>
          <span className="font-mono" style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
            [? : Shortcuts | Shift+D: Demo | Shift+A: Audit | Shift+P: Pitch Deck]
          </span>
        </div>
      </footer>

      {/* 5. Modals & Drawers */}
      <AuditLogDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        apiBase={API_BASE}
      />

      <PitchDeckModal
        isOpen={isPitchDeckOpen}
        onClose={() => setIsPitchDeckOpen(false)}
        globalLanguage={globalLanguage}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        globalLanguage={globalLanguage}
      />

      {isRawDrawerOpen && (
        <EventDetailDrawer
          event={selectedEvent}
          onClose={() => setIsRawDrawerOpen(false)}
          onRetriage={handleRetriage}
          globalLanguage={globalLanguage}
          apiBase={API_BASE}
        />
      )}
    </div>
  );
};

export default App;
