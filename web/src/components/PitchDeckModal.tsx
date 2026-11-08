import React, { useState } from "react";
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
      "১. কৃত্রিম আক্রমণ ট্র্যাফিক ডিকয় সারফেসে আঘাত করে।",
      "২. লাইভ ওয়েবসকেট তাত্ক্ষণিকভাবে অ্যালার্ট পাঠায়: 'BRUTE FORCE SUSPECTED'।",
      "৩. অপারেটর বাংলায় প্রশ্ন করেন: 'কী ঘটেছে? কতটা বিপজ্জনক?'",
      "৪. এআই অ্যানালিস্ট MITRE [T1110.001] এবং [CWE-307] উদ্ধৃত করে সাবলীল বাংলায় ব্যাখ্যা দেয়।",
      "৫. অপারেটর 'অনুমোদন করুন' ক্লিক করেন: ফায়ারওয়াল ব্লক প্রয়োগ ও অপরিবর্তনীয় অডিট ট্রেইলে সংরক্ষিত হয়।"
    ],
    highlight: "Mean-Time-To-Understand drops from 45 minutes to 3 seconds."
  },
  {
    number: 4,
    titleEn: "AI-Native Reference Architecture",
    titleBn: "এআই-নেটিভ রেফারেন্স আর্কিটেকচার",
    icon: Database,
    color: "#a855f7",
    bulletPointsEn: [
      "Sensors: Deception Honeypot (isolated), API Abuse Guard (429 limiter), Allowlisted Asset Scanner.",
      "Data Engine: FastAPI + PostgreSQL + pgvector for dense similarity search.",
      "Multi-Agent Core: Triage Agent (severity reconciliation), Correlation Agent (kill chain), Response Advisor.",
      "Pre-LLM PII Redaction: Passwords, tokens, and keys scrubbed before reaching models."
    ],
    bulletPointsBn: [
      "সেন্সরসমূহ: আইসোলেটেড হানিপট, এপিআই অ্যাবিউজ গার্ড (রেট লিমিটার), অ্যালাউলিস্টেড অ্যাসেট স্ক্যানার।",
      "ডেটা ইঞ্জিন: ভেক্টর সার্চের জন্য FastAPI + PostgreSQL + pgvector।",
      "মাল্টি-এজেন্ট কোর: ট্রায়াজ এজেন্ট, কোরিলেশন এজেন্ট এবং রেসপন্স অ্যাডভাইজর।",
      "মডেলের পূর্বে PII স্ক্রাবিং: পাসওয়ার্ড, টোকেন ও সিক্রেট তথ্য মডেলের নিকট পাঠানোর পূর্বেই মুছে ফেলা হয়।"
    ],
    highlight: "Compliant with Congress 2026 Reference Architecture Layer 1 to 7."
  },
  {
    number: 5,
    titleEn: "Responsible AI & Data Sovereignty",
    titleBn: "দায়িত্বশীল এআই ও তথ্য সার্বভৌমত্ব",
    icon: ShieldAlert,
    color: "#f59e0b",
    bulletPointsEn: [
      "Defensive Boundaries in Code: Asset Discovery strictly refuses off-list targets with HTTP 403.",
      "Human-in-the-Loop (HITL): AI only advises countermeasures; human approval is mandatory.",
      "Data Sovereignty Mode: One-click switch to Ollama offline; cloud egress fully blocked.",
      "Immutable Audit Trail: Every verdict, retrieved citation, and operator sign-off is permanently logged."
    ],
    bulletPointsBn: [
      "কোডে সুরক্ষিত সীমানা: অনুমোদিত তালিকা বহির্ভূত যেকোনো স্ক্যান অনুরোধ ৪০৩ কোডে প্রত্যাখ্যাত হয়।",
      "হিউম্যান-ইন-দ্য-লুপ (HITL): এআই শুধুমাত্র সুপারিশ করে; মানুষের চূড়ান্ত অনুমোদন ছাড়া কোনো ব্যবস্থা নেওয়া হয় না।",
      "তথ্য সার্বভৌমত্ব মোড: ওলামা অফলাইন ব্যাকএন্ড দিয়ে ইন্টারনেটের অনুপস্থিতিতেও নির্বিঘ্নে চলে।",
      "অপরিবর্তনীয় অডিট ট্রেইল: এআই-এর প্রতিটি সিদ্ধান্ত এবং অপারেটরের অনুমোদন স্থায়ীভাবে সংরক্ষিত থাকে।"
    ],
    highlight: "Directly satisfies Responsible AI, Data Ownership, & Governance score rubric."
  },
  {
    number: 6,
    titleEn: "Commercial Viability & Business Model",
    titleBn: "বাণিজ্যিক সম্ভাব্যতা ও ব্যবসায়িক মডেল",
    icon: DollarSign,
    color: "#10b981",
    bulletPointsEn: [
      "Market: 100,000+ SMEs, 60+ Commercial Banks, and regional public sector bodies in Bangladesh.",
      "Tier 1: Community Edition (Free & Open Source) for universities and startups.",
      "Tier 2: Enterprise On-Prem License ($1,200/node/year) for banks and critical infrastructure.",
      "Tier 3: Managed Multi-Tenant SOC SaaS ($99/month/organization) for SMEs."
    ],
    bulletPointsBn: [
      "বাজার: বাংলাদেশে ১,০০,০০০+ SME, ৬০+ বাণিজ্যিক ব্যাংক এবং বিভিন্ন সরকারি সংস্থা।",
      "স্তর ১: বিশ্ববিদ্যালয় ও স্টার্টআপদের জন্য উন্মুক্ত কমিউনিটি সংস্করণ।",
      "স্তর ২: ব্যাংক ও গুরুত্বপূর্ণ প্রতিষ্ঠানের জন্য অন-প্রেমিসেস লাইসেন্স (প্রতি বছর $১,২০০)।",
      "স্তর ৩: এসএমই প্রতিষ্ঠানের জন্য ক্লাউড ম্যানেজড এসওসি সাবস্ক্রিপশন (প্রতি মাসে $৯৯)।"
    ],
    highlight: "Clear path to recurring ARR with massive local market need."
  },
  {
    number: 7,
    titleEn: "Global Scalability & Societal Impact",
    titleBn: "গ্লোবাল স্কেলেবিলিটি ও সামাজিক প্রভাব",
    icon: TrendingUp,
    color: "#6366f1",
    bulletPointsEn: [
      "Stateless microservice architecture; horizontally scales across Docker / Kubernetes clusters.",
      "Bilingual democratization: allows non-native English speakers to operate cyber defenses in Bengali.",
      "Universal Applicability: Threat sensors and MITRE RAG engine scale globally to any language.",
      "National Security: Safeguards national critical infrastructure without reliance on foreign telemetry exports."
    ],
    bulletPointsBn: [
      "ডকার ও কুবারনেটিসে সহজে অনুভূমিকভাবে স্কেলযোগ্য মাইক্রোসার্ভিস আর্কিটেকচার।",
      "ভাষাগত ক্ষমতায়ন: মাতৃভাষা বাংলায় সাইবার নিরাপত্তা পরিচালনার সুযোগ।",
      "বৈশ্বিক প্রযোজ্যতা: MITRE ATT&CK গ্রাউন্ডিং যেকোনো আন্তর্জাতিক অবকাঠামোতে কার্যকর।",
      "জাতীয় নিরাপত্তা: বিদেশী ক্লাউডের ওপর নির্ভরতা কমিয়ে সার্বভৌম ডিজিটাল প্রতিরক্ষা নিশ্চিত করে।"
    ],
    highlight: "Built in Bangladesh for emerging nations worldwide."
  },
  {
    number: 8,
    titleEn: "Team Roles & Execution Discipline",
    titleBn: "দলীয় ভূমিকা ও দায়িত্ব বণ্টন",
    icon: Users,
    color: "#ec4899",
    bulletPointsEn: [
      "Team Leader / Coordinator: Overall vision, milestone delivery, and live pitch orchestration.",
      "AI & Data Scientist: RAG knowledge base engineering, MITRE grounding, and prompt accuracy.",
      "Full-Stack / Frontend Lead: Tactical operator console, accessibility, and Bengali localization.",
      "Backend & Security Engineer: Event bus, defensive sensors, pgvector, and rate-limit guardrails.",
      "Presentation & Compliance Lead: Pitch narrative, audit framework, and commercial packaging."
    ],
    bulletPointsBn: [
      "দলনেতা ও সমন্বয়ক: সামগ্রিক পরিকল্পনা, সময়রেখা এবং লাইভ পিচ পরিচালনা।",
      "এআই ও ডেটা সায়েন্টিস্ট: RAG নলেজ বেস ইঞ্জিনিয়ারিং, MITRE গ্রাউন্ডিং এবং প্রম্পট টিউনিং।",
      "ফ্রন্টএন্ড লিড: ট্যাকটিক্যাল এসওসি কনসোল, অ্যাক্সেসিবিলিটি এবং বাংলা লোকালাইজেশন।",
      "ব্যাকএন্ড ও সিকিউরিটি ইঞ্জিনিয়ার: ইভেন্ট বাস, ডিফেন্সিভ সেন্সর, pgvector এবং সেফটি গার্ডরেইল।",
      "কমপ্লায়েন্স ও প্রেজেন্টেশন লিড: পিচ উপস্থাপনা, অডিট ফ্রেমওয়ার্ক এবং ব্যবসায়িক মডেল।"
    ],
    highlight: "Cross-functional execution built to win the 100-point Congress score sheet."
  }
];

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({
  isOpen,
  onClose,
  globalLanguage
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const title = globalLanguage === "bn" ? slide.titleBn : slide.titleEn;
  const bullets = globalLanguage === "bn" ? slide.bulletPointsBn : slide.bulletPointsEn;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(6px)",
      zIndex: 2500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#0a0f18",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        width: "920px",
        maxWidth: "96vw",
        height: "560px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 50px rgba(0,0,0,0.9)",
        overflow: "hidden"
      }}>
        {/* Top Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 24px",
          borderBottom: "1px solid #1e293b",
          background: "#080c14"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="badge" style={{ background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8" }}>
              CONGRESS 2026 PITCH DECK
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Slide {slide.number} of {SLIDES.length}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide Body */}
        <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Slide Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{
                background: `${slide.color}20`,
                border: `1px solid ${slide.color}50`,
                borderRadius: "8px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: slide.color
              }}>
                <Icon size={26} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc" }}>
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
            background: "#0f172a",
            border: `1px solid ${slide.color}40`,
            borderLeft: `4px solid ${slide.color}`,
            borderRadius: "6px",
            padding: "12px 16px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#e2e8f0"
          }}>
            {slide.highlight}
          </div>
        </div>

        {/* Navigation Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          borderTop: "1px solid #1e293b",
          background: "#080c14"
        }}>
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: currentSlide === 0 ? "not-allowed" : "pointer",
              opacity: currentSlide === 0 ? 0.4 : 1
            }}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          {/* Slide dots */}
          <div style={{ display: "flex", gap: "8px" }}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: i === currentSlide ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === currentSlide ? "#38bdf8" : "#1e293b",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: currentSlide === SLIDES.length - 1 ? "not-allowed" : "pointer",
              opacity: currentSlide === SLIDES.length - 1 ? 0.4 : 1
            }}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
