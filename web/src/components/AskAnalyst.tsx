import React, { useState } from "react";
import { Bot, Send, Sparkles, CheckCircle, ExternalLink, ShieldAlert, X, BookOpen, ShieldCheck } from "lucide-react";
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

export const AskAnalyst: React.FC<AskAnalystProps> = ({ apiBase, globalLanguage }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [approvedAction, setApprovedAction] = useState<boolean>(false);
  const [selectedCitationDoc, setSelectedCitationDoc] = useState<KnowledgeDoc | null>(null);
  const [citationLoading, setCitationLoading] = useState<boolean>(false);

  const handleAsk = async (questionText?: string, langOverride?: "en" | "bn") => {
    const textToSend = questionText || query;
    if (!textToSend.trim()) return;

    setLoading(true);
    setStreaming(true);
    setApprovedAction(false);

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
                console.error("Error parsing SSE chunk:", e);
              }
            }
          }
        }
      } else {
        // Fallback to non-streaming POST /analyst/ask
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
    } catch (err) {
      console.error("Failed to query analyst:", err);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleOpenCitation = async (citationId: string) => {
    setCitationLoading(true);
    try {
      const resp = await fetch(`${apiBase}/analyst/knowledge/${encodeURIComponent(citationId)}`);
      if (resp.ok) {
        const doc: KnowledgeDoc = await resp.json();
        setSelectedCitationDoc(doc);
      } else {
        // Fallback root path
        const rootResp = await fetch(`${apiBase}/knowledge/${encodeURIComponent(citationId)}`);
        if (rootResp.ok) {
          const doc: KnowledgeDoc = await rootResp.json();
          setSelectedCitationDoc(doc);
        }
      }
    } catch (err) {
      console.error("Failed to fetch knowledge document:", err);
    } finally {
      setCitationLoading(false);
    }
  };

  const handleApproveAction = async () => {
    try {
      const resp = await fetch(`${apiBase}/audit/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: `ACT-DEF-${Date.now()}`,
          target: "192.168.1.189",
          action_type: "PERIMETER_FIREWALL_DROP",
          operator_id: "SOC_CONSOLE_OPERATOR"
        })
      });
      if (resp.ok) {
        setApprovedAction(true);
      }
    } catch (e) {
      console.error("Failed to approve countermeasure:", e);
    }
  };

  return (
    <div className="soc-card" style={{ borderColor: "#3b82f6", boxShadow: "0 0 25px rgba(59, 130, 246, 0.15)" }}>
      {/* Header */}
      <div className="soc-card-header">
        <div className="soc-title" style={{ color: "#38bdf8" }}>
          <Bot size={18} />
          <span>ASK THE AI SOC ANALYST (এআই অ্যানালিস্ট)</span>
        </div>
        <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#7dd3fc", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
          RAG GROUNDED &bull; ZERO HALLUCINATION
        </span>
      </div>

      {/* Suggested Quick Queries */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
        {SAMPLE_QUERIES.map((sample, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(sample.query);
              handleAsk(sample.query, sample.lang);
            }}
            style={{
              background: "#162032",
              border: "1px solid #23334d",
              color: "#94a3b8",
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#38bdf8";
              e.currentTarget.style.color = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#23334d";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <Sparkles size={11} style={{ display: "inline", marginRight: "4px", color: "#38bdf8" }} />
            {sample.label}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        style={{ display: "flex", gap: "8px", marginBottom: "14px" }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            globalLanguage === "bn"
              ? "যেকোনো নিরাপত্তা ঘটনা সম্পর্কে প্রশ্ন করুন (যেমন: 'কী ঘটেছে? কতটা বিপজ্জনক?')..."
              : "Ask about any event (e.g. 'Explain the last critical incident and citations')..."
          }
          style={{
            flex: 1,
            background: "#080c14",
            border: "1px solid #1e293b",
            color: "#f8fafc",
            borderRadius: "6px",
            padding: "10px 14px",
            fontSize: "13px",
            outline: "none"
          }}
          onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
          onBlur={(e) => (e.target.style.borderColor = "#1e293b")}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: loading || !query.trim() ? 0.6 : 1
          }}
        >
          {loading ? (
            <span className="pulse-active">Analyzing...</span>
          ) : (
            <>
              <Send size={14} />
              <span>{globalLanguage === "bn" ? "জিজ্ঞাসা" : "Ask"}</span>
            </>
          )}
        </button>
      </form>

      {/* Answer Presentation Card */}
      {response && (
        <div style={{
          background: "#090e17",
          border: "1px solid #1e293b",
          borderRadius: "6px",
          padding: "14px",
          marginTop: "10px"
        }}>
          {/* Metadata bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#6ee7b7", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                Language: {response.language === "bn" ? "বাংলা" : "English"}
              </span>
              <span className="badge" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#d8b4fe", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
                Model: {response.provider}
              </span>
              {streaming && (
                <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                  Streaming Live...
                </span>
              )}
            </div>
            {response.citations && response.citations.length > 0 && (
              <div style={{ display: "flex", gap: "4px" }}>
                {response.citations.map((cite, i) => (
                  <button
                    key={i}
                    onClick={() => handleOpenCitation(cite)}
                    className="badge"
                    style={{
                      background: "rgba(56, 189, 248, 0.2)",
                      color: "#38bdf8",
                      border: "1px solid rgba(56, 189, 248, 0.4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                    title="Click to view verified MITRE / CVE knowledge entry"
                  >
                    <ExternalLink size={10} style={{ marginRight: "2px" }} />
                    {cite}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Answer Text with Typewriter Stream Cursor */}
          <div style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "#e2e8f0",
            whiteSpace: "pre-line",
            borderLeft: "3px solid #38bdf8",
            paddingLeft: "12px",
            marginBottom: "12px"
          }}>
            {response.answer}
            {streaming && (
              <span style={{ display: "inline-block", width: "8px", height: "13px", background: "#38bdf8", marginLeft: "4px", verticalAlign: "middle" }} className="pulse-active" />
            )}
          </div>

          {/* Human-in-the-Loop Countermeasure Action */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#131a29",
            border: "1px solid #23334d",
            borderRadius: "6px",
            padding: "8px 12px",
            marginTop: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={16} color="#f59e0b" />
              <span style={{ fontSize: "12px", color: "#cbd5e1" }}>
                {globalLanguage === "bn"
                  ? "প্রস্তাবিত পদক্ষেপ: পেরিমিটার ফায়ারওয়ালে আইপি ব্লক প্রয়োগ করুন"
                  : "Recommended Action: Enforce perimeter firewall IP containment"}
              </span>
            </div>

            {approvedAction ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#34d399", fontSize: "11px", fontWeight: 600 }}>
                <CheckCircle size={14} />
                <span>APPROVED & ACTIVE IN DENYLIST</span>
              </div>
            ) : (
              <button
                onClick={handleApproveAction}
                style={{
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {globalLanguage === "bn" ? "অনুমোদন করুন (Approve)" : "Approve Defense (HITL)"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grounded Citation Modal */}
      {selectedCitationDoc && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#0c1322",
            border: "1px solid #38bdf8",
            borderRadius: "10px",
            maxWidth: "600px",
            width: "100%",
            boxShadow: "0 0 30px rgba(56, 189, 248, 0.25)",
            padding: "20px",
            position: "relative"
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <BookOpen size={18} color="#38bdf8" />
                  <span className="font-mono" style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc" }}>
                    {selectedCitationDoc.id}
                  </span>
                  <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", textTransform: "uppercase" }}>
                    {selectedCitationDoc.type}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: "15px", color: "#93c5fd", fontWeight: 600 }}>
                  {selectedCitationDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCitationDoc(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                ATT&CK / Threat Context
              </div>
              <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                {selectedCitationDoc.content}
              </p>
            </div>

            {/* Authoritative Mitigation */}
            <div style={{
              background: "#08121f",
              border: "1px solid #1e3a5f",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <ShieldCheck size={16} color="#34d399" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#34d399" }}>
                  Verified Defensive Mitigation
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#e2e8f0", lineHeight: 1.5, margin: 0 }}>
                {selectedCitationDoc.mitigation}
              </p>
            </div>

            {/* Close Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedCitationDoc(null)}
                style={{
                  background: "#1e293b",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                Close (বন্ধ করুন)
              </button>
            </div>
          </div>
        </div>
      )}
      {citationLoading && (
        <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "4px" }}>Loading citation context...</div>
      )}
    </div>
  );
};
