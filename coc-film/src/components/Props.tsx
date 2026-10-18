import React from "react";
import { COLORS } from "../theme";

/** A twig that happens to look like a little dragon — Tí's treasure. */
export const DragonTwig: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 160,
  style,
}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 200 120" style={{ overflow: "visible", ...style }}>
    <path
      d="M10 70 Q40 50 70 66 Q100 40 140 60 Q170 50 190 30"
      stroke="#6B4A2B"
      strokeWidth="12"
      fill="none"
      strokeLinecap="round"
    />
    {/* little branch 'spikes' */}
    <path d="M70 66 l-10 -22 M110 52 l6 -24 M150 56 l14 -18" stroke="#6B4A2B" strokeWidth="8" strokeLinecap="round" />
    {/* dragon head end */}
    <path d="M186 34 q18 -10 18 -2 q0 10 -14 10 z" fill="#6B4A2B" />
    <circle cx="190" cy="30" r="3" fill="#1B2430" />
  </svg>
);

/** A glowing invitation ticket carried by a firefly. */
export const GlowTicket: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 200,
  style,
}) => (
  <svg width={size} height={size * 0.64} viewBox="0 0 250 160" style={{ overflow: "visible", ...style }}>
    <defs>
      <radialGradient id="tk" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0" stopColor="#FFF6D6" />
        <stop offset="1" stopColor="#FFD86B" />
      </radialGradient>
    </defs>
    <rect x="10" y="20" width="230" height="120" rx="16" fill="url(#tk)" stroke="#E0A82E" strokeWidth="4"
      style={{ filter: "drop-shadow(0 0 24px rgba(255,210,77,0.8))" }} />
    <circle cx="50" cy="80" r="22" fill="none" stroke="#E0A82E" strokeWidth="4" strokeDasharray="4 6" />
    <path d="M44 80 l10 10 l18 -22" stroke="#C96B5A" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="92" y="54" width="130" height="12" rx="6" fill="#C98A2E" />
    <rect x="92" y="78" width="110" height="10" rx="5" fill="#D9A24A" />
    <rect x="92" y="98" width="130" height="10" rx="5" fill="#D9A24A" />
  </svg>
);

/** A friendly-but-startling big pond fish (the 'pike'). Original design. */
export const BigFish: React.FC<{
  size?: number;
  mouthOpen?: number; // 0..1
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({ size = 700, mouthOpen = 0, flip = false, style }) => {
  const gap = 20 + mouthOpen * 60;
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 500 300"
      style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined, ...style }}
    >
      {/* tail */}
      <path d="M470 150 q50 -70 60 -40 q-20 40 0 80 q-10 30 -60 -40 z" fill="#20485C" />
      {/* body */}
      <path
        d="M70 150 Q150 60 300 70 Q430 80 470 150 Q430 220 300 230 Q150 240 70 150 Z"
        fill="#2B5E76"
        stroke="#173A4C"
        strokeWidth="5"
      />
      <path d="M160 150 Q260 110 420 140" stroke="#3C86A8" strokeWidth="6" fill="none" opacity="0.5" />
      {/* fins */}
      <path d="M250 70 q10 -40 50 -40 q-10 30 -20 44 z" fill="#20485C" />
      <path d="M230 230 q10 40 50 46 q-14 -28 -16 -46 z" fill="#20485C" />
      {/* upper jaw */}
      <path d={`M70 ${150 - gap / 2} Q40 ${150 - gap / 2 - 10} 30 ${150 - gap / 2} L120 ${150 - gap / 2} Z`} fill="#2B5E76" />
      {/* mouth */}
      <path
        d={`M30 ${150 - gap / 2} Q90 150 30 ${150 + gap / 2} Q120 ${150 + gap / 4} 150 150 Q120 ${150 - gap / 4} 30 ${150 - gap / 2} Z`}
        fill="#7A2B38"
      />
      {/* teeth */}
      {mouthOpen > 0.2 &&
        new Array(6).fill(0).map((_, i) => (
          <polygon key={i} points={`${40 + i * 18},${150 - gap / 2 + 4} ${48 + i * 18},${150 - gap / 2 + 4} ${44 + i * 18},${150 - gap / 2 + 18}`} fill="#fff" />
        ))}
      {/* eye */}
      <circle cx="120" cy="120" r="22" fill="#F4E7C9" />
      <circle cx="126" cy="122" r="11" fill="#1B2430" />
      <circle cx="122" cy="118" r="3.5" fill="#fff" />
    </svg>
  );
};

/** A tiny firefly sprite (single). */
export const FireflySprite: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 40,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: COLORS.firefly,
      boxShadow: `0 0 ${size * 0.8}px ${size * 0.4}px ${COLORS.fireflyGlow}`,
      ...style,
    }}
  />
);
