import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Award, ShieldAlert, Cpu, Database, DollarSign, TrendingUp, Users } from "lucide-react";

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalLanguage: "en" | "bn";
}

const SLIDES = [
  {
    number: 1,
    titleEn: "The Cybersecurity Crisis in Emerging Economies",
    titleBn: "উন্নয়নশীল অর্থনীতির সাইবার নিরাপত্তা সংকট",
    icon: ShieldAlert,
    color: "#ef4444",
    bulletPointsEn: [
      "Bangladesh is digitizing rapidly ($100B+ annual digital transactions), yet 85% of SMEs, banks, and public offices lack dedicated SOC personnel.",
      "Traditional enterprise SOC analysts cost $40,000–$100,000/year each and suffer extreme alert fatigue (1,000+ alerts daily; 45m MTTU).",
      "Data Sovereignty Crisis: Foreign cloud SOCs require exporting sensitive national telemetry overseas, violating data privacy and sovereignty regulations."
    ],
    bulletPointsBn: [
      "বাংলাদেশ দ্রুত ডিজিটালাইজড হচ্ছে, কিন্তু ৮৫% ক্ষুদ্র ও মাঝারি প্রতিষ্ঠান (SME), ব্যাংক এবং সরকারি অফিসের নিজস্ব সিকিউরিটি অপারেশন সেন্টার (SOC) নেই।",
      "ঐতিহ্যগত এসওসি অ্যানালিস্ট অত্যন্ত ব্যয়বহুল এবং প্রতিদিন হাজার হাজার সতর্কবার্তা বিশ্লেষণে গড়ে ৪৫ মিনিট সময় অপচয় হয়।",
      "তথ্য সার্বভৌমত্ব ঝুঁকি: বিদেশী ক্লাউড এসওসি জাতীয় গুরুত্বপূর্ণ ও সংবেদনশীল ডেটা দেশের বাইরে নিয়ে যায়, যা ডেটা সার্বভৌমত্ব লঙ্ঘন করে।"
    ],
    highlight: "SMEs & Critical Infrastructure need an affordable, autonomous, on-premise SOC."
  },
  {
    number: 2,
    titleEn: "Prohori AI — The Self-Hostable AI SOC Analyst",
    titleBn: "প্রহরী এআই — স্ব-হোস্টযোগ্য এআই এসওসি প্ল্যাটফর্ম",
    icon: Cpu,
    color: "#38bdf8",
    bulletPointsEn: [
      "Not just a colored-light dashboard: Prohori is an active agentic AI SOC Analyst.",
      "Four defensive sensors feed a single unified bus; the AI Analyst triages, correlates, and explains threats in English and Bengali (বাংলা).",
      "Grounded in MITRE ATT&CK and NVD CVE knowledge bases: every verdict is cited with zero hallucination.",
      "Runs 100% on-premises with local models (Ollama Llama 3.2): zero telemetry leaves the organization."
    ],
    bulletPointsBn: [
      "সাধারণ ড্যাশবোর্ড নয়: প্রহরী একটি সক্রিয় এজেন্টভিত্তিক এআই এসওসি অ্যানালিস্ট।",
      "৪টি ডিফেন্সিভ সেন্সর একটি বাস-এ ডেটা পাঠায়; এআই অ্যানালিস্ট স্বয়ংক্রিয়ভাবে ট্রায়াজ ও কোরিলেশন সম্পন্ন করে বাংলা ও ইংরেজিতে ব্যাখ্যা প্রদান করে।",
      "MITRE ATT&CK এবং NVD CVE নলেজ বেসের সাথে গ্রাউন্ডেড: প্রতিটি সিদ্ধান্তের সাথে নির্ভুল উদ্ধৃতি সংযুক্ত।",
      "লোকাল মডেল (Ollama Llama 3.2) দিয়ে ১০০% নিজস্ব সার্ভারে চলে: কোনো ডেটা দেশের বাইরে যায় না।"
    ],
    highlight: "SOC-in-a-box for every enterprise and university in Bangladesh."
  },
  {
    number: 3,
    titleEn: "The Money-Shot Live Demo",
    titleBn: "লাইভ ডেমো ও কার্যকারিতা",
    icon: Award,
    color: "#34d399",
    bulletPointsEn: [
      "1. Benign attack traffic trips Deception Sensor (honeypot decoy surface).",
      "2. Live WebSocket pushes alert: 'BRUTE FORCE SUSPECTED'.",
      "3. Operator asks in native Bangla: 'কী ঘটেছে? কতটা বিপজ্জনক?'",
      "4. AI Analyst streams response in natural Bengali citing MITRE [T1110.001] and [CWE-307].",
      "5. Operator clicks 'Approve Defense' (HITL): Firewall block enforced and cryptographically audited."
    ],
    bulletPointsBn: [
      "১. ডিকয় ট্র্যাপে আক্রমণ শনাক্ত: 'BRUTE FORCE SUSPECTED' এলার্ট সৃষ্টি।",
      "২. লাইভ ওয়েবসকেটে রিয়েল-টাইম ইভেন্ট ব্রডকাস্ট।",
      "৩. অপারেটরের মাতৃভাষায় প্রশ্ন: 'কী ঘটেছে? কতটা বিপজ্জনক?'",
      "৪. এআই অ্যানালিস্টের বাংলা ভাষায় উদ্ধৃতিসহ উত্তর ([T1110.001], [CWE-307])।",
      "৫. হিউম্যান-ইন-দ্য-লুপ অনুমোদন: তাত্ক্ষণিক ফায়ারওয়াল ব্লক ও অপরিবর্তনীয় অডিট লগ সংরক্ষণ।"
    ],
    highlight: "Under 60 seconds from alert to bilingual explanation and human-approved defense."
  },
  {
    number: 4,
    titleEn: "Architecture & Data Lineage",
    titleBn: "সিস্টেম আর্কিটেকচার ও ডেটা প্রবাহ",
    icon: Database,
    color: "#a855f7",
    bulletPointsEn: [
      "Defensive Layer: Deception Honeypot (Port 8081), API Abuse Guard (Port 8082), Asset Discovery (Port 8083).",
      "Core Ingestion Bus: FastAPI + PostgreSQL (pgvector embeddings for ATT&CK techniques & CVEs).",
      "Intelligence Core: Redaction engine -> Retrieval -> Autonomous Triage -> Kill-Chain Correlation -> Human-in-the-Loop Advisor.",
      "Local-First Sovereignty: Hot-swappable between Ollama (Llama 3.2), Gemini API, and Deterministic Offline Engine."
    ],
    bulletPointsBn: [
      "ডিফেন্সিভ সেন্সর: ডিসেপশন হানিপট (পোর্ট ৮০৮১), রেট লিমিটার (পোর্ট ৮০৮২), এসেট স্ক্যানার (পোর্ট ৮০৮৩)।",
      "কোর বাস: FastAPI + PostgreSQL (MITRE ও CVE এর জন্য pgvector এম্বেডিং)।",
      "ইন্টেলিজেন্স ইঞ্জিন: রিডাকশন -> রিট্রিভাল -> স্বয়ংক্রিয় ট্রায়াজ -> কিল-চেইন কোরিলেশন -> রেসপন্স অ্যাডভাইজর।",
      "সার্বভৌমত্ব: লোকাল Ollama (Llama 3.2), জেমিনি এবং অফলাইন ইঞ্জিনের মধ্যে হট-সোয়াপ।"
    ],
    highlight: "Grounded RAG architecture with 100% data lineage from sensor to citation."
  },
  {
    number: 5,
    titleEn: "Responsible AI, Safety & Sovereignty",
    titleBn: "দায়িত্বশীল এআই, নিরাপত্তা ও ডেটা সার্বভৌমত্ব",
    icon: ShieldAlert,
    color: "#f59e0b",
    bulletPointsEn: [
      "Zero Hallucination: AI reasoning strictly grounded in MITRE ATT&CK & CVE knowledge vectors.",
      "Zero Offensive Execution: Honeypot is simulated; never executes commands; Scanner strictly limited to allowlisted targets.",
      "Mandatory PII Scrubbing: Redacts credentials, tokens, and emails before model processing.",
      "Human-in-the-Loop & Immutable Audit: Countermeasures require human approval; all actions logged to append-only database."
    ],
    bulletPointsBn: [
      "শূন্য হ্যালুসিনেশন: এআই সিদ্ধান্ত ১০০% MITRE ATT&CK এবং CVE ভেক্টরের উপর গ্রাউন্ডেড।",
      "নিরাপদ ডিফেন্স: হানিপট সম্পূর্ণ বিচ্ছিন্ন ও নিয়ন্ত্রিত; স্ক্যানার অনুমোদিত ল্যাব সীমার বাইরে স্ক্যান করতে পারে না।",
      "স্বয়ংক্রিয় পিআইআই স্ক্রাবিং: মডেল প্রসেসিংয়ের পূর্বে সব পাসওয়ার্ড ও টোকেন ফিল্টার করা হয়।",
      "হিউম্যান-ইন-দ্য-লুপ ও অডিট লগ: কাউন্টারমেজার অনুমোদনে মানব নজরদারি বাধ্যতামূলক এবং প্রতিটি সিদ্ধান্ত অপরিবর্তনীয় অডিটে সংরক্ষিত।"
    ],
    highlight: "Meets NIST AI Risk Management Framework & Bangladesh Cyber Security standards."
  },
  {
    number: 6,
    titleEn: "Competitive Advantage",
    titleBn: "প্রতিযোগিতামূলক সুবিধা",
    icon: TrendingUp,
    color: "#06b6d4",
    bulletPointsEn: [
      "Enterprise SOC (Splunk / CrowdStrike): $150K+/yr, complex setup, foreign cloud egress, English-only.",
      "Generic GenAI Wrappers: High hallucination, no defensive telemetry bus, leaks prompts to 3rd-party clouds.",
      "PROHORI AI: $0 software license, runs on a $500 local mini-PC or existing servers, native Bengali (বাংলা), fully auditable."
    ],
    bulletPointsBn: [
      "ঐতিহ্যগত এসওসি: বছরে কোটি টাকার বেশি খরচ, বিদেশি সার্ভার নির্ভরতা, শুধুমাত্র ইংরেজি নির্ভর।",
      "সাধারণ জেন-এআই র‍্যাপার: হ্যালুসিনেশন বেশি, কোনো সেন্সর বাস নেই, ক্লাউডে ডেটা লিক হওয়ার ঝুঁকি।",
      "প্রহরী এআই: কোনো লাইসেন্স ফি নেই, সাধারণ সার্ভারেই চলে, মাতৃভাষা বাংলায় কার্যকর, ১০০% অডিটেবল।"
    ],
    highlight: "10x cheaper, 100% sovereign, and native Bangla support."
  },
  {
    number: 7,
    titleEn: "Cost & Sustainability Model",
    titleBn: "বাজেট ও টেকসই ব্যবসায়িক মডেল",
    icon: DollarSign,
    color: "#10b981",
    bulletPointsEn: [
      "Built entirely on free-tier, open-source building blocks: FastAPI, PostgreSQL, Ollama, React + Vite.",
      "Zero-cost baseline: Operates fully offline on consumer hardware with zero cloud API bills.",
      "Scalable Commercial Model: Open-source community core + Paid Enterprise Support, Custom Model Tuning & Compliance Reporting for Banks."
    ],
    bulletPointsBn: [
      "সম্পূর্ণ ফ্রি ও ওপেন সোর্স প্রযুক্তির ভিত্তি: FastAPI, PostgreSQL, Ollama, React + Vite।",
      "শূন্য ক্লাউড খরচ: কোনো ক্লাউড এপিআই ছাড়াই লোকাল কম্পিউটারে সম্পূর্ণ সক্ষমতায় চালনাযোগ্য।",
      "বাণিজ্যিক মডেল: উন্মুক্ত কোর প্ল্যাটফর্ম + ব্যাংক ও এন্টারপ্রাইজের জন্য কাস্টম সাপোর্ট ও কমপ্লায়েন্স চুক্তি।"
    ],
    highlight: "$0 operational cost to start; scalable enterprise support model."
  },
  {
    number: 8,
    titleEn: "The Team & Vision",
    titleBn: "আমাদের দল ও লক্ষ্য",
    icon: Users,
    color: "#38bdf8",
    bulletPointsEn: [
      "Vision: Democratize enterprise-grade cybersecurity for emerging digital nations.",
      "Every SME, school, hospital, and municipality deserves real-time threat intelligence and autonomous defense.",
      "Prohori Sentinel ('প্রহরী') represents national cyber resilience powered by sovereign, responsible AI."
    ],
    bulletPointsBn: [
      "লক্ষ্য: বাংলাদেশের প্রতিটি প্রতিষ্ঠানের জন্য বিশ্বমানের সাইবার নিরাপত্তা সহজলভ্য করা।",
      "প্রতিটি ক্ষুদ্র ব্যবসা, হাসপাতাল, স্কুল ও ব্যাংকের জন্য রিয়েল-টাইম থ্রেট ইন্টেলিজেন্স ও এআই প্রতিরোধ।",
      "প্রহরী এআই — দেশের সার্বভৌমিকতা রক্ষায় ডিজিটাল পাহারাদার।"
    ],
    highlight: "Protecting Bangladesh's digital frontiers with sovereign, bilingual AI."
  }
];

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({
  isOpen,
  onClose,
  globalLanguage
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [deckLang, setDeckLang] = useState<"en" | "bn">(globalLanguage);

  useEffect(() => {
    setDeckLang(globalLanguage);
  }, [globalLanguage]);

  // Keyboard navigation: Arrow keys & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(SLIDES.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const title = deckLang === "bn" ? slide.titleBn : slide.titleEn;
  const bullets = deckLang === "bn" ? slide.bulletPointsBn : slide.bulletPointsEn;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "14px",
          width: "880px",
          maxWidth: "96vw",
          minHeight: "520px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.85)",
          overflow: "hidden"
        }}
        className="animate-fade-in"
      >
        {/* Header Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-canvas)",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.35)" }}>
              CONGRESS 2026 PITCH DECK
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }} className="font-mono">
              Slide {slide.number} of {SLIDES.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* In-Deck Language Toggle */}
            <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: "4px", border: "1px solid var(--border-subtle)", padding: "2px" }}>
              <button
                onClick={() => setDeckLang("en")}
                style={{
                  background: deckLang === "en" ? "#2563eb" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "3px",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  cursor: "pointer"
                }}
              >
                EN
              </button>
              <button
                onClick={() => setDeckLang("bn")}
                style={{
                  background: deckLang === "bn" ? "#2563eb" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "3px",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  cursor: "pointer"
                }}
              >
                বাংলা
              </button>
            </div>

            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: "6px" }}
              title="Close presentation (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div style={{ flex: 1, padding: "32px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Slide Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
              <div style={{
                background: `${slide.color}20`,
                border: `1px solid ${slide.color}50`,
                borderRadius: "10px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: slide.color
              }}>
                <Icon size={26} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", margin: 0, letterSpacing: "-0.01em" }}>
                {title}
              </h2>
            </div>

            {/* Bullets */}
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6 }}>
                  <span style={{ color: slide.color, fontWeight: 800, fontSize: "16px", lineHeight: "20px" }}>&bull;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Highlight Callout */}
          <div style={{
            background: "var(--bg-card-subtle)",
            border: `1px solid ${slide.color}35`,
            borderLeft: `4px solid ${slide.color}`,
            borderRadius: "6px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#e2e8f0",
            marginTop: "20px"
          }}>
            {slide.highlight}
          </div>
        </div>

        {/* Navigation Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 24px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-canvas)"
        }}>
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="btn btn-secondary"
            style={{ fontSize: "12px" }}
          >
            <ChevronLeft size={15} />
            <span>Previous</span>
          </button>

          {/* Slide dots */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: i === currentSlide ? "26px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === currentSlide ? "#38bdf8" : "var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                title={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className="btn btn-primary"
            style={{ fontSize: "12px" }}
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
