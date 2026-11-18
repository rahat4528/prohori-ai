"""
Prohori AI - LAN & Wi-Fi Network Asset Discovery Engine
Provides real-time discovery of live physical & virtual devices on the local subnet (ARP / TCP-UDP probes),
resolves MAC OUI hardware manufacturers offline (air-gapped), detects default gateways,
and correlates LAN assets with active operator web console sessions.
"""

import asyncio
import ipaddress
import logging
import os
import re
import socket
import subprocess
from datetime import UTC, datetime
from typing import Any

logger = logging.getLogger("prohori.discovery.network")

# Top IEEE OUI Manufacturer Database (100% offline air-gapped identification)
OUI_DATABASE: dict[str, tuple[str, str]] = {
    # Apple (iPhone, iPad, Mac, Apple Watch)
    "00:17:F2": ("Apple, Inc.", "laptop"),
    "00:1C:B3": ("Apple, Inc.", "laptop"),
    "00:23:12": ("Apple, Inc.", "laptop"),
    "00:25:00": ("Apple, Inc.", "laptop"),
    "00:26:08": ("Apple, Inc.", "laptop"),
    "04:0C:CE": ("Apple, Inc.", "mobile"),
    "04:15:52": ("Apple, Inc.", "mobile"),
    "04:54:53": ("Apple, Inc.", "mobile"),
    "10:93:E9": ("Apple, Inc.", "mobile"),
    "18:AF:61": ("Apple, Inc.", "mobile"),
    "20:A2:E4": ("Apple, Inc.", "mobile"),
    "28:CF:E9": ("Apple, Inc.", "mobile"),
    "3C:07:54": ("Apple, Inc.", "mobile"),
    "40:A6:D9": ("Apple, Inc.", "mobile"),
    "44:FB:42": ("Apple, Inc.", "mobile"),
    "48:D7:05": ("Apple, Inc.", "mobile"),
    "50:BC:96": ("Apple, Inc.", "mobile"),
    "60:03:08": ("Apple, Inc.", "mobile"),
    "64:20:0C": ("Apple, Inc.", "mobile"),
    "70:11:24": ("Apple, Inc.", "mobile"),
    "78:7B:8A": ("Apple, Inc.", "mobile"),
    "80:E6:50": ("Apple, Inc.", "mobile"),
    "84:38:35": ("Apple, Inc.", "mobile"),
    "88:66:5A": ("Apple, Inc.", "mobile"),
    "8C:85:90": ("Apple, Inc.", "mobile"),
    "90:FD:61": ("Apple, Inc.", "mobile"),
    "94:E9:6A": ("Apple, Inc.", "mobile"),
    "98:01:A7": ("Apple, Inc.", "mobile"),
    "9C:20:7B": ("Apple, Inc.", "mobile"),
    "A4:83:E7": ("Apple, Inc.", "mobile"),
    "AC:BC:32": ("Apple, Inc.", "mobile"),
    "B0:65:BD": ("Apple, Inc.", "mobile"),
    "B4:18:D1": ("Apple, Inc.", "mobile"),
    "B8:78:26": ("Apple, Inc.", "mobile"),
    "BC:52:B7": ("Apple, Inc.", "mobile"),
    "C0:F2:FB": ("Apple, Inc.", "mobile"),
    "C8:69:CD": ("Apple, Inc.", "mobile"),
    "D0:03:4B": ("Apple, Inc.", "mobile"),
    "D4:9A:20": ("Apple, Inc.", "mobile"),
    "DC:A9:04": ("Apple, Inc.", "mobile"),
    "E0:B9:BA": ("Apple, Inc.", "mobile"),
    "E4:CE:8F": ("Apple, Inc.", "mobile"),
    "F0:18:98": ("Apple, Inc.", "mobile"),
    "F4:0F:24": ("Apple, Inc.", "mobile"),
    "F8:38:80": ("Apple, Inc.", "mobile"),
    "FC:66:CF": ("Apple, Inc.", "mobile"),
    "FC:FC:48": ("Apple, Inc.", "mobile"),

    # Samsung Electronics (Galaxy Smartphones, Tablets, Smart TVs)
    "00:07:AB": ("Samsung Electronics", "mobile"),
    "00:12:47": ("Samsung Electronics", "mobile"),
    "00:15:99": ("Samsung Electronics", "mobile"),
    "00:21:19": ("Samsung Electronics", "mobile"),
    "00:23:D7": ("Samsung Electronics", "mobile"),
    "00:26:37": ("Samsung Electronics", "mobile"),
    "04:18:0F": ("Samsung Electronics", "mobile"),
    "08:D4:2B": ("Samsung Electronics", "mobile"),
    "08:EE:8B": ("Samsung Electronics", "mobile"),
    "14:49:E0": ("Samsung Electronics", "mobile"),
    "18:67:B0": ("Samsung Electronics", "mobile"),
    "18:83:BF": ("Samsung Electronics", "mobile"),
    "24:4B:FE": ("Samsung Electronics", "mobile"),
    "28:9A:4B": ("Samsung Electronics", "mobile"),
    "2C:AE:2B": ("Samsung Electronics", "mobile"),
    "30:07:4D": ("Samsung Electronics", "mobile"),
    "34:23:BA": ("Samsung Electronics", "mobile"),
    "38:0B:40": ("Samsung Electronics", "mobile"),
    "3C:62:00": ("Samsung Electronics", "mobile"),
    "44:80:EB": ("Samsung Electronics", "mobile"),
    "50:01:D9": ("Samsung Electronics", "mobile"),
    "54:92:BE": ("Samsung Electronics", "mobile"),
    "5C:E8:EB": ("Samsung Electronics", "mobile"),
    "60:6C:66": ("Samsung Electronics", "mobile"),
    "68:27:37": ("Samsung Electronics", "mobile"),
    "78:47:1D": ("Samsung Electronics", "mobile"),
    "88:75:56": ("Samsung Electronics", "mobile"),
    "90:18:7C": ("Samsung Electronics", "mobile"),
    "94:35:0A": ("Samsung Electronics", "mobile"),
    "A0:82:1F": ("Samsung Electronics", "mobile"),
    "A8:9F:BA": ("Samsung Electronics", "mobile"),
    "B0:C5:54": ("Samsung Electronics", "mobile"),
    "B8:5E:7B": ("Samsung Electronics", "mobile"),
    "BC:D0:74": ("Samsung Electronics", "mobile"),
    "C4:42:02": ("Samsung Electronics", "mobile"),
    "D0:17:6A": ("Samsung Electronics", "mobile"),
    "D4:E6:B7": ("Samsung Electronics", "mobile"),
    "E4:E0:C5": ("Samsung Electronics", "mobile"),
    "EC:1F:72": ("Samsung Electronics", "mobile"),
    "F4:7B:5E": ("Samsung Electronics", "mobile"),
    "F8:3F:51": ("Samsung Electronics", "mobile"),

    # Intel Corporate (Laptops, Desktops, NUCs, Wi-Fi Cards)
    "00:02:B3": ("Intel Corporate", "laptop"),
    "00:03:47": ("Intel Corporate", "laptop"),
    "00:0E:0C": ("Intel Corporate", "laptop"),
    "00:13:02": ("Intel Corporate", "laptop"),
    "00:13:E8": ("Intel Corporate", "laptop"),
    "00:15:00": ("Intel Corporate", "laptop"),
    "00:1E:67": ("Intel Corporate", "laptop"),
    "00:21:5C": ("Intel Corporate", "laptop"),
    "00:24:D7": ("Intel Corporate", "laptop"),
    "00:27:10": ("Intel Corporate", "laptop"),
    "04:ED:33": ("Intel Corporate", "laptop"),
    "08:11:96": ("Intel Corporate", "laptop"),
    "0C:8B:FD": ("Intel Corporate", "laptop"),
    "10:02:B5": ("Intel Corporate", "laptop"),
    "2C:DB:07": ("Intel Corporate", "laptop"),
    "34:13:E8": ("Intel Corporate", "laptop"),
    "3C:52:82": ("Intel Corporate", "laptop"),
    "40:EC:99": ("Intel Corporate", "laptop"),
    "48:51:B7": ("Intel Corporate", "laptop"),
    "4C:79:6E": ("Intel Corporate", "laptop"),
    "50:7B:9D": ("Intel Corporate", "laptop"),
    "54:14:F3": ("Intel Corporate", "laptop"),
    "58:94:6B": ("Intel Corporate", "laptop"),
    "5C:87:9C": ("Intel Corporate", "laptop"),
    "60:57:18": ("Intel Corporate", "laptop"),
    "64:00:6A": ("Intel Corporate", "laptop"),
    "68:05:CA": ("Intel Corporate", "laptop"),
    "6C:29:95": ("Intel Corporate", "laptop"),
    "70:CD:60": ("Intel Corporate", "laptop"),
    "74:70:FD": ("Intel Corporate", "laptop"),
    "78:2B:46": ("Intel Corporate", "laptop"),
    "7C:57:58": ("Intel Corporate", "laptop"),
    "80:86:F2": ("Intel Corporate", "laptop"),
    "84:A9:3E": ("Intel Corporate", "laptop"),
    "88:AE:DD": ("Intel Corporate", "laptop"),
    "8C:EC:4B": ("Intel Corporate", "laptop"),
    "90:2E:16": ("Intel Corporate", "laptop"),
    "94:E6:F7": ("Intel Corporate", "laptop"),
    "98:4F:EE": ("Intel Corporate", "laptop"),
    "9C:B6:54": ("Intel Corporate", "laptop"),
    "A4:4C:C8": ("Intel Corporate", "laptop"),
    "A8:60:B6": ("Intel Corporate", "laptop"),
    "AC:67:84": ("Intel Corporate", "laptop"),
    "B0:35:9F": ("Intel Corporate", "laptop"),
    "B4:96:91": ("Intel Corporate", "laptop"),
    "B8:85:84": ("Intel Corporate", "laptop"),
    "BC:0F:64": ("Intel Corporate", "laptop"),
    "C0:18:85": ("Intel Corporate", "laptop"),
    "C4:0D:CB": ("Intel Corporate", "laptop"),
    "C8:F7:50": ("Intel Corporate", "laptop"),
    "CC:96:E5": ("Intel Corporate", "laptop"),
    "D4:3B:04": ("Intel Corporate", "laptop"),
    "D8:F8:83": ("Intel Corporate", "laptop"),
    "DC:53:60": ("Intel Corporate", "laptop"),
    "E0:D5:5E": ("Intel Corporate", "laptop"),
    "E8:2A:44": ("Intel Corporate", "laptop"),
    "EC:F4:BB": ("Intel Corporate", "laptop"),
    "F0:D5:BF": ("Intel Corporate", "laptop"),
    "F4:6D:04": ("Intel Corporate", "laptop"),
    "F8:75:A4": ("Intel Corporate", "laptop"),

    # TP-Link Systems (Wi-Fi Routers, Access Points, Extenders)
    "00:0A:EB": ("TP-Link Systems Inc.", "router"),
    "00:14:78": ("TP-Link Systems Inc.", "router"),
    "00:19:E0": ("TP-Link Systems Inc.", "router"),
    "00:1D:0F": ("TP-Link Systems Inc.", "router"),
    "00:21:27": ("TP-Link Systems Inc.", "router"),
    "00:23:CD": ("TP-Link Systems Inc.", "router"),
    "00:25:86": ("TP-Link Systems Inc.", "router"),
    "10:27:F5": ("TP-Link Systems Inc.", "router"),
    "10:5A:95": ("TP-Link Systems Inc.", "router"),
    "14:75:90": ("TP-Link Systems Inc.", "router"),
    "14:CC:20": ("TP-Link Systems Inc.", "router"),
    "14:CF:92": ("TP-Link Systems Inc.", "router"),
    "18:A6:F7": ("TP-Link Systems Inc.", "router"),
    "1C:3B:F3": ("TP-Link Systems Inc.", "router"),
    "20:0C:C8": ("TP-Link Systems Inc.", "router"),
    "30:DE:4B": ("TP-Link Systems Inc.", "router"),
    "34:96:72": ("TP-Link Systems Inc.", "router"),
    "3C:46:D8": ("TP-Link Systems Inc.", "router"),
    "40:3F:8C": ("TP-Link Systems Inc.", "router"),
    "50:3A:A0": ("TP-Link Systems Inc.", "router"),
    "50:C7:BF": ("TP-Link Systems Inc.", "router"),
    "50:D4:F7": ("TP-Link Systems Inc.", "router"),
    "54:AF:97": ("TP-Link Systems Inc.", "router"),
    "54:C8:0F": ("TP-Link Systems Inc.", "router"),
    "5C:63:BF": ("TP-Link Systems Inc.", "router"),
    "60:32:B1": ("TP-Link Systems Inc.", "router"),
    "64:56:01": ("TP-Link Systems Inc.", "router"),
    "64:66:B3": ("TP-Link Systems Inc.", "router"),
    "64:70:02": ("TP-Link Systems Inc.", "router"),
    "6C:5A:B0": ("TP-Link Systems Inc.", "router"),
    "70:4F:57": ("TP-Link Systems Inc.", "router"),
    "74:05:A5": ("TP-Link Systems Inc.", "router"),
    "74:EA:3A": ("TP-Link Systems Inc.", "router"),
    "78:8C:54": ("TP-Link Systems Inc.", "router"),
    "7C:8B:CA": ("TP-Link Systems Inc.", "router"),
    "84:16:F9": ("TP-Link Systems Inc.", "router"),
    "84:D8:1B": ("TP-Link Systems Inc.", "router"),
    "8C:21:0A": ("TP-Link Systems Inc.", "router"),
    "90:F6:52": ("TP-Link Systems Inc.", "router"),
    "94:08:53": ("TP-Link Systems Inc.", "router"),
    "98:25:4A": ("TP-Link Systems Inc.", "router"),
    "9C:A6:15": ("TP-Link Systems Inc.", "router"),
    "A0:F3:C1": ("TP-Link Systems Inc.", "router"),
    "A4:2B:B0": ("TP-Link Systems Inc.", "router"),
    "AC:84:C6": ("TP-Link Systems Inc.", "router"),
    "B0:4E:26": ("TP-Link Systems Inc.", "router"),
    "B0:95:75": ("TP-Link Systems Inc.", "router"),
    "BC:46:99": ("TP-Link Systems Inc.", "router"),
    "C0:06:C3": ("TP-Link Systems Inc.", "router"),
    "C0:25:E9": ("TP-Link Systems Inc.", "router"),
    "C0:4A:00": ("TP-Link Systems Inc.", "router"),
    "C4:6E:1F": ("TP-Link Systems Inc.", "router"),
    "C8:3A:35": ("TP-Link Systems Inc.", "router"),
    "CC:32:E5": ("TP-Link Systems Inc.", "router"),
    "CC:34:29": ("TP-Link Systems Inc.", "router"),
    "D4:6E:0E": ("TP-Link Systems Inc.", "router"),
    "D8:0D:17": ("TP-Link Systems Inc.", "router"),
    "D8:47:32": ("TP-Link Systems Inc.", "router"),
    "DC:56:E7": ("TP-Link Systems Inc.", "router"),
    "E4:C3:2A": ("TP-Link Systems Inc.", "router"),
    "EC:08:6B": ("TP-Link Systems Inc.", "router"),
    "EC:17:2F": ("TP-Link Systems Inc.", "router"),
    "F4:F2:6D": ("TP-Link Systems Inc.", "router"),
    "F8:1A:67": ("TP-Link Systems Inc.", "router"),
    "F8:D1:11": ("TP-Link Systems Inc.", "router"),

    # Realtek Semiconductor (Network Adapters / Motherboards)
    "00:07:32": ("Realtek Semiconductor", "laptop"),
    "00:0B:2F": ("Realtek Semiconductor", "laptop"),
    "00:14:D1": ("Realtek Semiconductor", "laptop"),
    "00:E0:4C": ("Realtek Semiconductor", "laptop"),
    "04:7D:7B": ("Realtek Semiconductor", "laptop"),
    "10:65:30": ("Realtek Semiconductor", "laptop"),
    "14:DD:A9": ("Realtek Semiconductor", "laptop"),
    "20:76:93": ("Realtek Semiconductor", "laptop"),
    "2C:56:DC": ("Realtek Semiconductor", "laptop"),
    "38:D5:47": ("Realtek Semiconductor", "laptop"),
    "40:16:7E": ("Realtek Semiconductor", "laptop"),
    "44:8A:5B": ("Realtek Semiconductor", "laptop"),
    "48:5D:60": ("Realtek Semiconductor", "laptop"),
    "50:3E:AA": ("Realtek Semiconductor", "laptop"),
    "54:04:A6": ("Realtek Semiconductor", "laptop"),
    "6C:F0:49": ("Realtek Semiconductor", "laptop"),
    "74:D0:2B": ("Realtek Semiconductor", "laptop"),
    "80:3F:5D": ("Realtek Semiconductor", "laptop"),
    "9C:14:63": ("Realtek Semiconductor", "laptop"),
    "A0:B3:CC": ("Realtek Semiconductor", "laptop"),
    "B4:2E:99": ("Realtek Semiconductor", "laptop"),
    "C8:D3:FF": ("Realtek Semiconductor", "laptop"),
    "D8:5E:D3": ("Realtek Semiconductor", "laptop"),
    "F8:E4:3B": ("Realtek Semiconductor", "laptop"),

    # Google (Pixel, Nest, Chromecast, Home)
    "00:1A:11": ("Google, Inc.", "mobile"),
    "3C:5A:37": ("Google, Inc.", "iot"),
    "54:60:09": ("Google, Inc.", "iot"),
    "58:20:B1": ("Google, Inc.", "iot"),
    "60:45:BD": ("Google, Inc.", "iot"),
    "94:EB:CD": ("Google, Inc.", "mobile"),
    "A4:77:33": ("Google, Inc.", "iot"),
    "D8:6C:63": ("Google, Inc.", "iot"),
    "E4:F0:42": ("Google, Inc.", "mobile"),
    "F8:8F:C2": ("Google, Inc.", "mobile"),

    # Microsoft (Surface, Xbox, Windows Virtual Adapters)
    "00:15:5D": ("Microsoft Hyper-V", "server"),
    "00:17:FA": ("Microsoft Surface", "laptop"),
    "00:50:F2": ("Microsoft Surface", "laptop"),
    "28:16:A8": ("Microsoft Surface", "laptop"),
    "7C:1E:52": ("Microsoft Surface", "laptop"),
    "DC:B4:C4": ("Microsoft Surface", "laptop"),
    "F4:39:09": ("Microsoft Surface", "laptop"),

    # Raspberry Pi Foundation
    "28:CD:C1": ("Raspberry Pi Foundation", "iot"),
    "B8:27:EB": ("Raspberry Pi Foundation", "iot"),
    "D8:3A:DD": ("Raspberry Pi Foundation", "iot"),
    "DC:A6:32": ("Raspberry Pi Foundation", "iot"),
    "E4:5F:01": ("Raspberry Pi Foundation", "iot"),

    # Espressif Systems (Smart Home IoT, ESP32, ESP8266)
    "18:FE:34": ("Espressif IoT", "iot"),
    "24:0A:C4": ("Espressif IoT", "iot"),
    "24:62:AB": ("Espressif IoT", "iot"),
    "24:6F:28": ("Espressif IoT", "iot"),
    "24:A1:60": ("Espressif IoT", "iot"),
    "24:B2:DE": ("Espressif IoT", "iot"),
    "30:AE:A4": ("Espressif IoT", "iot"),
    "3C:71:BF": ("Espressif IoT", "iot"),
    "48:3F:DA": ("Espressif IoT", "iot"),
    "5C:CF:7F": ("Espressif IoT", "iot"),
    "60:01:94": ("Espressif IoT", "iot"),
    "84:0D:8E": ("Espressif IoT", "iot"),
    "84:F3:EB": ("Espressif IoT", "iot"),
    "A4:CF:12": ("Espressif IoT", "iot"),
    "AC:D0:74": ("Espressif IoT", "iot"),
    "BC:DD:C2": ("Espressif IoT", "iot"),
    "C4:4F:33": ("Espressif IoT", "iot"),
    "C8:2B:96": ("Espressif IoT", "iot"),
    "CC:50:E3": ("Espressif IoT", "iot"),
    "DC:4F:22": ("Espressif IoT", "iot"),
}


def is_locally_administered_mac(mac: str) -> bool:
    """Detect if MAC address is locally administered (IEEE 802 randomized privacy address used by iOS & Android)."""
    try:
        first_byte = int(mac.replace("-", ":").split(":")[0], 16)
        return (first_byte & 0x02) != 0
    except Exception:
        return False


def resolve_mac_vendor_and_type(mac: str, is_gateway: bool = False) -> tuple[str, str]:
    """Offline IEEE OUI lookup returning (manufacturer_name, device_type_hint)."""
    if is_gateway:
        return ("Wi-Fi Router / Default Gateway", "router")

    clean = mac.replace("-", ":").upper()
    prefix = clean[:8]

    if prefix in OUI_DATABASE:
        return OUI_DATABASE[prefix]

    if is_locally_administered_mac(clean):
        return ("Private / Randomized MAC (iOS/Android Privacy)", "mobile")

    return ("Generic Network Host", "laptop")


def get_primary_lan_ip() -> str:
    """Return host's primary non-loopback IPv4 address on LAN."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Does not actually transmit packets
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def get_default_gateway_ip() -> str | None:
    """Find default gateway IP (Wi-Fi router) from OS routing table."""
    try:
        if os.name == "nt":
            output = subprocess.check_output(["route", "print", "0.0.0.0"], text=True, errors="ignore")
            for line in output.splitlines():
                line = line.strip()
                if line.startswith("0.0.0.0"):
                    parts = line.split()
                    if len(parts) >= 3 and parts[2].count(".") == 3:
                        return parts[2]
        else:
            output = subprocess.check_output(["ip", "route", "show", "default"], text=True, errors="ignore")
            m = re.search(r"default via ([0-9.]+)", output)
            if m:
                return m.group(1)
    except Exception as e:
        logger.debug(f"Could not determine default gateway: {e}")
    return None


def get_host_device_info() -> dict[str, Any]:
    """Return local host machine identity."""
    local_ip = get_primary_lan_ip()
    hostname = socket.gethostname()
    return {
        "ip": local_ip,
        "hostname": hostname,
        "device_name": f"{hostname} (Host Server)",
        "device_type": "server"
    }


def parse_system_arp_table() -> list[dict[str, str]]:
    """Parse ARP entries from the OS kernel ARP table."""
    try:
        output = subprocess.check_output(["arp", "-a"], text=True, errors="ignore")
    except Exception as e:
        logger.warning(f"Failed to execute arp -a: {e}")
        return []

    entries = []
    current_iface = None
    for line in output.splitlines():
        line = line.strip()
        if "Interface:" in line:
            m = re.search(r"Interface:\s+([0-9.]+)", line)
            if m:
                current_iface = m.group(1)
        elif line:
            m = re.match(r"([0-9]{1,3}(?:\.[0-9]{1,3}){3})\s+([0-9a-fA-F]{2}(?:[:-][0-9a-fA-F]{2}){5})\s+(\w+)", line)
            if m:
                ip, mac, arp_type = m.group(1), m.group(2).replace(":", "-").upper(), m.group(3).lower()
                try:
                    ip_obj = ipaddress.ip_address(ip)
                    # Exclude multicast and broadcast
                    if ip_obj.is_multicast or ip.endswith(".255") or ip == "255.255.255.255" or mac == "FF-FF-FF-FF-FF-FF":
                        continue
                    entries.append({
                        "interface": current_iface or "",
                        "ip": ip,
                        "mac": mac,
                        "type": arp_type
                    })
                except Exception:
                    pass
    return entries


async def sweep_local_subnet(subnet_prefix: str = "", timeout: float = 0.20) -> list[str]:
    """
    Rapidly sweep the local /24 subnet using non-invasive UDP/TCP probes.
    This prompts the OS kernel to refresh the local ARP cache table so all active devices appear.
    """
    if not subnet_prefix:
        local_ip = get_primary_lan_ip()
        parts = local_ip.split(".")
        if len(parts) == 4 and parts[0] in ("192", "10", "172"):
            subnet_prefix = f"{parts[0]}.{parts[1]}.{parts[2]}"
        else:
            subnet_prefix = "192.168.1"

    loop = asyncio.get_running_loop()

    async def probe_single(target_ip: str):
        # 1. Send UDP packet to trigger kernel ARP lookup
        try:
            s_udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s_udp.setblocking(False)
            s_udp.sendto(b"", (target_ip, 5353))
            s_udp.close()
        except Exception:
            pass

        # 2. Fast TCP connect to common service ports (80 HTTP, 445 SMB)
        for port in (80, 445):
            s_tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s_tcp.setblocking(False)
            try:
                await asyncio.wait_for(loop.sock_connect(s_tcp, (target_ip, port)), timeout=timeout)
                s_tcp.close()
                return target_ip
            except Exception:
                s_tcp.close()
        return None

    tasks = [probe_single(f"{subnet_prefix}.{i}") for i in range(1, 255)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if isinstance(r, str) and r]


async def test_ip_reachability(ip: str, timeout: float = 0.3) -> bool:
    """Test whether an IP address is actively reachable right now."""
    loop = asyncio.get_running_loop()
    for port in (80, 443, 445, 8080, 53):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setblocking(False)
        try:
            await asyncio.wait_for(loop.sock_connect(s, (ip, port)), timeout=timeout)
            s.close()
            return True
        except Exception:
            s.close()
    return False


async def discover_lan_endpoints() -> list[dict[str, Any]]:
    """
    Perform a complete, honest LAN discovery pass.
    Refreshes ARP cache, resolves hostnames, and identifies vendors for all devices.
    """
    local_info = get_host_device_info()
    local_ip = local_info["ip"]
    gateway_ip = get_default_gateway_ip()

    # Step 1: Rapid subnet sweep to prompt ARP population
    try:
        await sweep_local_subnet()
    except Exception as e:
        logger.debug(f"Subnet sweep error: {e}")

    # Step 2: Read OS ARP table
    arp_entries = parse_system_arp_table()
    discovered: list[dict[str, Any]] = []
    seen_ips: set[str] = set()

    # Always include the Host Server machine itself
    discovered.append({
        "device_id": f"host_{local_ip.replace('.', '_')}",
        "device_name": local_info["device_name"],
        "ip_address": local_ip,
        "mac_address": "HOST_INTERFACE",
        "mac_vendor": "Host Operating System",
        "device_type": "server",
        "discovery_source": "lan_arp_scan",
        "status": "reachable",
        "is_local_host": True,
        "is_gateway": False,
        "has_active_console": False,
        "last_seen": datetime.now(UTC).isoformat()
    })
    seen_ips.add(local_ip)

    # Process ARP entries
    for entry in arp_entries:
        ip = entry["ip"]
        if ip in seen_ips:
            continue
        seen_ips.add(ip)

        mac = entry["mac"]
        is_gw = (ip == gateway_ip)

        # Hostname resolution
        hostname = ""
        try:
            host_tuple = socket.gethostbyaddr(ip)
            hostname = host_tuple[0]
        except Exception:
            pass

        vendor, dev_type = resolve_mac_vendor_and_type(mac, is_gateway=is_gw)

        if is_gw:
            device_name = f"Router / Default Gateway ({vendor})"
        elif hostname:
            device_name = f"{hostname} ({vendor})"
        else:
            device_name = f"{vendor} Device"

        discovered.append({
            "device_id": f"lan_{ip.replace('.', '_')}",
            "device_name": device_name,
            "ip_address": ip,
            "mac_address": mac,
            "mac_vendor": vendor,
            "device_type": dev_type,
            "discovery_source": "lan_arp_scan",
            "status": "reachable" if is_gw else "detected",
            "is_local_host": False,
            "is_gateway": is_gw,
            "has_active_console": False,
            "last_seen": datetime.now(UTC).isoformat()
        })

    return discovered
