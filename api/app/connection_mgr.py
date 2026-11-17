"""
WebSocket Connection Manager & Device Registry for Prohori AI
Broadcasts newly ingested events and tracks connected LAN/Wi-Fi devices in real-time.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger("prohori.websocket")


def parse_device_name_from_ua(user_agent: str) -> str:
    """Derive a friendly device label from the HTTP User-Agent."""
    ua = user_agent.lower()
    os_name = "Unknown Device"
    if "windows" in ua:
        os_name = "Windows PC"
    elif "android" in ua:
        os_name = "Android Device"
    elif "iphone" in ua:
        os_name = "iPhone"
    elif "ipad" in ua:
        os_name = "iPad"
    elif "macintosh" in ua or "mac os" in ua:
        os_name = "Mac"
    elif "linux" in ua:
        os_name = "Linux Host"

    browser = "Browser"
    if "edg" in ua:
        browser = "Edge"
    elif "chrome" in ua:
        browser = "Chrome"
    elif "firefox" in ua:
        browser = "Firefox"
    elif "safari" in ua:
        browser = "Safari"

    return f"{os_name} ({browser})"


class ConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()
        self.devices: dict[str, dict[str, Any]] = {}
        self.ws_to_device: dict[WebSocket, str] = {}
        self.device_to_ws: dict[str, set[WebSocket]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        client_ip: str = "127.0.0.1",
        user_agent: str = ""
    ) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected from {client_ip}. Active clients: {len(self.active_connections)}")

        # Send welcome/handshake event including current devices snapshot
        try:
            await websocket.send_json({
                "type": "connection_established",
                "message": "Connected to Prohori AI live event stream",
                "client_ip": client_ip,
                "active_clients": len(self.active_connections),
                "devices": self.get_devices(),
                "total_connected": len(self.get_active_devices())
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
        """Register or update a client device session associated with a WebSocket."""
        now_iso = datetime.now(timezone.utc).isoformat()
        if not device_id or str(device_id).strip() == "":
            device_id = f"dev_{client_ip.replace('.', '_')}"
        if not device_name or str(device_name).strip() == "":
            device_name = parse_device_name_from_ua(user_agent)

        existing = self.devices.get(device_id)
        if existing:
            existing["device_name"] = device_name
            existing["ip_address"] = client_ip
            existing["user_agent"] = user_agent
            existing["status"] = "online"
            existing["last_seen"] = now_iso
            device_record = existing
        else:
            device_record = {
                "device_id": device_id,
                "device_name": device_name,
                "ip_address": client_ip,
                "user_agent": user_agent,
                "status": "online",
                "connected_at": now_iso,
                "last_seen": now_iso,
            }
            self.devices[device_id] = device_record

        self.ws_to_device[websocket] = device_id
        if device_id not in self.device_to_ws:
            self.device_to_ws[device_id] = set()
        self.device_to_ws[device_id].add(websocket)

        logger.info(f"Device registered: {device_id} ({device_name}) from {client_ip}")

        # Broadcast live update to all connected clients
        await self.broadcast({
            "type": "device_list_update",
            "devices": self.get_devices(),
            "total_connected": len(self.get_active_devices())
        })
        return device_record

    async def register_device_http(
        self,
        device_id: str | None,
        device_name: str | None,
        client_ip: str = "127.0.0.1",
        user_agent: str = ""
    ) -> dict[str, Any]:
        """Register or update a client device session over HTTP."""
        now_iso = datetime.now(timezone.utc).isoformat()
        if not device_id or str(device_id).strip() == "":
            device_id = f"dev_{client_ip.replace('.', '_')}"
        if not device_name or str(device_name).strip() == "":
            device_name = parse_device_name_from_ua(user_agent)

        existing = self.devices.get(device_id)
        if existing:
            existing["device_name"] = device_name
            existing["ip_address"] = client_ip
            existing["user_agent"] = user_agent
            existing["status"] = "online"
            existing["last_seen"] = now_iso
            device_record = existing
        else:
            device_record = {
                "device_id": device_id,
                "device_name": device_name,
                "ip_address": client_ip,
                "user_agent": user_agent,
                "status": "online",
                "connected_at": now_iso,
                "last_seen": now_iso,
            }
            self.devices[device_id] = device_record

        await self.broadcast({
            "type": "device_list_update",
            "devices": self.get_devices(),
            "total_connected": len(self.get_active_devices())
        })
        return device_record

    async def heartbeat(self, websocket: WebSocket | None = None, device_id: str | None = None) -> None:
        """Update last seen timestamp for a device."""
        now_iso = datetime.now(timezone.utc).isoformat()
        target_id = device_id
        if not target_id and websocket:
            target_id = self.ws_to_device.get(websocket)

        if target_id and target_id in self.devices:
            self.devices[target_id]["last_seen"] = now_iso
            self.devices[target_id]["status"] = "online"

    async def disconnect(self, websocket: WebSocket) -> None:
        """Remove a disconnected WebSocket client and update device state."""
        self.active_connections.discard(websocket)
        target_id = self.ws_to_device.pop(websocket, None)
        logger.info(f"WebSocket client disconnected ({target_id}). Active clients: {len(self.active_connections)}")

        if target_id and target_id in self.device_to_ws:
            self.device_to_ws[target_id].discard(websocket)
            if not self.device_to_ws[target_id]:
                # No more active sockets for this device - mark offline
                del self.device_to_ws[target_id]
                if target_id in self.devices:
                    self.devices[target_id]["status"] = "offline"
                    self.devices[target_id]["last_seen"] = datetime.now(timezone.utc).isoformat()

                # Broadcast updated device list to remaining clients
                await self.broadcast({
                    "type": "device_list_update",
                    "devices": self.get_devices(),
                    "total_connected": len(self.get_active_devices())
                })

    def get_devices(self) -> list[dict[str, Any]]:
        """Return list of all registered devices with online first, then by last_seen desc."""
        online = [d for d in self.devices.values() if d.get("status") == "online"]
        offline = [d for d in self.devices.values() if d.get("status") != "online"]
        online.sort(key=lambda d: d.get("last_seen", ""), reverse=True)
        offline.sort(key=lambda d: d.get("last_seen", ""), reverse=True)
        return online + offline

    def get_active_devices(self) -> list[dict[str, Any]]:
        """Return list of active online devices."""
        return [d for d in self.devices.values() if d.get("status") == "online"]

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Broadcast an event payload to all currently connected clients."""
        if not self.active_connections:
            return

        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.debug(f"Failed to deliver websocket message to client: {e}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.active_connections.discard(dead)


# Global singleton instance
ws_manager = ConnectionManager()
