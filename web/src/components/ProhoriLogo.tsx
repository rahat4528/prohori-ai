import React from "react";

interface ProhoriMarkProps {
  size?: number;
  variant?: "reverse" | "primary"; // reverse = on dark Navy, primary = on light Cream
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Official Prohori AI Sentinel Shield Mark
 * Elements:
 *  - Flat headline bar: Echoes the Bengali Matra (মাত্রা)
 *  - Outer shield: Fortress / Sentinel perimeter
 *  - Inner arc: The vigilant watching eye
 *  - Coral pupil & dark iris: Real-time threat detection focal point
 */
export const ProhoriMark: React.FC<ProhoriMarkProps> = ({
  size = 32,
  variant = "reverse",
  className = "",
  style = {}
}) => {
  const isReverse = variant === "reverse";
  const shieldFill = isReverse ? "var(--cream)" : "var(--navy)";
  const eyeStroke = isReverse ? "var(--navy)" : "var(--cream)";
  const pupilNavy = "var(--navy)";
  const coral = "var(--coral)";

  // Original aspect ratio: 120 width x 124 height
  const height = Math.round((size * 124) / 120);

  return (
    <svg
      viewBox="0 0 120 124"
      width={size}
      height={height}
      role="img"
      aria-label="Prohori AI Sentinel Shield Mark"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    >
      {/* Top headline bar echoing the Bengali Matra */}
      <rect x="10" y="6" width="100" height="9" rx="4.5" fill={coral} />

      {/* Main defensive shield */}
      <path
        d="M22 26 H98 V64 C98 89 81 104 60 114 C39 104 22 89 22 64 Z"
        fill={shieldFill}
        stroke={shieldFill}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Vigilant watching eye contour */}
      <path
        d="M33 66 Q60 40 87 66 Q60 92 33 66 Z"
        fill="none"
        stroke={eyeStroke}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Threat detection iris & pupil */}
      <circle cx="60" cy="66" r="11" fill={coral} />
      <circle cx="60" cy="66" r="4.5" fill={pupilNavy} />
    </svg>
  );
};

interface ProhoriLogoProps {
  markSize?: number;
  showSubtitle?: boolean;
  isBn?: boolean;
  variant?: "reverse" | "primary";
}

export const ProhoriLogo: React.FC<ProhoriLogoProps> = ({
  markSize = 34,
  showSubtitle = true,
  isBn = false,
  variant = "reverse"
}) => {
  const isReverse = variant === "reverse";
  const textColor = isReverse ? "var(--cream)" : "var(--navy)";
  const subtextColor = isReverse ? "var(--cream-alpha-75)" : "var(--navy-alpha-75)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <ProhoriMark size={markSize} variant={variant} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", lineHeight: 1 }}>
          <span
            style={{
              fontSize: "19px",
              fontWeight: 800,
              letterSpacing: "0.03em",
              color: textColor
            }}
          >
            PROHORI
          </span>
          <span
            className="font-mono"
            style={{
              background: "var(--coral)",
              color: "var(--navy)",
              fontWeight: 800,
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "4px",
              lineHeight: 1
            }}
          >
            AI
          </span>
          <span
            style={{
              fontSize: "15px",
              color: isReverse ? "var(--cream-alpha-85)" : "var(--navy-alpha-85)",
              fontWeight: 700
            }}
          >
            (প্রহরী)
          </span>
        </div>
        {showSubtitle && (
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: subtextColor,
              marginTop: "4px",
              textTransform: "uppercase"
            }}
          >
            {isBn ? "স্বায়ত্তশাসিত এআই ডিফেন্সিভ এসওসি" : "Autonomous AI Defensive SOC"}
          </span>
        )}
      </div>
    </div>
  );
};
