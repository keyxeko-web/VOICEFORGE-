import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

type SpringName = keyof typeof theme.spring;

/**
 * The workhorse entrance: opacity + rise + scale on one spring, never a lone
 * fade. `from` lets a subject slide in from a direction instead of upward.
 */
export const Entrance: React.FC<{
  delay?: number;
  preset?: SpringName;
  rise?: number;
  from?: "bottom" | "top" | "left" | "right";
  scaleFrom?: number;
  rotateFrom?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  delay = 0,
  preset = "smooth",
  rise = 46,
  from = "bottom",
  scaleFrom = 0.9,
  rotateFrom = 0,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring[preset] });

  const dist = interpolate(p, [0, 1], [rise, 0]);
  const axis =
    from === "bottom"
      ? `translateY(${dist}px)`
      : from === "top"
      ? `translateY(${-dist}px)`
      : from === "left"
      ? `translateX(${-dist}px)`
      : `translateX(${dist}px)`;

  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `${axis} scale(${interpolate(p, [0, 1], [scaleFrom, 1])}) rotate(${interpolate(
          p,
          [0, 1],
          [rotateFrom, 0]
        )}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Cartoon pop: overshoots past 1 and settles, with a squash on the way in.
 * This is what makes objects feel drawn rather than tweened.
 */
export const Pop: React.FC<{
  delay?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.toon });
  const squash = interpolate(p, [0, 0.45, 1], [1.35, 0.94, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `scale(${p * (2 - squash)}, ${p * squash})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Idle micro-motion. Anything on screen for more than 2s must breathe. */
export const useBreathe = (opts?: { amp?: number; period?: number; phase?: number }) => {
  const frame = useCurrentFrame();
  const { amp = 0.015, period = 22, phase = 0 } = opts ?? {};
  return {
    scale: 1 + Math.sin((frame + phase) / period) * amp,
    float: Math.sin((frame + phase) / (period * 1.4)) * 4,
    tilt: Math.sin((frame + phase) / (period * 1.9)) * 1.2,
  };
};

/**
 * Camera shake on impact frames. Decays fast — a shake that outlasts its hit
 * reads as a wobble, not a punch.
 */
export const ScreenShake: React.FC<{
  hits: number[];
  amplitude?: number;
  children: React.ReactNode;
}> = ({ hits, amplitude = 16, children }) => {
  const frame = useCurrentFrame();
  let x = 0;
  let y = 0;
  let rot = 0;

  for (const hit of hits) {
    const local = frame - hit;
    if (local < 0 || local > 14) continue;
    const decay = Math.exp(-local / 3.4);
    x += Math.sin(local * 2.7) * amplitude * decay;
    y += Math.cos(local * 3.3) * amplitude * 0.7 * decay;
    rot += Math.sin(local * 2.1) * 0.5 * decay;
  }

  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${rot}deg)` }}>
      {children}
    </AbsoluteFill>
  );
};

/** One-frame-ish white flash to hide a hard cut. */
export const Flash: React.FC<{ at: number; length?: number; color?: string }> = ({
  at,
  length = 7,
  color = "#FFF8DC",
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 1, at + 1, at + length], [0, 0.85, 0], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, pointerEvents: "none" }} />;
};

/**
 * Scene wrapper: pushes in on entry, pulls back and fades on exit. Exits run
 * roughly half the length of entrances so cuts stay punchy.
 */
export const Scene: React.FC<{
  duration: number;
  children: React.ReactNode;
}> = ({ duration, children }) => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 16], [1.06, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [duration - 9, duration], [1, 0.955], {
    easing: theme.ease.in,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    frame,
    [0, 6, duration - 8, duration - 1],
    [0, 1, 1, 0],
    { easing: theme.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ transform: `scale(${enter * exitScale})`, opacity }}>
      {children}
    </AbsoluteFill>
  );
};
