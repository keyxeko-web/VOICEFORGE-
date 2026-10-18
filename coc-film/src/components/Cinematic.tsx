import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from "remotion";
import { COLORS, FONT_BODY, FONT_TITLE } from "../theme";

/** Cinematic 2.40:1 letterbox bars over a 16:9 frame. */
export const Letterbox: React.FC = () => {
  const barH = 100;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: barH,
          background: "#000",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: barH,
          background: "#000",
        }}
      />
    </AbsoluteFill>
  );
};

type CameraProps = {
  children: React.ReactNode;
  /** start & end scale for a slow push-in / pull-out */
  fromScale?: number;
  toScale?: number;
  /** pan in px across the whole scene */
  panX?: number;
  panY?: number;
  originX?: string;
  originY?: string;
};

/** A slow, eased virtual camera move across the scene. */
export const Camera: React.FC<CameraProps> = ({
  children,
  fromScale = 1,
  toScale = 1,
  panX = 0,
  panY = 0,
  originX = "50%",
  originY = "50%",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const scale = interpolate(p, [0, 1], [fromScale, toScale]);
  const tx = interpolate(p, [0, 1], [0, panX]);
  const ty = interpolate(p, [0, 1], [0, panY]);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
        transformOrigin: `${originX} ${originY}`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

type CaptionProps = {
  vi: string;
  /** appear/disappear window in frames within the scene */
  from?: number;
  duration?: number;
};

/** Subtitle-style caption inside the lower letterbox-safe area. */
export const Caption: React.FC<CaptionProps> = ({ vi, from = 8, duration }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const dur = duration ?? durationInFrames - from - 4;
  const inP = spring({ frame: frame - from, fps, config: { damping: 200 }, durationInFrames: 12 });
  const out = interpolate(
    frame,
    [from + dur - 10, from + dur],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(inP, out);
  const y = interpolate(inP, [0, 1], [24, 0]);
  if (frame < from - 2) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 128,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.25,
          color: COLORS.text,
          textAlign: "center",
          maxWidth: 1300,
          padding: "10px 28px",
          textShadow: "0 3px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
        }}
      >
        {vi}
      </div>
    </div>
  );
};

/** Big floating onomatopoeia / sound word. */
export const SoundWord: React.FC<{
  text: string;
  x: number;
  y: number;
  from?: number;
  color?: string;
  rotate?: number;
  size?: number;
}> = ({ text, x, y, from = 0, color = "#fff", rotate = -6, size = 90 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 9, mass: 0.7 } });
  const op = interpolate(frame - from, [0, 6, 40, 55], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < from) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: FONT_TITLE,
        fontWeight: 800,
        fontSize: size,
        color,
        opacity: op,
        transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${s})`,
        textShadow: "0 4px 0 rgba(0,0,0,0.25), 0 0 20px rgba(0,0,0,0.3)",
        WebkitTextStroke: "3px rgba(0,0,0,0.25)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** Gentle film grain + vignette overlay for a filmic look. */
export const FilmLook: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
