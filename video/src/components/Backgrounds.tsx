import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";

/**
 * The signature gold sunburst. A repeating conic gradient gives perfectly
 * even rays; the radial mask keeps the centre clean so subjects stay readable.
 * Rotation is continuous (a sunburst should never ease), but the ray spread and
 * scale breathe on sine waves so it is never mechanically static.
 */
export const Sunburst: React.FC<{
  rays?: number;
  speed?: number;
  tint?: string;
}> = ({ rays = 26, speed = 0.11, tint = theme.colors.ray }) => {
  const frame = useCurrentFrame();
  const rot = frame * speed;
  const breathe = 1.02 + Math.sin(frame / 48) * 0.035;
  const slice = 360 / rays;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: theme.colors.gold }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 46%, ${theme.colors.cream} 0%, ${theme.colors.gold} 58%, ${theme.colors.goldDeep} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          transform: `scale(${breathe * 1.7}) rotate(${rot}deg)`,
          background: `repeating-conic-gradient(from 0deg at 50% 50%, ${tint} 0deg ${
            slice * 0.52
          }deg, transparent ${slice * 0.52}deg ${slice}deg)`,
          maskImage:
            "radial-gradient(circle at 50% 50%, transparent 6%, rgba(0,0,0,0.65) 24%, black 60%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, transparent 6%, rgba(0,0,0,0.65) 24%, black 60%)",
          opacity: 0.55,
        }}
      />
      {/* Warm bloom in the centre, drifting so the frame never sits still. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(frame / 70) * 4}% ${
            44 + Math.cos(frame / 90) * 3
          }%, rgba(255,246,214,0.85) 0%, transparent 46%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * White radial streaks for impact moments — the "this is the big fact" burst.
 * Springs in behind the subject, then relaxes.
 */
export const SpeedLines: React.FC<{
  start: number;
  count?: number;
  color?: string;
  opacity?: number;
}> = ({ start, count = 40, color = "#FFFFFF", opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const grow = interpolate(local, [0, 14], [0.55, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = interpolate(local, [0, 8, 26, 46], [0, opacity, opacity * 0.7, opacity * 0.45], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slice = 360 / count;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${grow * 2}) rotate(${local * 0.35}deg)`,
          opacity: fade,
          background: `repeating-conic-gradient(from 0deg at 50% 50%, ${color} 0deg ${
            slice * 0.3
          }deg, transparent ${slice * 0.3}deg ${slice}deg)`,
          maskImage: "radial-gradient(circle at 50% 50%, transparent 14%, black 52%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 14%, black 52%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Colour grade — unifies every scene into one warm look. Sits above content. */
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.gold,
        mixBlendMode: "soft-light",
        opacity: 0.16,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(60,36,0,0.13), transparent 26%, transparent 70%, rgba(60,36,0,0.2))",
      }}
    />
  </AbsoluteFill>
);

/** Procedural film grain — no asset file, re-seeded every frame for flicker. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.055 }) => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity,
        mixBlendMode: "multiply",
      }}
    />
  );
};

/** Vignette — always the topmost layer. */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 54%, rgba(40,24,0,0.28) 100%)",
    }}
  />
);
