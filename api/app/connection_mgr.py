"""
WebSocket Connection Manager & Unified LAN/Session Registry for Prohori AI
Maintains real-time state of active web console sessions, discovered LAN devices,
and broadcasts synchronized device state over WebSocket to all connected operators.
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

from .network_discovery import (
    discover_lan_endpoints,
    get_default_gateway_ip,
    get_host_device_info,
    get_primary_lan_ip,
)

logger = logging.getLogger("prohori.websocket")


def parse_device_name_from_ua(user_agent: str) -> str:
    """Derive a friendly device label from the HTTP User-Agent."""
    ua = user_agent.lower()
    os_name = "LAN Host"
    if "windows" in ua:
        os_name = "Windows PC"
    elif "android" in ua:
        os_name = "Android Smartphone"
    elif "iphone" in ua:
        os_name = "iPhone"
    elif "ipad" in ua:
        os_name = "iPad"
    elif "macintosh" in ua or "mac os" in ua:
        os_name = "MacBook / Mac"
    elif "linux" in ua:
        os_name = "Linux Machine"

    browser = "Browser"
    if "edg" in ua:
        browser = "Edge"
    elif "chrome" in ua or "crios" in ua:
        browser = "Chrome"
    elif "firefox" in ua or "fxios" in ua:
        browser = "Firefox"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"

    return f"{os_name} ({browser})"


class ConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()
        self.sessions: dict[str, dict[str, Any]] = {}
        self.lan_devices: dict[str, dict[str, Any]] = {}
        self.ws_to_device: dict[WebSocket, str] = {}
        self.device_to_ws: dict[str, set[WebSocket]] = {}
        self._lan_scan_lock = asyncio.Lock()
        self._last_lan_scan: float = 0

    def normalize_client_ip(self, raw_ip: str) -> tuple[str, bool]:
        """Normalize localhost / loopback to host's primary physical LAN IP."""
        if not raw_ip or raw_ip in ("127.0.0.1", "::1", "localhost", "testclient"):
            return get_primary_lan_ip(), True
        return raw_ip, False

    async def connect(
        self,
        websocket: WebSocket,
        client_ip: str = "127.0.0.1",
        user_agent: str = ""
    ) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)

        real_ip, is_local = self.normalize_client_ip(client_ip)
        logger.info(f"WebSocket client connected from {real_ip} (local={is_local}). Total sockets: {len(self.active_connections)}")

        # Trigger background LAN discovery if cache is cold (> 45s)
        if time.time() - self._last_lan_scan > 45:
            asyncio.create_task(self.scan_and_refresh_lan(broadcast_after=False))

        # Send welcome/handshake event including current devices snapshot
        try:
            summary = self.get_network_summary()
            await websocket.send_json({
                "type": "connection_established",
                "message": "Connected to Prohori AI live event stream",
                "client_ip": real_ip,
                "is_local_host": is_local,
                "active_clients": len(self.active_connections),
                "devices": summary["devices"],
                "total_connected": summary["total_connected_consoles"],
                "total_lan_devices": summary["total_lan_devices"],
                "local_ip": summary["local_ip"],
                "default_gateway": summary["default_gateway"],
                "subnet": summary["subnet"]
            })
        except Exception:
            pass

    async def register_device(
        self,
        websocket: WebSocket,
        device_id: str | None,
        device_name: str | None,
        client_ip: str = "127.0.0.1",
        user_agent: str = ""
    ) -> dict[str, Any]:
        """Register or update a client web console session associated with a WebSocket."""
        now_iso = datetime.now(timezone.utc).isoformat()
        real_ip, is_local = self.normalize_client_ip(client_ip)

        if not device_id or str(device_id).strip() == "":
            device_id = f"dev_{real_ip.replace('.', '_')}"
        if not device_name or str(device_name).strip() == "":
            device_name = parse_device_name_from_ua(user_agent)

        existing = self.sessions.get(device_id)
        if existing:
            existing["device_name"] = device_name
            existing["ip_address"] = real_ip
            existing["user_agent"] = user_agent
            existing["status"] = "online"
            existing["is_local_host"] = is_local
            existing["has_active_console"] = True
            existing["last_seen"] = now_iso
            session_record = existing
        else:
            session_record = {
                "device_id": device_id,
                "device_name": device_name,
                "ip_address": real_ip,
                "user_agent": user_agent,
                "status": "online",
                "is_local_host": is_local,
                "has_active_console": True,
                "discovery_source": "websocket_session",
                "connected_at": now_iso,
                "last_seen": now_iso,
            }
            self.sessions[device_id] = session_record

        self.ws_to_device[websocket] = device_id
        if device_id not in self.device_to_ws:
            self.device_to_ws[device_id] = set()
        self.device_to_ws[device_id].add(websocket)

        logger.info(f"Console session registered: {device_id} ({device_name}) at {real_ip}")

        # Broadcast live update to all connected clients
        await self.broadcast_device_update()
        return session_record

    async def register_device_http(
        self,
        device_id: str | None,
        device_name: str | None,
        client_ip: str = "127.0.0.1",
        user_agent: str = ""
    ) -> dict[str, Any]:
        """Register or update a client device session over HTTP."""
        now_iso = datetime.now(timezone.utc).isoformat()
        real_ip, is_local = self.normalize_client_ip(client_ip)

        if not device_id or str(device_id).strip() == "":
            device_id = f"dev_{real_ip.replace('.', '_')}"
        if not device_name or str(device_name).strip() == "":
            device_name = parse_device_name_from_ua(user_agent)

        session_record = {
            "device_id": device_id,
            "device_name": device_name,
            "ip_address": real_ip,
            "user_agent": user_agent,
            "status": "online",
            "is_local_host": is_local,
            "has_active_console": True,
            "discovery_source": "websocket_session",
            "connected_at": now_iso,
            "last_seen": now_iso,
        }
        self.sessions[device_id] = session_record
        await self.broadcast_device_update()
        return session_record

    async def heartbeat(self, websocket: WebSocket | None = None, device_id: str | None = None) -> None:
        """Update last seen timestamp for a session."""
        now_iso = datetime.now(timezone.utc).isoformat()
        target_id = device_id
        if not target_id and websocket:
            target_id = self.ws_to_device.get(websocket)

        if target_id and target_id in self.sessions:
            self.sessions[target_id]["last_seen"] = now_iso
            self.sessions[target_id]["status"] = "online"

    async def disconnect(self, websocket: WebSocket) -> None:
        """Remove a disconnected WebSocket client and update device state."""
        self.active_connections.discard(websocket)
        target_id = self.ws_to_device.pop(websocket, None)
        logger.info(f"WebSocket client disconnected ({target_id}). Active sockets: {len(self.active_connections)}")

        if target_id and target_id in self.device_to_ws:
            self.device_to_ws[target_id].discard(websocket)
            if not self.device_to_ws[target_id]:
                # No more active sockets for this session
                del self.device_to_ws[target_id]
                if target_id in self.sessions:
                    self.sessions[target_id]["status"] = "offline"
                    self.sessions[target_id]["has_active_console"] = False
                    self.sessions[target_id]["last_seen"] = datetime.now(timezone.utc).isoformat()

                await self.broadcast_device_update()

    async def scan_and_refresh_lan(self, broadcast_after: bool = True) -> list[dict[str, Any]]:
        """Perform full LAN ARP sweep, update local cache, and optionally broadcast."""
        async with self._lan_scan_lock:
            try:
                endpoints = await discover_lan_endpoints()
                new_map = {}
                for ep in endpoints:
                    new_map[ep["ip_address"]] = ep
                self.lan_devices = new_map
                self._last_lan_scan = time.time()
                logger.info(f"LAN discovery complete: {len(self.lan_devices)} network assets identified.")
            except Exception as e:
                logger.warning(f"LAN discovery failed: {e}")

        if broadcast_after:
            await self.broadcast_device_update()

        return self.get_unified_devices()

    def get_unified_devices(self) -> list[dict[str, Any]]:
        """
        Produce a unified list of devices by merging:
        1. Live LAN endpoints discovered via ARP & subnet probes.
        2. Active WebSocket operator console sessions.
        """
        lan_by_ip = {ep["ip_address"]: dict(ep) for ep in self.lan_devices.values()}
        devices: dict[str, dict[str, Any]] = {}
        consumed_ips: set[str] = set()

        # 1. Process all registered console sessions
        for dev_id, session in self.sessions.items():
            ip = session["ip_address"]
            lan_match = lan_by_ip.get(ip)
            dev_type = session.get("device_type")
            if not dev_type or dev_type == "unknown":
                if lan_match:
                    dev_type = lan_match.get("device_type", "laptop")
                elif "android" in session.get("user_agent", "").lower() or "iphone" in session.get("user_agent", "").lower():
                    dev_type = "mobile"
                else:
                    dev_type = "laptop"

            is_online = session.get("status") == "online" and session.get("has_active_console", False)

            devices[dev_id] = {
                "device_id": dev_id,
                "device_name": session.get("device_name", "Web Console"),
                "ip_address": ip,
                "mac_address": lan_match.get("mac_address", "REMOTE_BROWSER") if lan_match else "REMOTE_BROWSER",
                "mac_vendor": lan_match.get("mac_vendor", "Web Console Session") if lan_match else "Web Console Session",
                "device_type": dev_type,
                "discovery_source": "both" if lan_match else "websocket_session",
                "user_agent": session.get("user_agent", ""),
                "status": "online" if is_online else "offline",
                "is_local_host": session.get("is_local_host", False),
                "is_gateway": False,
                "has_active_console": is_online,
                "connected_at": session.get("connected_at", ""),
                "last_seen": session.get("last_seen", "")
            }
            if is_online:
                consumed_ips.add(ip)

        # 2. Add remaining LAN devices that have not opened an active console
        for ip, lan_dev in lan_by_ip.items():
            if ip not in consumed_ips:
                devices[lan_dev["device_id"]] = dict(lan_dev)

        device_list = list(devices.values())

        def sort_priority(d: dict[str, Any]) -> tuple[int, int, str]:
            if d.get("is_local_host"):
                rank = 0
            elif d.get("has_active_console") and d.get("status") == "online":
                rank = 1
            elif d.get("is_gateway"):
                rank = 2
            elif d.get("status") == "reachable":
                rank = 3
            elif d.get("status") == "detected":
                rank = 4
            else:
                rank = 5

            return (rank, 0 if d.get("status") == "online" else 1, d.get("ip_address", ""))

        device_list.sort(key=sort_priority)
        return device_list

    def get_devices(self) -> list[dict[str, Any]]:
        """Return list of all unified devices."""
        return self.get_unified_devices()

    def get_active_devices(self) -> list[dict[str, Any]]:
        """Return list of active online devices."""
        return [d for d in self.get_unified_devices() if d.get("status") == "online" or d.get("has_active_console")]

    def get_network_summary(self) -> dict[str, Any]:
        """Produce full network inventory summary for REST and WebSocket payloads."""
        devices = self.get_unified_devices()
        local_ip = get_primary_lan_ip()
        gateway = get_default_gateway_ip()

        active_consoles = sum(1 for d in devices if d.get("has_active_console") and d.get("status") == "online")
        lan_count = sum(1 for d in devices if d.get("discovery_source") in ("lan_arp_scan", "both"))

        parts = local_ip.split(".")
        subnet = f"{parts[0]}.{parts[1]}.{parts[2]}.0/24" if len(parts) == 4 else "192.168.1.0/24"

        return {
            "devices": devices,
            "total_connected_consoles": max(active_consoles, 1 if self.active_connections else 0),
            "total_lan_devices": lan_count,
            "total_registered": len(devices),
            "local_ip": local_ip,
            "default_gateway": gateway,
            "subnet": subnet,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def broadcast_device_update(self) -> None:
        """Broadcast updated unified device list to all connected clients."""
        summary = self.get_network_summary()
        await self.broadcast({
            "type": "device_list_update",
            "devices": summary["devices"],
            "total_connected": summary["total_connected_consoles"],
            "total_lan_devices": summary["total_lan_devices"],
            "local_ip": summary["local_ip"],
            "default_gateway": summary["default_gateway"],
            "subnet": summary["subnet"]
        })

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Broadcast payload to all currently connected WebSocket clients."""
        if not self.active_connections:
            return

        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.debug(f"Failed to deliver websocket message: {e}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.active_connections.discard(dead)


# Global singleton instance
ws_manager = ConnectionManager()
