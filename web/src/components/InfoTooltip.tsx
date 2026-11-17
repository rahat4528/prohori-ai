import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { GLOSSARY_TERMS } from "../utils/alertUtils";

interface InfoTooltipProps {
  term?: string;
  customText?: string;
  label?: React.ReactNode;
  isBn?: boolean;
  size?: number;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  term,
  customText,
  label,
  isBn = false,
  size = 14
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const text = customText || (term && GLOSSARY_TERMS[term] ? (isBn ? GLOSSARY_TERMS[term].bn : GLOSSARY_TERMS[term].en) : "");

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  if (!text) return null;

  return (
    <span
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        verticalAlign: "middle"
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={term ? `Learn what ${term} means` : "Information tooltip"}
        style={{
          background: "transparent",
          border: "none",
          padding: "2px",
          margin: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          color: "inherit"
        }}
      >
        {label ? (
          <>
            <span>{label}</span>
            <Info size={size} color="var(--navy)" style={{ opacity: 0.7 }} />
          </>
        ) : (
          <Info size={size} color="var(--navy)" style={{ opacity: 0.7 }} />
        )}
      </button>

      {isOpen && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--navy)",
            color: "var(--cream)",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            lineHeight: 1.45,
            width: "max-content",
            maxWidth: "280px",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--cream-alpha-20)",
            zIndex: 100,
            pointerEvents: "none",
            textAlign: "left"
          }}
        >
          {term && (
            <div style={{ fontWeight: 800, marginBottom: "3px", color: "var(--coral)", fontSize: "12px" }}>
              {term}
            </div>
          )}
          <div style={{ color: "var(--cream-alpha-90)", fontWeight: 500 }}>
            {text}
          </div>
        </div>
      )}
    </span>
  );
};
