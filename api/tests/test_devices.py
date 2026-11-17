"""
Tests for Connected Device Discovery and Real-Time Tracking
"""

import os
import pytest
from starlette.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from app.main import app
from app.connection_mgr import ws_manager


def test_device_rest_endpoints():
    """Verify GET /devices and POST /devices/register."""
    with TestClient(app) as client:
        # Initial list
        res = client.get("/devices")
        assert res.status_code == 200
        data = res.json()
        assert "devices" in data
        assert "total_connected" in data

        # Register a device over HTTP
        reg_payload = {
            "device_id": "test_phone_001",
            "device_name": "Samsung Galaxy S24 (Chrome Mobile)",
            "user_agent": "Mozilla/5.0 (Linux; Android 14; SM-S928B)"
        }
        post_res = client.post("/devices/register", json=reg_payload)
        assert post_res.status_code == 200
        post_data = post_res.json()
        assert post_data["status"] == "ok"
        assert post_data["device"]["device_id"] == "test_phone_001"
        assert post_data["device"]["status"] == "online"

        # Verify device appears in GET /devices
        list_res = client.get("/devices")
        assert list_res.status_code == 200
        list_data = list_res.json()
        ids = [d["device_id"] for d in list_data["devices"]]
        assert "test_phone_001" in ids


def test_device_websocket_lifecycle():
    """Verify WebSocket device registration, real-time broadcast, and disconnect."""
    with TestClient(app) as client:
        with client.websocket_connect("/stream") as ws1:
            # Step 1: Handshake
            handshake = ws1.receive_json()
            assert handshake["type"] == "connection_established"
            assert "devices" in handshake

            # Step 2: Register device via WebSocket
            ws1.send_json({
                "type": "register_device",
                "device_id": "laptop_client_42",
                "device_name": "ThinkPad X1 (Windows Chrome)",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            })

            # Client receives broadcasted device_list_update
            update_msg = ws1.receive_json()
            assert update_msg["type"] == "device_list_update"
            device_ids = [d["device_id"] for d in update_msg["devices"]]
            assert "laptop_client_42" in device_ids
            registered_device = next(d for d in update_msg["devices"] if d["device_id"] == "laptop_client_42")
            assert registered_device["status"] == "online"
            assert registered_device["device_name"] == "ThinkPad X1 (Windows Chrome)"

            # Step 3: Connect a second device in parallel
            with client.websocket_connect("/stream") as ws2:
                ws2_handshake = ws2.receive_json()
                assert ws2_handshake["type"] == "connection_established"

                ws2.send_json({
                    "type": "register_device",
                    "device_id": "ipad_pro_108",
                    "device_name": "iPad Pro (Safari)",
                    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
                })

                # ws2 receives device_list_update
                ws2_update = ws2.receive_json()
                assert ws2_update["type"] == "device_list_update"
                assert any(d["device_id"] == "ipad_pro_108" for d in ws2_update["devices"])

                # ws1 also receives the real-time broadcast of ws2 connecting!
                ws1_heard = ws1.receive_json()
                assert ws1_heard["type"] == "device_list_update"
                assert any(d["device_id"] == "ipad_pro_108" for d in ws1_heard["devices"])

            # Step 4: After ws2 disconnects, ws1 receives broadcast that ws2 is offline
            ws1_disconnect_msg = ws1.receive_json()
            assert ws1_disconnect_msg["type"] == "device_list_update"
            offline_dev = next((d for d in ws1_disconnect_msg["devices"] if d["device_id"] == "ipad_pro_108"), None)
            assert offline_dev is not None
            assert offline_dev["status"] == "offline"
