import React, { useState, useEffect } from "react";
import {
  Wifi,
  Laptop,
  Smartphone,
  Server,
  Router,
  Network,
  Clock,
  X,
  ShieldCheck,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type { ConnectedDevice } from "../types";
import { formatRelativeTime } from "../utils/deviceInfo";

interface ConnectedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: ConnectedDevice[];
  currentDeviceId: string;
  globalLanguage: "en" | "bn";
  localIp?: string;
  defaultGateway?: string | null;
  subnet?: string;
  onRefresh?: () => void;
  onTriggerLanScan?: () => Promise<void> | void;
}

export const ConnectedDevicesModal: React.FC<ConnectedDevicesModalProps> = ({
  isOpen,
  onClose,
  devices,
  currentDeviceId,
  globalLanguage,
  localIp = "192.168.1.104",
  defaultGateway = "192.168.1.1",
  subnet = "192.168.1.0/24",
  onRefresh,
  onTriggerLanScan
}) => {
  const isBn = globalLanguage === "bn";
  const [activeTab, setActiveTab] = useState<"all" | "consoles" | "lan">("all");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showNetworkInfo, setShowNetworkInfo] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleScanClick = async () => {
    if (isScanning || !onTriggerLanScan) return;
    setIsScanning(true);
    try {
      await onTriggerLanScan();
    } finally {
      setTimeout(() => setIsScanning(false), 800);
    }
  };

  const activeConsoles = devices.filter((d) => d.has_active_console || d.status === "online");
  const lanOnlyDevices = devices.filter(
    (d) => !d.has_active_console && d.discovery_source !== "websocket_session"
  );

  const filteredDevices = devices.filter((d) => {
    if (activeTab === "consoles") return d.has_active_console || d.status === "online";
    if (activeTab === "lan") return !d.has_active_console;
    return true;
  });

  const getDeviceIcon = (device: ConnectedDevice) => {
    const devType = device.device_type || "";
    const nameLower = (device.device_name || "").toLowerCase();
    const vendorLower = (device.mac_vendor || "").toLowerCase();

    if (device.is_local_host || devType === "server" || nameLower.includes("server")) {
      return <Server size={18} color="var(--navy)" />;
    }
    if (device.is_gateway || devType === "router" || nameLower.includes("router") || nameLower.includes("gateway")) {
      return <Router size={18} color="var(--navy)" />;
    }
    if (devType === "mobile" || nameLower.includes("phone") || nameLower.includes("android") || vendorLower.includes("apple") || vendorLower.includes("samsung")) {
      return <Smartphone size={18} color="var(--navy)" />;
    }
    if (devType === "laptop" || nameLower.includes("pc") || nameLower.includes("windows") || nameLower.includes("mac") || vendorLower.includes("intel")) {
      return <Laptop size={18} color="var(--navy)" />;
    }
    return <Network size={18} color="var(--navy)" />;
  };

  const networkAccessUrl = `http://${localIp}:3000`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--navy-alpha-75)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isBn ? "সংযুক্ত ডিভাইস ও নেটওয়ার্ক তালিকা" : "Connected LAN & Wi-Fi Devices"}
    >
      <div
        style={{
          background: "var(--cream)",
          color: "var(--navy)",
          width: "100%",
          maxWidth: "860px",
          borderRadius: "12px",
          border: "2px solid var(--navy-alpha-20)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid var(--navy-alpha-15)",
            background: "var(--navy)",
            color: "var(--cream)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "var(--coral)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Wifi size={20} color="var(--navy)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--cream)" }}>
                {isBn ? "সংযুক্ত LAN ও ওয়াই-ফাই ডিভাইসসমূহ" : "Connected LAN & Wi-Fi Network Devices"}
              </h2>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "12px",
                  color: "var(--cream-alpha-75)"
                }}
              >
                {isBn
                  ? `সক্রিয় সাবনেট: ${subnet} • এয়ার-গ্যাপড ওআইইউ ভেন্ডর শনাক্তকরণ`
                  : `Active Subnet: ${subnet} • Air-gapped Layer-2 ARP Discovery & Live Consoles`}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {onTriggerLanScan && (
              <button
                onClick={handleScanClick}
                disabled={isScanning}
                className="btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 12px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--navy)",
                  background: "var(--coral)",
                  border: "1px solid var(--coral)",
                  borderRadius: "6px",
                  cursor: isScanning ? "wait" : "pointer"
                }}
                title={isBn ? "ওয়াই-ফাই সাবনেট নতুন করে স্ক্যান করুন" : "Re-sweep local subnet for live devices"}
              >
                <RefreshCw
                  size={13}
                  color="var(--navy)"
                  style={{ animation: isScanning ? "spin 1s linear infinite" : "none" }}
                />
                <span>{isScanning ? (isBn ? "স্ক্যান হচ্ছে..." : "Scanning LAN...") : (isBn ? "নেটওয়ার্ক স্ক্যান" : "Scan LAN")}</span>
              </button>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "7px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--cream)",
                  background: "var(--cream-alpha-15)",
                  border: "1px solid var(--cream-alpha-30)",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
                title={isBn ? "তালিকা রিফ্রেশ করুন" : "Refresh list"}
              >
                <RefreshCw size={13} color="var(--cream)" />
              </button>
            )}

            <button
              onClick={onClose}
              className="btn"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                color: "var(--cream)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px"
              }}
              aria-label="Close modal"
            >
              <X size={20} color="var(--cream)" />
            </button>
          </div>
        </div>

        {/* Real Wi-Fi Network Access Banner */}
        <div
          style={{
            padding: "12px 22px",
            background: "var(--navy-alpha-05)",
            borderBottom: "1px solid var(--navy-alpha-15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <ShieldCheck size={16} color="var(--navy)" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
              {isBn ? "অন্য ডিভাইসের জন্য ওয়াই-ফাই লিংক:" : "Open On Other Devices (Same Wi-Fi):"}
            </span>
            <code
              className="font-mono font-tabular"
              style={{
                background: "var(--navy-alpha-10)",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 800,
                color: "var(--navy)"
              }}
            >
              {networkAccessUrl}
            </code>
            {defaultGateway && (
              <span style={{ fontSize: "11px", color: "var(--navy-alpha-70)" }}>
                ({isBn ? "গেটওয়ে" : "Gateway"}: {defaultGateway})
              </span>
            )}
          </div>

          {/* Tab Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setActiveTab("all")}
              className="btn font-tabular"
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 800,
                borderRadius: "6px",
                cursor: "pointer",
                background: activeTab === "all" ? "var(--navy)" : "var(--navy-alpha-10)",
                color: activeTab === "all" ? "var(--cream)" : "var(--navy)",
                border: "1px solid var(--navy-alpha-20)"
              }}
            >
              {isBn ? "সকল ডিভাইস" : "All Devices"} ({devices.length})
            </button>
            <button
              onClick={() => setActiveTab("consoles")}
              className="btn font-tabular"
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 800,
                borderRadius: "6px",
                cursor: "pointer",
                background: activeTab === "consoles" ? "var(--coral)" : "var(--navy-alpha-10)",
                color: "var(--navy)",
                border: "1px solid var(--navy-alpha-20)"
              }}
            >
              ● {isBn ? "ওয়েব কনসোল" : "Active Consoles"} ({activeConsoles.length})
            </button>
            <button
              onClick={() => setActiveTab("lan")}
              className="btn font-tabular"
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 800,
                borderRadius: "6px",
                cursor: "pointer",
                background: activeTab === "lan" ? "var(--navy)" : "var(--navy-alpha-10)",
                color: activeTab === "lan" ? "var(--cream)" : "var(--navy)",
                border: "1px solid var(--navy-alpha-20)"
              }}
            >
              {isBn ? "নেটওয়ার্ক ডিভাইস" : "LAN Endpoints"} ({lanOnlyDevices.length})
            </button>
          </div>
        </div>

        {/* Collapsible Network Limitation & Air-Gap Details */}
        <div style={{ borderBottom: "1px solid var(--navy-alpha-15)" }}>
          <button
            onClick={() => setShowNetworkInfo(!showNetworkInfo)}
            style={{
              width: "100%",
              padding: "8px 22px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--navy-alpha-85)"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Info size={14} color="var(--navy)" />
              {isBn
                ? "ডিভাইস শনাক্তকরণ কৌশল ও নেটওয়ার্ক আইসোলেশন নোট দেখুন"
                : "How Prohori AI discovers LAN devices without client software (Wi-Fi restrictions guide)"}
            </span>
            {showNetworkInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showNetworkInfo && (
            <div
              style={{
                padding: "10px 22px 14px 22px",
                background: "var(--navy-alpha-05)",
                fontSize: "11px",
                lineHeight: "1.5",
                color: "var(--navy)"
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <strong>• Layer-2 ARP Cache & Subnet Sweep:</strong> Prohori AI passively interrogates the OS kernel ARP table and sweeps the local {subnet} subnet to discover all active devices without requiring software installation.
                </div>
                <div>
                  <strong>• Air-Gapped OUI Vendor Resolution:</strong> MAC addresses are mapped against built-in IEEE hardware manufacturer prefixes (Apple, Samsung, Intel, TP-Link, Realtek, etc.) 100% offline.
                </div>
                <div>
                  <strong>• AP Client Isolation:</strong> Some Wi-Fi routers disable direct client-to-client traffic on guest networks, which prevents devices from discovering each other until they open the web console.
                </div>
                <div>
                  <strong>• Mobile Power-Saving / Sleep:</strong> iPhones and Android phones turn off their Wi-Fi radios when locked; unlocking the device immediately causes it to respond to network sweeps.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Device List Body */}
        <div style={{ padding: "16px 22px", overflowY: "auto", flex: 1 }}>
          {filteredDevices.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 16px",
                color: "var(--navy-alpha-75)"
              }}
            >
              <Wifi size={36} color="var(--navy-alpha-40)" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
                {isBn ? "এই ক্যাটাগরিতে কোনো ডিভাইস পাওয়া যায়নি" : "No devices found in this filter category"}
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "12px" }}>
                {isBn
                  ? "নেটওয়ার্ক রিফ্রেশ করতে 'নেটওয়ার্ক স্ক্যান' বাটনে ক্লিক করুন।"
                  : "Click 'Scan LAN' above to sweep the Wi-Fi subnet."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredDevices.map((device) => {
                const isCurrent = device.device_id === currentDeviceId || device.is_local_host;
                const isConsole = device.has_active_console || device.status === "online";
                const isReachable = device.status === "reachable";

                return (
                  <div
                    key={device.device_id || device.ip_address}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      background: isConsole
                        ? "var(--navy-alpha-10)"
                        : "var(--navy-alpha-05)",
                      border: `1.5px solid ${
                        isCurrent
                          ? "var(--coral)"
                          : isConsole
                          ? "var(--navy-alpha-30)"
                          : "var(--navy-alpha-15)"
                      }`,
                      gap: "14px",
                      flexWrap: "wrap"
                    }}
                  >
                    {/* Device Icon & Identity */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "240px", flex: 1 }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: isConsole ? "var(--coral)" : "var(--cream)",
                          border: "1px solid var(--navy-alpha-20)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        {getDeviceIcon(device)}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)" }}>
                            {device.device_name || "Network Endpoint"}
                          </span>

                          {device.is_local_host && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "var(--coral)",
                                color: "var(--navy)"
                              }}
                            >
                              {isBn ? "হোস্ট সার্ভার" : "HOST SERVER"}
                            </span>
                          )}

                          {device.is_gateway && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "var(--navy)",
                                color: "var(--cream)"
                              }}
                            >
                              {isBn ? "গেটওয়ে" : "GATEWAY"}
                            </span>
                          )}

                          {isConsole && !device.is_local_host && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "var(--coral)",
                                color: "var(--navy)"
                              }}
                            >
                              {isBn ? "ওয়েব কনসোল" : "CONSOLE ACTIVE"}
                            </span>
                          )}
                        </div>

                        {/* MAC Address & Hardware Manufacturer */}
                        <div
                          className="font-mono font-tabular"
                          style={{
                            fontSize: "11px",
                            color: "var(--navy-alpha-75)",
                            marginTop: "2px"
                          }}
                        >
                          {device.mac_address && device.mac_address !== "REMOTE_BROWSER"
                            ? `${device.mac_address} • ${device.mac_vendor || "LAN Endpoint"}`
                            : device.user_agent
                            ? device.user_agent.slice(0, 50) + "..."
                            : "Layer-2 Discovered Endpoint"}
                        </div>
                      </div>
                    </div>

                    {/* IP Address & Discovery Method */}
                    <div style={{ minWidth: "150px" }}>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--navy-alpha-60)",
                          marginBottom: "1px"
                        }}
                      >
                        {isBn ? "আইপি ঠিকানা" : "IP ADDRESS"}
                      </div>
                      <code
                        className="font-mono font-tabular"
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: "var(--navy)"
                        }}
                      >
                        {device.ip_address}
                      </code>
                      <div style={{ fontSize: "10px", color: "var(--navy-alpha-65)", marginTop: "1px" }}>
                        {device.discovery_source === "both"
                          ? "LAN + Web Console"
                          : device.discovery_source === "websocket_session"
                          ? "Web Console Session"
                          : "ARP Cache / Subnet Scan"}
                      </div>
                    </div>

                    {/* Status & Last Seen */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div>
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--navy-alpha-60)",
                            marginBottom: "1px"
                          }}
                        >
                          {isBn ? "স্থিতি" : "STATUS"}
                        </div>
                        <span
                          className="font-mono font-tabular"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "4px",
                            background: isConsole
                              ? "var(--coral)"
                              : isReachable
                              ? "var(--navy)"
                              : "var(--navy-alpha-15)",
                            color: isReachable && !isConsole ? "var(--cream)" : "var(--navy)"
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: isReachable && !isConsole ? "var(--cream)" : "var(--navy)",
                              display: "inline-block"
                            }}
                          />
                          {isConsole
                            ? isBn
                              ? "অনলাইন"
                              : "ONLINE"
                            : isReachable
                            ? isBn
                              ? "সক্রিয়"
                              : "REACHABLE"
                            : isBn
                            ? "শনাক্ত"
                            : "DETECTED"}
                        </span>
                      </div>

                      <div style={{ minWidth: "80px" }}>
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--navy-alpha-60)",
                            marginBottom: "1px"
                          }}
                        >
                          {isBn ? "সর্বশেষ" : "LAST SEEN"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--navy)"
                          }}
                        >
                          <Clock size={11} color="var(--navy-alpha-60)" />
                          <span className="font-tabular">{formatRelativeTime(device.last_seen)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "12px 22px",
            borderTop: "1px solid var(--navy-alpha-15)",
            background: "var(--navy-alpha-05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--navy-alpha-75)", fontWeight: 600 }}>
            {isBn
              ? "রিয়েল-টাইমে আর্প এবং ওয়েবসকেটের মাধ্যমে স্বয়ংক্রিয়ভাবে সিঙ্ক্রোনাইজ হয়।"
              : "Synchronized in real-time via Layer-2 ARP discovery and WebSocket telemetry."}
          </span>
          <button
            onClick={onClose}
            className="btn"
            style={{
              padding: "7px 16px",
              background: "var(--navy)",
              color: "var(--cream)",
              border: "1px solid var(--navy)",
              borderRadius: "6px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            {isBn ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
