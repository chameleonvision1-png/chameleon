"use client";

import React from "react";

interface ChameleonLogoProps {
  activeColor?: string;
  className?: string;
}

/**
 * Typographic Chameleon Logo
 * The word "CHAMELEON" is styled to evoke a chameleon silhouette.
 * When a color is active, the logo fills with that color via smooth transition.
 */
export default function ChameleonLogo({ activeColor, className = "" }: ChameleonLogoProps) {
  const fillColor = activeColor || "#ffffff";

  return (
    <svg
      viewBox="0 0 800 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto select-none ${className}`}
      aria-label="Chameleon Logo"
    >
      <defs>
        {/* Gradient for color reveal */}
        <linearGradient id="chameleonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fillColor} stopOpacity="1">
            <animate
              attributeName="stop-color"
              values={`${fillColor};${fillColor}`}
              dur="0.6s"
              fill="freeze"
            />
          </stop>
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.7">
            <animate
              attributeName="stop-color"
              values={`${fillColor};${fillColor}`}
              dur="0.6s"
              fill="freeze"
            />
          </stop>
        </linearGradient>

        {/* Chameleon tail curl - decorative path */}
        <clipPath id="tailClip">
          <rect x="0" y="0" width="800" height="200" />
        </clipPath>
      </defs>

      {/* Decorative chameleon tail curl starting from the "N" */}
      <path
        d="M 760 100 Q 790 60 780 30 Q 770 10 750 20 Q 735 30 745 50 Q 755 65 760 85"
        fill="none"
        stroke={fillColor}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
        style={{ transition: "stroke 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />

      {/* Chameleon eye (sits above the "A") */}
      <g style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <circle cx="145" cy="55" r="12" fill="none" stroke={fillColor} strokeWidth="2.5" opacity="0.5" />
        <circle cx="145" cy="55" r="5" fill={fillColor} opacity="0.8" />
      </g>

      {/* Main text: CHAMELEON */}
      <text
        x="400"
        y="135"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-montserrat), Montserrat, sans-serif"
        fontWeight="900"
        fontSize="110"
        letterSpacing="-4"
        fill={fillColor}
        style={{
          transition: "fill 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          textTransform: "uppercase",
          filter: activeColor ? "none" : "grayscale(100%)",
        }}
      >
        CHAMELEON
      </text>

      {/* Subtle shadow text for depth */}
      <text
        x="400"
        y="137"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-montserrat), Montserrat, sans-serif"
        fontWeight="900"
        fontSize="110"
        letterSpacing="-4"
        fill={fillColor}
        opacity="0.05"
        style={{
          transition: "fill 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          textTransform: "uppercase",
        }}
      >
        CHAMELEON
      </text>

      {/* Decorative dot pattern (chameleon texture) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={200 + i * 100}
          cy="175"
          r="2"
          fill={fillColor}
          opacity="0.15"
          style={{ transition: "fill 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      ))}
    </svg>
  );
}
