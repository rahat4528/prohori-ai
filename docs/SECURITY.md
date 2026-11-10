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
  - Unit tests in `sensors/discovery/tests/test_discovery.py` prove off-list targets are blocked.

### B. Honeypot Deception Sensor Isolation
- The **Deception Sensor** (`sensors/deception/`) is a **completely simulated decoy surface**:
  - Contains NO shell execution capabilities (zero `subprocess`, `os.system`, or `exec`).
  - Does NOT have access to host storage or backend networks.
  - Does NOT authenticate against real identity providers.
  - Returns static, synthetic authentication rejection codes (401/404) after controlled hesitations.

### C. Rate Limiter Abuse Guard Defense-in-Depth
- The **API Abuse Guard** (`sensors/ratelimiter/`) prevents volumetric denial-of-service and brute-force flooding.
- Evaluates traffic using a sliding-window algorithm, progressively escalating from temporary blocks (30s) to extended blocks (180s) for repeat offenders.

---

## 2. Human-in-the-Loop (HITL) Defense Controls & Enforcement Reality

Under NO circumstances does Prohori AI execute destructive counter-attacks or autonomous network changes:
1. Countermeasure recommendations (e.g., `FIREWALL_BLOCK_IP`, `ROTATE_DECEPTION_DECOY`, `THROTTLE_RATE_LIMIT`) are flagged strictly with `requires_human_approval = True` and status `PENDING_APPROVAL`.
2. Execution occurs ONLY when an authorized human operator clicks the **"Approve Defense"** button in the operator console.
3. Every human approval is recorded in the append-only audit trail (`audit_logs`) with the operator's identity and timestamp.
4. **Enforcement Scope:**
   - **Live In-Memory Enforcement:** Clicking "Approve Defense" immediately adds the target IP to the active API Abuse Guard denylist (`default_limiter.add_to_denylist`), intercepting subsequent requests from that IP with HTTP 429.
   - **Simulated Perimeter Firewall Enforcement:** Perimeter edge firewall drops (e.g. iptables/BGP) are simulated as structured payloads (`enforcement_policy: "PERIMETER_FIREWALL_DROP"`) intended for SIEM webhook integration, rather than directly mutating host operating system routing tables.

---

## 3. Data Sovereignty & Telemetry Handling

- **Sovereign Offline Mode (Default / Local Ollama):**
  - Zero external network connections are opened.
  - Telemetry stays strictly within the local host/on-premises.
- **Cloud LLM Mode (Optional Gemini / Groq):**
  - When cloud mode is explicitly toggled and API keys are provided: **event text, after redaction, is sent to the chosen provider over HTTPS.**
  - `analyst.redaction` sanitizes passwords, authorization bearer tokens, JWTs, and email addresses prior to sending.

---

## 4. API Authentication & Access Control (Opt-In Security)

To balance zero-friction evaluation by hackathon judges with production-grade security, Prohori implements **Opt-In API Key Authentication**:

- **Protected Endpoints:**
  - `POST /events` (Telemetry ingestion)
  - `POST /audit/approve` (Countermeasure execution)
  - `POST /sovereignty/toggle` (Cloud vs. offline mode switch)
- **Configuration:**
  - Configured via environment variable `PROHORI_API_KEY`.
  - Client header: `X-API-Key: <PROHORI_API_KEY>`
- **Behavior:**
  - **If `PROHORI_API_KEY` is UNSET:** Write endpoints allow requests without a key, facilitating immediate local testing, and the server logs a visible startup warning:
    `WARNING: PROHORI_API_KEY is not set. API write endpoints are running in UNPROTECTED DEMO MODE.`
  - **If `PROHORI_API_KEY` is SET:** Requests missing or supplying an invalid `X-API-Key` header are immediately rejected with **HTTP 401 Unauthorized**.

---

## 5. Threat Modeling & Residual Risk Disclosures

- **Prompt Injection:** Secrets and personal data are redacted before prompting; prompt injection is not fully mitigated against sophisticated adversarial inputs.
- **Audit Log Immutability:** Audit records are stored in an append-only database table (`audit_logs`). Cryptographic hash-chaining across sequential entries is a planned roadmap enhancement.
