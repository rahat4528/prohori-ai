# Prohori AI — Security Architecture & Defensive Scope

**Strict Lab-Scoped Operations & Responsible AI Governance**

Prohori AI is engineered strictly for **defensive security monitoring** inside an organization's or university lab's own network boundary. It adheres strictly to ethical guidelines and responsible AI principles.

---

## 1. Non-Negotiable Defensive Guardrails

### A. Strict Target Allowlist Boundary
- The **Asset Discovery Sensor** (`sensors/discovery/`) CANNOT scan any host or subnet not explicitly present on the configured `TARGET_ALLOWLIST` (defaults to `127.0.0.1`, `localhost`, and internal lab RFC-1918 subnets `10.0.0.0/8`, `192.168.0.0/16`).
- **Enforcement in Code**:
  - `sensors/discovery/guard.py` evaluates all targets against IPv4/IPv6 network masks.
  - Any request targeting an off-list IP (e.g. `8.8.8.8` or any external website) is **immediately rejected with HTTP 403 Forbidden** and a security boundary violation log is written.
  - Unit tests in `sensors/discovery/tests/test_discovery.py` mathematically prove off-list targets are blocked.

### B. Honeypot Deception Sensor Isolation
- The **Deception Sensor** (`sensors/deception/`) is a **completely simulated decoy surface**:
  - Contains NO shell execution capabilities.
  - Does NOT have access to host storage or backend networks.
  - Does NOT authenticate against real identity providers.
  - Returns static, synthetic authentication rejection codes after controlled hesitations.

### C. Rate Limiter Abuse Guard Defense-in-Depth
- The **API Abuse Guard** (`sensors/ratelimiter/`) prevents volumetric denial-of-service and brute-force flooding.
- Evaluates traffic using a sliding-window algorithm, progressively escalating from temporary blocks (30s) to extended blocks (180s) for repeat offenders.

---

## 2. Human-in-the-Loop (HITL) Defense Guarantee

Under NO circumstances does Prohori AI execute destructive counter-attacks or autonomous network changes:
1. Countermeasure recommendations (e.g., `FIREWALL_BLOCK_IP`, `ROTATE_DECEPTION_DECOY`, `THROTTLE_RATE_LIMIT`) are flagged strictly with `requires_human_approval = True` and status `PENDING_APPROVAL`.
2. Execution occurs ONLY when an authorized human operator clicks the **"Approve Defense"** button in the operator console.
3. Every human approval is recorded in the append-only audit trail (`audit_logs`) with the operator's identity and timestamp.

---

## 3. Data Sovereignty & Offline Operational Guarantee

- When `DATA_SOVEREIGNTY_MODE=True`, all external cloud API calls are disabled.
- The AI SOC Analyst operates either on local **Ollama (Llama 3.2 / Qwen)** or the deterministic offline RAG engine.
- Sensitive security event logs never leave the local machine or national borders.

