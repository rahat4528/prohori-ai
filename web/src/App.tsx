import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { TopCounters } from "./components/TopCounters";
import { AskAnalyst } from "./components/AskAnalyst";
import { EventFeed } from "./components/EventFeed";
import { IncidentTimeline } from "./components/IncidentTimeline";
import { EventDetailDrawer } from "./components/EventDetailDrawer";
import { AuditLogDrawer } from "./components/AuditLogDrawer";
import { PitchDeckModal } from "./components/PitchDeckModal";
import type { SecurityEvent, Incident } from "./types";
import { Shield, BookOpen, Lock, Cpu } from "lucide-react";

const API_BASE = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/stream";

export const App: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [globalLanguage, setGlobalLanguage] = useState<"en" | "bn">("en");
  const [approvedIncidents, setApprovedIncidents] = useState<Record<string, boolean>>({});
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState<boolean>(false);
  const [isLocalSovereignty, setIsLocalSovereignty] = useState<boolean>(true);

  // Synchronized Filter State between TopCounters and EventFeed
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const wsRef = useRef<WebSocket | null>(null);

  const handleToggleSovereignty = async () => {
    const nextMode = isLocalSovereignty ? "cloud" : "local";
    try {
      const resp = await fetch(`${API_BASE}/sovereignty/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode })
      });
      if (resp.ok) {
        setIsLocalSovereignty(!isLocalSovereignty);
      }
    } catch (e) {
      console.error("Failed to toggle sovereignty:", e);
    }
  };

  // 1. Fetch initial events, incidents, and sovereignty status
  const fetchTelemetry = async () => {
    try {
      const [eventsRes, incRes, sovRes] = await Promise.all([
        fetch(`${API_BASE}/events?limit=100`),
        fetch(`${API_BASE}/analyst/incidents`),
        fetch(`${API_BASE}/sovereignty/status`).catch(() => null)
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }
      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data.incidents || []);
      }
      if (sovRes && sovRes.ok) {
        const sovData = await sovRes.json();
        setIsLocalSovereignty(sovData.sovereignty_mode === "LOCAL_SOVEREIGNTY");
      }
    } catch (err) {
      console.warn("Could not fetch initial telemetry from API:", err);
    }
  };

  // 2. Establish live WebSocket stream with automatic reconnection
  useEffect(() => {
    fetchTelemetry();

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
              // Refresh incidents when new events stream in
              fetch(`${API_BASE}/analyst/incidents`)
                .then((r) => r.json())
                .then((d) => setIncidents(d.incidents || []))
                .catch(() => {});
            } else if (data.type === "event_enriched" && data.event) {
              setEvents((prev) =>
                prev.map((e) => (e.id === data.event.id ? data.event : e))
              );
              if (selectedEvent?.id === data.event.id) {
                setSelectedEvent(data.event);
              }
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
      } catch (err) {
        setWsConnected(false);
        retryTimeout = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    const interval = setInterval(fetchTelemetry, 10000);

    return () => {
      clearTimeout(retryTimeout);
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "P" && e.shiftKey) {
        setIsPitchDeckOpen((prev) => !prev);
      } else if (e.key === "A" && e.shiftKey) {
        setIsAuditOpen((prev) => !prev);
      } else if (e.key === "S" && e.shiftKey) {
        handleTriggerDemo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Handler for Retriage
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

  // 4. Trigger simulated attack telemetry directly
  const handleTriggerDemo = async () => {
    try {
      await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (err) {
      console.error("Failed to post demo event:", err);
    }
  };

  // 5. Human-in-the-Loop Countermeasure Approval for Incidents
  const handleApproveIncidentAction = async (incidentId: string) => {
    const inc = incidents.find((i) => i.incident_id === incidentId);
    if (!inc) return;

    try {
      await fetch(`${API_BASE}/audit/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: `ACT-INC-${incidentId}`,
          target: inc.source_ip,
          action_type: "PERIMETER_FIREWALL_DROP",
          operator_id: "SOC_CONSOLE_OPERATOR"
        })
      });

      await fetch(`${API_BASE}/analyst/incidents/${incidentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONTAINED",
          operator_id: "SOC_CONSOLE_OPERATOR",
          notes: "Approved firewall drop via incident timeline"
        })
      });

      setApprovedIncidents((prev) => ({ ...prev, [incidentId]: true }));
      setIncidents((prev) =>
        prev.map((i) => (i.incident_id === incidentId ? { ...i, status: "CONTAINED" } : i))
      );
    } catch (err) {
      console.error("Failed to approve incident action:", err);
    }
  };

  // 6. Resolve Incident Action
  const handleResolveIncidentAction = async (incidentId: string) => {
    try {
      await fetch(`${API_BASE}/analyst/incidents/${incidentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RESOLVED",
          operator_id: "SOC_CONSOLE_OPERATOR",
          notes: "Incident remediated and marked closed"
        })
      });

      setIncidents((prev) =>
        prev.map((i) => (i.incident_id === incidentId ? { ...i, status: "RESOLVED" } : i))
      );
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  return (
    <div className="soc-container">
      {/* Top Header */}
      <Header
        wsConnected={wsConnected}
        eventCount={events.length}
        globalLanguage={globalLanguage}
        setGlobalLanguage={setGlobalLanguage}
        onTriggerDemo={handleTriggerDemo}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        isLocalSovereignty={isLocalSovereignty}
        onToggleSovereignty={handleToggleSovereignty}
      />

      {/* Top Telemetry KPI Counters */}
      <TopCounters
        events={events}
        incidentCount={incidents.length}
        onSelectSeverityFilter={(sev) => setSeverityFilter(sev)}
        onSelectSourceFilter={(src) => setSourceFilter(src)}
        selectedSeverity={severityFilter}
        selectedSource={sourceFilter}
      />

      {/* Main SOC Layout Grid */}
      <div className="soc-grid">
        {/* Left Column: Live Event Feed & Incident Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <EventFeed
            events={events}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            selectedEventId={selectedEvent?.id}
            globalLanguage={globalLanguage}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
          />
          <IncidentTimeline
            incidents={incidents}
            globalLanguage={globalLanguage}
            onApproveIncidentAction={handleApproveIncidentAction}
            onResolveIncidentAction={handleResolveIncidentAction}
            approvedIncidents={approvedIncidents}
            apiBase={API_BASE}
          />
        </div>

        {/* Right Column: "Ask the AI SOC Analyst" Centerpiece */}
        <div>
          <AskAnalyst apiBase={API_BASE} globalLanguage={globalLanguage} />
        </div>
      </div>

      {/* Footer Ribbon */}
      <footer style={{
        marginTop: "32px",
        padding: "16px 20px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        fontSize: "11px",
        color: "var(--text-tertiary)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-secondary)" }}>
            <Shield size={13} color="#38bdf8" />
            <strong>Prohori Sentinel</strong> &bull; International AI Builders Congress 2026
          </span>
          <span className="badge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}>
            <Lock size={10} style={{ marginRight: "3px" }} />
            Zero Cloud Egress Guaranteed
          </span>
          <span className="badge" style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}>
            <Cpu size={10} style={{ marginRight: "3px" }} />
            Local Model: Llama 3.2 / Qwen
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <a
            href={`${API_BASE}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#38bdf8", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <BookOpen size={11} />
            <span>Interactive API Docs</span>
          </a>
          <a
            href={`${API_BASE}/docs/architecture`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#94a3b8", textDecoration: "none" }}
          >
            Architecture
          </a>
          <a
            href={`${API_BASE}/docs/security`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#94a3b8", textDecoration: "none" }}
          >
            Security Scope
          </a>
          <a
            href={`${API_BASE}/docs/lineage`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#94a3b8", textDecoration: "none" }}
          >
            Data Lineage
          </a>
          <span className="font-mono" style={{ color: "var(--text-muted)" }}>
            [Shift+P: Pitch Deck | Shift+A: Audit Log | Shift+S: Simulate]
          </span>
        </div>
      </footer>

      {/* Detailed Event Inspector Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRetriage={handleRetriage}
        globalLanguage={globalLanguage}
        apiBase={API_BASE}
      />

      {/* Immutable Audit Log Modal */}
      <AuditLogDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        apiBase={API_BASE}
      />

      {/* 8-Slide Pitch Deck Presentation Modal */}
      <PitchDeckModal
        isOpen={isPitchDeckOpen}
        onClose={() => setIsPitchDeckOpen(false)}
        globalLanguage={globalLanguage}
      />
    </div>
  );
};

export default App;
