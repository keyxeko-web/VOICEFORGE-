import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS, WIDTH, HEIGHT } from "../theme";

/** Drifting, twinkling fireflies. */
export const Fireflies: React.FC<{ count?: number; seed?: string }> = ({
  count = 26,
  seed = "ff",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const bx = random(`${seed}x${i}`) * WIDTH;
        const by = 120 + random(`${seed}y${i}`) * (HEIGHT - 300);
        const sp = 0.4 + random(`${seed}s${i}`) * 0.8;
        const phase = random(`${seed}p${i}`) * Math.PI * 2;
        const x = bx + Math.sin(frame * 0.02 * sp + phase) * 60;
        const y = by + Math.cos(frame * 0.017 * sp + phase) * 40;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.09 * sp + phase));
        const r = 3 + random(`${seed}r${i}`) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: COLORS.firefly,
              opacity: tw,
              boxShadow: `0 0 ${10 + tw * 18}px ${tw * 8}px ${COLORS.fireflyGlow}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Rising bubbles for underwater scenes. */
export const Bubbles: React.FC<{ count?: number; seed?: string }> = ({
  count = 30,
  seed = "bb",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * WIDTH;
        const speed = 0.6 + random(`${seed}s${i}`) * 1.4;
        const size = 6 + random(`${seed}r${i}`) * 26;
        const start = random(`${seed}o${i}`) * 400;
        const y = HEIGHT + 40 - ((frame * speed + start) % (HEIGHT + 120));
        const wob = Math.sin((frame + start) * 0.05) * 18;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + wob,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.55)",
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7), rgba(255,255,255,0.05) 60%)",
              opacity: 0.8,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Twinkling star field for the night sky. */
export const Stars: React.FC<{ count?: number; seed?: string }> = ({
  count = 70,
  seed = "st",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * WIDTH;
        const y = random(`${seed}y${i}`) * HEIGHT * 0.7;
        const ph = random(`${seed}p${i}`) * 10;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.05 + ph));
        const r = 1 + random(`${seed}r${i}`) * 2.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: "#fff",
              opacity: tw,
              boxShadow: `0 0 ${tw * 6}px #fff`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** A single shooting star that streaks once. */
export const ShootingStar: React.FC<{ from?: number }> = ({ from = 20 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < from || p >= 1) return null;
  const x = interpolate(p, [0, 1], [WIDTH * 0.2, WIDTH * 0.75]);
  const y = interpolate(p, [0, 1], [180, 420]);
  const op = interpolate(p, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 160,
        height: 3,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, #fff 90%)",
        transform: "rotate(28deg)",
        opacity: op,
        boxShadow: "0 0 12px #fff",
        borderRadius: 3,
      }}
    />
  );
};

/** Expanding water ripple rings at a point. */
export const Ripples: React.FC<{
  x: number;
  y: number;
  from?: number;
  color?: string;
}> = ({ x, y, from = 0, color = "rgba(255,255,255,0.5)" }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 14, 28].map((delay, idx) => {
        const t = ((frame - from - delay) % 60) / 60;
        if (frame < from + delay) return null;
        const size = interpolate(t, [0, 1], [10, 180]);
        const op = interpolate(t, [0, 1], [0.6, 0]);
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 6,
              width: size,
              height: size / 3,
              borderRadius: "50%",
              border: `3px solid ${color}`,
              opacity: op,
            }}
          />
        );
      })}
    </>
  );
};
