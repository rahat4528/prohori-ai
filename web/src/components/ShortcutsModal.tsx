import React, { useEffect } from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalLanguage: "en" | "bn";
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  globalLanguage
}) => {
  const isBn = globalLanguage === "bn";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "Shift + D", desc: isBn ? "আক্রমণ ডেমো চালান (Run Demo)" : "Run attack detection demo" },
    { key: "Shift + A", desc: isBn ? "দায়িত্বশীল এআই অডিট লগ খুলুন" : "Open Immutable Audit Log" },
    { key: "Shift + P", desc: isBn ? "৮-স্লাইড পিচ ডেক খুলুন" : "Open 8-Slide Pitch Deck" },
    { key: "Shift + S", desc: isBn ? "জাতীয় ডেটা সার্বভৌমত্ব মোড টগল" : "Toggle Data Sovereignty Mode" },
    { key: "Shift + L", desc: isBn ? "ভাষা পরিবর্তন করুন (বাংলা / EN)" : "Toggle Language (Bangla / English)" },
    { key: "Shift + R", desc: isBn ? "ডেমো রিস্টার্ট বা পরিষ্কার করুন" : "Reset demo state to empty" },
    { key: "?", desc: isBn ? "কিবোর্ড শর্টকাট সহায়তা প্রদর্শন" : "Show this keyboard shortcuts guide" },
    { key: "Esc", desc: isBn ? "খোলা ড্রয়ার বা উইন্ডো বন্ধ করুন" : "Close active modal or drawer" }
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--navy-alpha-75)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isBn ? "কিবোর্ড শর্টকাট গাইড" : "Keyboard Shortcuts Guide"}
    >
      <div
        style={{
          background: "var(--cream)",
          color: "var(--navy)",
          border: "1px solid var(--navy-alpha-25)",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--navy-alpha-15)",
            background: "var(--navy-alpha-04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Keyboard size={20} color="var(--navy)" />
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              {isBn ? "কিবোর্ড শর্টকাট গাইড" : "Keyboard Shortcuts"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary-cream"
            style={{
              padding: "4px 8px",
              minHeight: "32px",
              border: "none",
              background: "transparent"
            }}
            aria-label={isBn ? "বন্ধ করুন" : "Close"}
          >
            <X size={20} color="var(--navy)" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {shortcuts.map((s) => (
            <div
              key={s.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--navy-alpha-12)"
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--navy)", fontWeight: 600 }}>{s.desc}</span>
              <kbd
                className="font-mono"
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "var(--navy)",
                  border: "1px solid var(--navy)",
                  color: "var(--cream)",
                  fontSize: "13px",
                  fontWeight: 700
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
