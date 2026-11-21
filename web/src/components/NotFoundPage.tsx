import React from "react";
import { ProhoriMark } from "./ProhoriLogo";
import { ArrowLeft, ShieldAlert } from "lucide-react";

interface NotFoundPageProps {
  isBn?: boolean;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ isBn = false }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--navy)",
        color: "var(--cream)",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          background: "var(--navy)",
          border: "1.5px solid var(--cream-alpha-25)",
          borderRadius: "14px",
          padding: "36px 28px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        <ProhoriMark size={56} variant="reverse" />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            borderRadius: "6px",
            background: "var(--coral-alpha-20)",
            color: "var(--coral)",
            border: "1px solid var(--coral-alpha-50)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 800
          }}
        >
          <ShieldAlert size={16} />
          <span>HTTP 404 &bull; {isBn ? "রুট খুঁজে পাওয়া যায়নি" : "PAGE NOT FOUND"}</span>
        </div>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "var(--cream)",
            margin: 0,
            lineHeight: 1.3
          }}
        >
          {isBn ? "পৃষ্ঠাটি খুঁজে পাওয়া যায়নি" : "Security Route Not Found"}
        </h1>

        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.6,
            color: "var(--cream-alpha-75)",
            margin: 0
          }}
        >
          {isBn
            ? "আপনি যে পৃষ্ঠা বা কনসোল রুটটি খুঁজছেন তা বিদ্যমান নেই বা স্থানান্তরিত করা হয়েছে। অনুগ্রহ করে মূল ড্যাশবোর্ডে ফিরে যান।"
            : "The security console route or resource you are looking for does not exist or has been moved. Return to the main SOC console."}
        </p>

        <a
          href="/"
          className="btn btn-primary"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: 800,
            background: "var(--coral)",
            color: "var(--navy)",
            borderRadius: "8px",
            border: "1px solid var(--coral)",
            minHeight: "44px",
            marginTop: "8px"
          }}
        >
          <ArrowLeft size={16} />
          <span>{isBn ? "কনসোলে ফিরে যান" : "Return to SOC Console"}</span>
        </a>
      </div>
    </div>
  );
};
