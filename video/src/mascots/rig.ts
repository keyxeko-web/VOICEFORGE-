import { interpolate } from "remotion";
import { theme } from "../theme";

/** Shared ink-outline settings — every shape in the style shares one contour. */
export const inkStroke = (width = 12) =>
  ({
    stroke: theme.colors.ink,
    strokeWidth: width,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  });

/**
 * Eyelid position, 1 = wide open, 0 = shut. Blinks are two frames of close and
 * three of open, on a loop offset per character so they never blink in sync.
 */
export const eyeOpen = (frame: number, every = 88, phase = 0) => {
  const t = (frame + phase) % every;
  return interpolate(t, [0, 2, 4, 7], [1, 0.06, 0.06, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * Mouth openness, 0..1. Three incommensurate sines read as speech rhythm far
 * better than random noise, and stay deterministic across renders.
 */
export const mouthFlap = (frame: number, talking: boolean, phase = 0) => {
  if (!talking) return 0;
  const f = frame + phase;
  const raw =
    Math.sin(f * 0.85) * 0.5 + Math.sin(f * 1.63 + 1.3) * 0.32 + Math.sin(f * 2.71) * 0.18;
  return Math.max(0, Math.min(1, (raw + 1) / 2));
};

/** Idle head motion: a slow float plus a counter-phased tilt. */
export const headBob = (frame: number, phase = 0) => ({
  y: Math.sin((frame + phase) / 26) * 7,
  tilt: Math.sin((frame + phase) / 37) * 2.2,
  scale: 1 + Math.sin((frame + phase) / 31) * 0.012,
});
