import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { TopCounters } from "./components/TopCounters";
import { AskAnalyst } from "./components/AskAnalyst";
import { EventFeed } from "./components/EventFeed";
import { IncidentTimeline } from "./components/IncidentTimeline";
import { EventDetailDrawer } from "./components/EventDetailDrawer";
import { AuditLogDrawer } from "./components/AuditLogDrawer";
import type { SecurityEvent, Incident } from "./types";



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


  const wsRef = useRef<WebSocket | null>(null);

  // 1. Fetch initial events and incidents
  const fetchTelemetry = async () => {
    try {
      const [eventsRes, incRes] = await Promise.all([
        fetch(`${API_BASE}/events?limit=100`),
        fetch(`${API_BASE}/analyst/incidents`)
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }
      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.warn("Could not fetch initial telemetry from API:", err);
    }
  };

  // 2. Establish live WebSocket stream with reconnect
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
              // Trigger incident refresh
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

    // Periodic heartbeat/refresh
    const interval = setInterval(fetchTelemetry, 10000);

    return () => {
      clearTimeout(retryTimeout);
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
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
    // Ingest a high-impact demo honeypot burst
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
            attempts_in_window: 6,
            simulated_surface: "fake_admin_login"
          }
        })
      });
    } catch (err) {
      console.error("Failed to post demo event:", err);
    }
  };

  const handleApproveIncidentAction = (incidentId: string) => {
    setApprovedIncidents((prev) => ({ ...prev, [incidentId]: true }));
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
      />


      {/* Top Telemetry KPI Counters */}
      <TopCounters events={events} incidentCount={incidents.length} />

      {/* Main SOC Layout Grid */}
      <div className="soc-grid">
        {/* Left Column: Live Event Feed & Incident Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <EventFeed
            events={events}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            selectedEventId={selectedEvent?.id}
            globalLanguage={globalLanguage}
          />
          <IncidentTimeline
            incidents={incidents}
            globalLanguage={globalLanguage}
            onApproveIncidentAction={handleApproveIncidentAction}
            approvedIncidents={approvedIncidents}
          />
        </div>

        {/* Right Column: "Ask the AI SOC Analyst" Centerpiece */}
        <div>
          <AskAnalyst apiBase={API_BASE} globalLanguage={globalLanguage} />
        </div>
      </div>

      {/* Detailed Event Inspector Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRetriage={handleRetriage}
        globalLanguage={globalLanguage}
      />

      {/* Immutable Audit Log Modal */}
      <AuditLogDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        apiBase={API_BASE}
      />

    </div>
  );
};


export default App;
