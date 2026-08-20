import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

/**
 * The signature title treatment: gold gradient fill, very heavy ink outline,
 * and a solid extruded shadow underneath.
 *
 * Built as three stacked copies rather than `-webkit-text-stroke` + `paint-order`
 * on one node — the layered version renders identically in every Chromium build
 * and lets the extrude sit at its own offset.
 */
export const ChunkyText: React.FC<{
  children: string;
  size: number;
  delay?: number;
  /** Degrees of playful tilt held after the pop settles. */
  tilt?: number;
  strokeWidth?: number;
  extrude?: number;
  fillTop?: string;
  fillBottom?: string;
  /** Set false for a static title that another wrapper is already animating. */
  animate?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  size,
  delay = 0,
  tilt = 0,
  strokeWidth,
  extrude,
  fillTop = theme.colors.heroTop,
  fillBottom = theme.colors.heroBottom,
  animate = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sw = strokeWidth ?? Math.max(8, size * 0.075);
  const ex = extrude ?? Math.max(6, size * 0.055);

  const p = animate
    ? spring({ frame: frame - delay, fps, config: theme.spring.toon })
    : 1;

  // Overshoot, then settle — plus a wider-than-tall squash on the way in.
  const scaleX = interpolate(p, [0, 0.4, 1], [0.55, 1.1, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleY = interpolate(p, [0, 0.4, 1], [1.25, 0.9, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rot = interpolate(p, [0, 1], [tilt - 6, tilt], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const base: React.CSSProperties = {
    fontFamily: theme.fonts.display,
    fontWeight: 800,
    fontSize: size,
    lineHeight: 1.04,
    letterSpacing: size * 0.005,
    textTransform: "uppercase",
    whiteSpace: "pre",
    margin: 0,
  };

  const outline: React.CSSProperties = {
    ...base,
    position: "absolute",
    left: 0,
    top: 0,
    WebkitTextStroke: `${sw}px ${theme.colors.ink}`,
    color: theme.colors.ink,
  };

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        opacity: interpolate(p, [0, 0.3], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `scale(${scaleX}, ${scaleY}) rotate(${rot}deg)`,
        ...style,
      }}
    >
      {/* Extruded solid shadow — gives the letters physical thickness. */}
      <span aria-hidden style={{ ...outline, transform: `translate(${ex * 0.35}px, ${ex}px)` }}>
        {children}
      </span>
      {/* The contour itself. */}
      <span aria-hidden style={outline}>
        {children}
      </span>
      {/* Gradient face on top. */}
      <span
        style={{
          ...base,
          position: "relative",
          display: "inline-block",
          backgroundImage: `linear-gradient(180deg, ${fillTop} 12%, ${fillBottom} 92%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {children}
      </span>
    </div>
  );
};

/**
 * Word-by-word variant for headlines that should land one beat at a time.
 * 3-frame offsets — the tightest stagger that still reads as sequential.
 */
export const ChunkyWords: React.FC<{
  text: string;
  size: number;
  delay?: number;
  per?: number;
  gap?: number;
  tilt?: number;
  fillTop?: string;
  fillBottom?: string;
  style?: React.CSSProperties;
}> = ({ text, size, delay = 0, per = 3, gap, tilt = 0, fillTop, fillBottom, style }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "flex-end",
      // Pixel gap, never em: em resolves against the parent font-size (16px),
      // which collapses to nothing next to 150px type.
      gap: gap ?? size * 0.24,
      ...style,
    }}
  >
    {text.split(" ").map((word, i) => (
      <ChunkyText
        key={`${word}-${i}`}
        size={size}
        delay={delay + i * per}
        tilt={tilt}
        fillTop={fillTop}
        fillBottom={fillBottom}
      >
        {word}
      </ChunkyText>
    ))}
  </div>
);

/** Body copy: ink on a soft cream plate, so it survives the gold background. */
export const Caption: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 40, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.snappy });

  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px) scale(${interpolate(
          p,
          [0, 1],
          [0.94, 1]
        )})`,
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        fontSize: size,
        color: theme.colors.ink,
        backgroundColor: "rgba(255,250,232,0.92)",
        border: `${theme.stroke.thin}px solid ${theme.colors.ink}`,
        borderRadius: size * 0.7,
        padding: `${size * 0.28}px ${size * 0.75}px`,
        boxShadow: `0 ${size * 0.16}px 0 ${theme.colors.ink}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
