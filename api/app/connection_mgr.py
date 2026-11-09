"""
WebSocket Connection Manager for Prohori AI
Broadcasts newly ingested events in real-time to operator consoles.
"""

import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger("prohori.websocket")


class ConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active clients: {len(self.active_connections)}")

        # Send welcome/handshake event
        try:
            await websocket.send_json({
                "type": "connection_established",
                "message": "Connected to Prohori AI live event stream",
                "active_clients": len(self.active_connections)
            })
        except Exception:
            pass

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a disconnected WebSocket client."""
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Broadcast an event payload to all currently connected clients."""
        if not self.active_connections:
            return

        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.debug(f"Failed to deliver websocket message to client: {e}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.active_connections.discard(dead)


# Global singleton instance
ws_manager = ConnectionManager()

