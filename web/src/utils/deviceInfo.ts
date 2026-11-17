/**
 * Client device fingerprinting and relative time utilities for Prohori AI
 * Strict 90/10 compliant and zero cloud telemetry.
 */

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server_rendered";
  try {
    let id = localStorage.getItem("prohori_device_id");
    if (!id) {
      const randomPart =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).substring(2, 10);
      id = `dev_${randomPart}`;
      localStorage.setItem("prohori_device_id", id);
    }
    return id;
  } catch {
    return `dev_${Math.random().toString(36).substring(2, 10)}`;
  }
}

export function getDeviceName(): string {
  if (typeof navigator === "undefined") return "LAN Device";
  const ua = navigator.userAgent;
  let os = "LAN Device";

  if (/windows/i.test(ua)) os = "Windows PC";
  else if (/android/i.test(ua)) os = "Android Device";
  else if (/iphone/i.test(ua)) os = "iPhone";
  else if (/ipad/i.test(ua)) os = "iPad";
  else if (/macintosh|mac os x/i.test(ua)) os = "Mac";
  else if (/linux/i.test(ua)) os = "Linux Machine";

  let browser = "Browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  return `${os} (${browser})`;
}

export function formatRelativeTime(isoString: string): string {
  if (!isoString) return "Never";
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    if (diffMs < 5000) return "Just now";
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  } catch {
    return isoString;
  }
}
