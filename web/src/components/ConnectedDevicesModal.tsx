import React, { useEffect } from "react";
import { Wifi, Laptop, Smartphone, Monitor, Clock, X, ShieldCheck, RefreshCw } from "lucide-react";
import type { ConnectedDevice } from "../types";
import { formatRelativeTime } from "../utils/deviceInfo";

interface ConnectedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: ConnectedDevice[];
  currentDeviceId: string;
  globalLanguage: "en" | "bn";
  onRefresh?: () => void;
}

export const ConnectedDevicesModal: React.FC<ConnectedDevicesModalProps> = ({
  isOpen,
  onClose,
  devices,
  currentDeviceId,
  globalLanguage,
  onRefresh
}) => {
  const isBn = globalLanguage === "bn";

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

  const onlineDevices = devices.filter((d) => d.status === "online");
  const offlineDevices = devices.filter((d) => d.status !== "online");

  const getDeviceIcon = (ua: string, name: string) => {
    const combined = `${ua} ${name}`.toLowerCase();
    if (combined.includes("android") || combined.includes("iphone") || combined.includes("mobile")) {
      return <Smartphone size={18} color="var(--navy)" />;
    }
    if (combined.includes("ipad") || combined.includes("tablet")) {
      return <Monitor size={18} color="var(--navy)" />;
    }
    if (combined.includes("windows") || combined.includes("mac") || combined.includes("linux") || combined.includes("pc")) {
      return <Laptop size={18} color="var(--navy)" />;
    }
    return <Monitor size={18} color="var(--navy)" />;
  };

  const currentHost = typeof window !== "undefined" ? window.location.host : "localhost:3000";

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
      aria-label={isBn ? "সংযুক্ত ডিভাইস তালিকা" : "Connected LAN Devices"}
    >
      <div
        style={{
          background: "var(--cream)",
          color: "var(--navy)",
          width: "100%",
          maxWidth: "760px",
          borderRadius: "12px",
          border: "2px solid var(--navy-alpha-20)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
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
            padding: "18px 24px",
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
                {isBn ? "সংযুক্ত ডিভাইস ও নেটওয়ার্ক সেশন" : "Connected LAN & Wi-Fi Devices"}
              </h2>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "12px",
                  color: "var(--cream-alpha-75)"
                }}
              >
                {isBn
                  ? "রিয়েল-টাইম ডিভাইস ডিসকভারি ও সক্রিয় সেশন ম্যানেজমেন্ট"
                  : "Live multi-device discovery & synchronized WebSocket telemetry"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--cream)",
                  background: "var(--cream-alpha-15)",
                  border: "1px solid var(--cream-alpha-30)",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
                title={isBn ? "তালিকা রিফ্রেশ করুন" : "Refresh device list"}
              >
                <RefreshCw size={13} color="var(--cream)" />
                <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
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

        {/* Informational Sub-Banner with Current Wi-Fi Access URL */}
        <div
          style={{
            padding: "12px 24px",
            background: "var(--navy-alpha-05)",
            borderBottom: "1px solid var(--navy-alpha-15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} color="var(--navy)" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
              {isBn ? "ওয়াই-ফাই অ্যাক্সেস লিংক:" : "Local Network Access Link:"}
            </span>
            <code
              className="font-mono font-tabular"
              style={{
                background: "var(--navy-alpha-10)",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--navy)"
              }}
            >
              http://{currentHost}
            </code>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              className="font-mono font-tabular"
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "12px",
                background: "var(--coral)",
                color: "var(--navy)"
              }}
            >
              ● {onlineDevices.length} {isBn ? "অনলাইন" : "Online"}
            </span>
            {offlineDevices.length > 0 && (
              <span
                className="font-mono font-tabular"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "12px",
                  background: "var(--navy-alpha-10)",
                  color: "var(--navy)"
                }}
              >
                ○ {offlineDevices.length} {isBn ? "অফলাইন" : "Offline"}
              </span>
            )}
          </div>
        </div>

        {/* Device Table */}
        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
          {devices.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 16px",
                color: "var(--navy-alpha-75)"
              }}
            >
              <Wifi size={36} color="var(--navy-alpha-40)" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
                {isBn ? "কোনো সংযুক্ত ডিভাইস পাওয়া যায়নি" : "No connected devices detected yet"}
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "12px" }}>
                {isBn
                  ? "একই ওয়াই-ফাই নেটওয়ার্কের অন্য ফোন বা ল্যাপটপ থেকে কনসোলে প্রবেশ করুন।"
                  : "Open http://<YOUR-IP>:3000 from another device on this Wi-Fi network."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {devices.map((device) => {
                const isCurrent = device.device_id === currentDeviceId;
                const isOnline = device.status === "online";

                return (
                  <div
                    key={device.device_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "8px",
                      background: isCurrent ? "var(--navy-alpha-10)" : "var(--navy-alpha-05)",
                      border: `1.5px solid ${isCurrent ? "var(--coral)" : "var(--navy-alpha-15)"}`,
                      gap: "14px",
                      flexWrap: "wrap"
                    }}
                  >
                    {/* Device Identity */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "220px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: isOnline ? "var(--cream)" : "var(--navy-alpha-10)",
                          border: "1px solid var(--navy-alpha-20)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        {getDeviceIcon(device.user_agent, device.device_name)}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)" }}>
                            {device.device_name || "Unknown Endpoint"}
                          </span>
                          {isCurrent && (
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
                              {isBn ? "এই ডিভাইস" : "THIS DEVICE"}
                            </span>
                          )}
                        </div>
                        <div
                          className="font-mono font-tabular"
                          style={{
                            fontSize: "11px",
                            color: "var(--navy-alpha-75)",
                            marginTop: "2px"
                          }}
                        >
                          ID: {device.device_id}
                        </div>
                      </div>
                    </div>

                    {/* IP Address */}
                    <div style={{ minWidth: "140px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--navy-alpha-60)",
                          marginBottom: "2px"
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
                    </div>

                    {/* Status & Last Seen */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--navy-alpha-60)",
                            marginBottom: "2px"
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
                            fontSize: "12px",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: isOnline ? "var(--coral)" : "var(--navy-alpha-15)",
                            color: "var(--navy)"
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "var(--navy)",
                              display: "inline-block"
                            }}
                          />
                          {isOnline ? (isBn ? "অনলাইন" : "ONLINE") : (isBn ? "অফলাইন" : "OFFLINE")}
                        </span>
                      </div>

                      <div style={{ minWidth: "90px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--navy-alpha-60)",
                            marginBottom: "2px"
                          }}
                        >
                          {isBn ? "সর্বশেষ সক্রিয়" : "LAST SEEN"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "var(--navy)"
                          }}
                        >
                          <Clock size={12} color="var(--navy-alpha-60)" />
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
            padding: "14px 24px",
            borderTop: "1px solid var(--navy-alpha-15)",
            background: "var(--navy-alpha-05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--navy-alpha-75)", fontWeight: 600 }}>
            {isBn
              ? "ডিভাইস সংযোগ বা বিচ্ছিন্নকরণে রিয়েল-টাইমে স্বয়ংক্রিয়ভাবে আপডেট হয়।"
              : "Updates in real-time over WebSocket whenever a device connects or disconnects."}
          </span>
          <button
            onClick={onClose}
            className="btn"
            style={{
              padding: "8px 18px",
              background: "var(--navy)",
              color: "var(--cream)",
              border: "1px solid var(--navy)",
              borderRadius: "6px",
              fontWeight: 800,
              fontSize: "13px",
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
