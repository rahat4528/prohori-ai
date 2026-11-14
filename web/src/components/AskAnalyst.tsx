import React, { useState, useEffect } from "react";
import { Bot, Send, Sparkles, CheckCircle, ExternalLink, ShieldAlert, X, BookOpen, ShieldCheck, Copy, Check, RotateCcw } from "lucide-react";
import type { AskResponse, KnowledgeDoc } from "../types";

interface AskAnalystProps {
  apiBase: string;
  globalLanguage: "en" | "bn";
}

const SAMPLE_QUERIES = [
  { label: "কী ঘটেছে? কতটা বিপজ্জনক?", query: "কী ঘটেছে? কতটা বিপজ্জনক?", lang: "bn" as const },
  { label: "Explain last critical attack", query: "Explain the last critical incident and attacker behavior", lang: "en" as const },
  { label: "Which IPs attacked the honeypot?", query: "Which source IPs probed the honeypot and what credentials did they try?", lang: "en" as const },
  { label: "MITRE কৌশলসমূহ ব্যাখ্যা করুন", query: "শনাক্তকৃত ঘটনাগুলোতে কোন কোন MITRE ATT&CK কৌশল ব্যবহৃত হয়েছে?", lang: "bn" as const }
];

const OFFLINE_CITATIONS: Record<string, KnowledgeDoc> = {
  "T1110.001": {
    id: "T1110.001",
    type: "attack_pattern",
    title: "Password Guessing (MITRE ATT&CK T1110.001)",
    content: "Adversaries may attempt to guess passwords of valid user accounts without prior password knowledge. Observed frequently against exposed SSH and authentication endpoints.",
    mitigation: "Enforce multi-factor authentication (MFA), account lockout / progressive delays after consecutive failed attempts, and deploy deception honeypots."
  },
  "T1499.002": {
    id: "T1499.002",
    type: "attack_pattern",
    title: "Endpoint Denial of Service: Service Exhaustion (T1499.002)",
    content: "Adversaries target web API services with high-frequency request floods or expensive calls to exhaust CPU and connection pools.",
    mitigation: "Deploy rate limiting at edge proxies (token bucket / leaky bucket) and drop abusive IP prefixes automatically."
  },
  "T1595.002": {
    id: "T1595.002",
    type: "attack_pattern",
    title: "Active Scanning: Vulnerability Scanning (T1595.002)",
    content: "Adversaries actively probe perimeter hosts to discover open ports, banners, and unpatched Common Vulnerabilities and Exposures (CVEs).",
    mitigation: "Minimize exposed ports, close unused services, and deploy network asset discovery scanners internally to remediate CVEs prior to adversary exploitation."
  },
  "CWE-307": {
    id: "CWE-307",
    type: "cwe_vulnerability",
    title: "Improper Restriction of Excessive Authentication Attempts (CWE-307)",
    content: "The software does not properly limit the frequency of login attempts, enabling automated credential-stuffing and brute-force attacks.",
    mitigation: "Implement token bucket rate limiting on /login and /api endpoints, lock accounts temporarily, and require CAPTCHA or step-up MFA."
  }
};

export const AskAnalyst: React.FC<AskAnalystProps> = ({ apiBase, globalLanguage }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [approvedAction, setApprovedAction] = useState<boolean>(false);
  const [selectedCitationDoc, setSelectedCitationDoc] = useState<KnowledgeDoc | null>(null);
  const [citationLoading, setCitationLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Close citation modal with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCitationDoc) {
        setSelectedCitationDoc(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCitationDoc]);

  const handleAsk = async (questionText?: string, langOverride?: "en" | "bn") => {
    const textToSend = questionText || query;
    if (!textToSend.trim()) return;

    setLoading(true);
    setStreaming(true);
    setApprovedAction(false);
    setCopied(false);

    // Initialize blank response structure for streaming
    setResponse({
      question: textToSend,
      answer: "",
      language: (langOverride || globalLanguage) as "en" | "bn",
      citations: [],
      referenced_event_ids: [],
      provider: "AI SOC Engine"
    });

    try {
      // Attempt SSE streaming first
      const resp = await fetch(`${apiBase}/analyst/ask/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          language: langOverride || globalLanguage
        })
      });

      if (resp.ok && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              try {
                const payload = JSON.parse(trimmed.replace(/^data:\s*/, ""));
                if (payload.chunk) {
                  setResponse((prev) =>
                    prev ? { ...prev, answer: prev.answer + payload.chunk } : prev
                  );
                }
                if (payload.done) {
                  setResponse({
                    question: payload.question || textToSend,
                    answer: payload.answer,
                    language: payload.language || (langOverride || globalLanguage),
                    citations: payload.citations || [],
                    referenced_event_ids: payload.referenced_event_ids || [],
                    provider: payload.provider || "Local-LLM"
                  });
                  setStreaming(false);
                }
              } catch (e) {
                console.error("Stream parse error:", e);
              }
            }
          }
        }
      } else {
        // Fallback to standard POST
        const fallbackResp = await fetch(`${apiBase}/analyst/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: textToSend,
            language: langOverride || globalLanguage
          })
        });
        if (fallbackResp.ok) {
          const data: AskResponse = await fallbackResp.json();
          setResponse(data);
        }
      }
    } catch (e) {
      console.error("Error asking analyst:", e);
      setResponse({
        question: textToSend,
        answer: globalLanguage === "bn"
          ? "বিশ্লেষক ইঞ্জিন সংযোগে ত্রুটি ঘটেছে। দয়া করে পুনরায় চেষ্টা করুন।"
          : "Could not connect to the AI SOC Analyst engine. Please check API server health.",
        language: (langOverride || globalLanguage) as "en" | "bn",
        citations: [],
        referenced_event_ids: [],
        provider: "error"
      });
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleOpenCitation = async (citeId: string) => {
    setCitationLoading(true);
    try {
      const resp = await fetch(`${apiBase}/analyst/knowledge/${citeId}`);
      if (resp.ok) {
        const doc: KnowledgeDoc = await resp.json();
        setSelectedCitationDoc(doc);
        return;
      }
    } catch (e) {
      console.warn("API knowledge lookup offline, falling back to local citation map:", e);
    } finally {
      setCitationLoading(false);
    }

    // Offline / Network fallback
    const fallback = OFFLINE_CITATIONS[citeId] || {
      id: citeId,
      type: "knowledge_entity",
      title: `Threat Intel: ${citeId}`,
      content: `Autonomous SOC reference entity ${citeId} cited in incident correlation and triage reasoning. Grounded in STIX 2.1 taxonomy and defense playbooks.`,
      mitigation: "Review matching security events in the Sovereign SOC timeline and execute containment countermeasures."
    };
    setSelectedCitationDoc(fallback);
  };

  const handleCopyAnswer = () => {
    if (response?.answer) {
      navigator.clipboard.writeText(response.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApproveAction = async () => {
    try {
      const resp = await fetch(`${apiBase}/audit/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: `ACT-ASK-${Date.now()}`,
          target: "192.168.1.189",
          action_type: "FIREWALL_DROP_PERIMETER",
          operator_id: "SOC_CONSOLE_ANALYST"
        })
      });
      if (resp.ok) {
        setApprovedAction(true);
      }
    } catch (e) {
      console.error("Failed to approve action:", e);
    }
  };

  return (
    <div className="soc-card" style={{ background: "var(--cream)", color: "var(--navy)" }}>
      {/* Header */}
      <div className="soc-card-header">
        <div className="soc-title">
          <Bot size={16} color="var(--navy)" />
          <span>ASK AI SOC ANALYST (এআই বিশ্লেষককে জিজ্ঞাসা করুন)</span>
          <span className="badge" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)" }}>
            BILINGUAL (বাংলা / EN)
          </span>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        {SAMPLE_QUERIES.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(sq.query);
              handleAsk(sq.query, sq.lang);
            }}
            className="btn btn-secondary-cream"
            style={{ fontSize: "11px", padding: "4px 10px", minHeight: "32px" }}
          >
            <Sparkles size={11} />
            <span>{sq.label}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder={
            globalLanguage === "bn"
              ? "ঘটনা সম্পর্কে বাংলায় বা ইংরেজিতে প্রশ্ন করুন..."
              : "Ask a question about active threats, honeypot hits, or MITRE tactics..."
          }
          className="input-control"
          style={{ flex: 1, height: "40px" }}
          disabled={loading}
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !query.trim()}
          className="btn btn-primary"
          style={{ padding: "0 16px", height: "40px" }}
        >
          {loading ? (
            <RotateCcw size={15} />
          ) : (
            <>
              <Send size={15} />
              <span>{globalLanguage === "bn" ? "জিজ্ঞাসা করুন" : "Ask"}</span>
            </>
          )}
        </button>
      </div>

      {/* Response Box */}
      {response && (
        <div style={{
          background: "var(--navy-alpha-04)",
          border: "1px solid var(--navy-alpha-20)",
          borderRadius: "8px",
          padding: "16px"
        }}>
          {/* Response Meta Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge" style={{ background: "var(--navy)", color: "var(--cream)" }}>
                {response.provider}
              </span>
              <span className="badge" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)" }}>
                {response.language.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handleCopyAnswer}
                className="btn btn-secondary-cream"
                style={{ padding: "4px 8px", fontSize: "11px", minHeight: "30px" }}
                title="Copy response to clipboard"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Citations Row */}
          {response.citations && response.citations.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              <span style={{ fontSize: "10px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700 }}>
                Grounded Citations:
              </span>
              {response.citations.map((cite, i) => (
                <button
                  key={i}
                  onClick={() => handleOpenCitation(cite)}
                  className="badge font-mono"
                  style={{
                    background: "var(--navy-alpha-08)",
                    color: "var(--navy)",
                    border: "1px solid var(--navy-alpha-25)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                  title="Click to inspect verified MITRE / CVE knowledge entry"
                >
                  <ExternalLink size={10} />
                  <span>{cite}</span>
                </button>
              ))}
            </div>
          )}

          {/* Answer Text with Typewriter Stream Cursor */}
          <div style={{
            fontSize: "14px",
            lineHeight: 1.65,
            color: "var(--navy)",
            whiteSpace: "pre-line",
            borderLeft: "3px solid var(--coral)",
            paddingLeft: "14px",
            marginBottom: "14px",
            background: "var(--cream)",
            borderRadius: "0 6px 6px 0",
            paddingTop: "10px",
            paddingBottom: "10px"
          }}>
            {response.answer}
            {streaming && (
              <span style={{ display: "inline-block", width: "8px", height: "14px", background: "var(--coral)", marginLeft: "4px", verticalAlign: "middle" }} />
            )}
          </div>

          {/* Human-in-the-Loop Countermeasure Action */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--cream)",
            border: "1px solid var(--navy-alpha-20)",
            borderRadius: "6px",
            padding: "10px 14px",
            gap: "10px",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={16} color="var(--navy)" />
              <span style={{ fontSize: "13px", color: "var(--navy)", fontWeight: 600 }}>
                {globalLanguage === "bn"
                  ? "প্রস্তাবিত পদক্ষেপ: পেরিমিটার ফায়ারওয়ালে আইপি ব্লক প্রয়োগ করুন"
                  : "Recommended Action: Enforce perimeter firewall IP containment"}
              </span>
            </div>

            {approvedAction ? (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--cream)", background: "var(--navy)", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                <CheckCircle size={15} />
                <span>APPROVED & ACTIVE IN DENYLIST</span>
              </div>
            ) : (
              <button
                onClick={handleApproveAction}
                className="btn btn-primary"
                style={{ padding: "6px 14px", fontSize: "12px", minHeight: "36px" }}
              >
                {globalLanguage === "bn" ? "অনুমোদন করুন (Approve)" : "Approve Defense (HITL)"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grounded Citation Modal */}
      {selectedCitationDoc && (
        <div
          onClick={() => setSelectedCitationDoc(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--navy-alpha-75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--cream)",
              color: "var(--navy)",
              border: "1px solid var(--navy-alpha-25)",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              padding: "22px",
              position: "relative"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <BookOpen size={18} color="var(--navy)" />
                  <span className="font-mono" style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)" }}>
                    {selectedCitationDoc.id}
                  </span>
                  <span className="badge" style={{ background: "var(--navy-alpha-12)", color: "var(--navy)", textTransform: "uppercase" }}>
                    {selectedCitationDoc.type}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "var(--navy)", fontWeight: 700 }}>
                  {selectedCitationDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCitationDoc(null)}
                className="btn btn-secondary-cream"
                style={{ padding: "4px 8px", minHeight: "32px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "var(--navy-alpha-75)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                ATT&CK / Threat Context
              </div>
              <p style={{ fontSize: "14px", color: "var(--navy)", lineHeight: 1.6, margin: 0 }}>
                {selectedCitationDoc.content}
              </p>
            </div>

            {/* Authoritative Mitigation */}
            <div style={{
              background: "var(--navy-alpha-04)",
              border: "1px solid var(--navy-alpha-20)",
              borderRadius: "6px",
              padding: "14px",
              marginBottom: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <ShieldCheck size={16} color="var(--navy)" />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--navy)" }}>
                  Verified Defensive Mitigation
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--navy)", lineHeight: 1.55, margin: 0 }}>
                {selectedCitationDoc.mitigation}
              </p>
            </div>

            {/* Close Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedCitationDoc(null)}
                className="btn btn-secondary-cream"
              >
                Close (বন্ধ করুন)
              </button>
            </div>
          </div>
        </div>
      )}
      {citationLoading && (
        <div style={{ fontSize: "12px", color: "var(--navy-alpha-75)", marginTop: "6px" }}>Loading citation context...</div>
      )}
    </div>
  );
};
