import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { MAPS } from "../data/maps";

/** Flag artwork, drawn into the unit square and stretched over each country. */
const FLAGS: Record<string, React.FC> = {
  us: () => (
    <>
      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          x={0}
          y={i / 13}
          width={1}
          height={1 / 13}
          fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"}
        />
      ))}
      <rect x={0} y={0} width={0.42} height={7 / 13} fill="#3C3B6E" />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 5 }).map((_, cIdx) => (
          <circle
            key={`${r}-${cIdx}`}
            cx={0.05 + cIdx * 0.083}
            cy={0.06 + r * 0.125}
            r={0.022}
            fill="#FFFFFF"
          />
        ))
      )}
    </>
  ),
  fr: () => (
    <>
      <rect x={0} y={0} width={1 / 3} height={1} fill="#002395" />
      <rect x={1 / 3} y={0} width={1 / 3} height={1} fill="#FFFFFF" />
      <rect x={2 / 3} y={0} width={1 / 3} height={1} fill="#ED2939" />
    </>
  ),
  de: () => (
    <>
      <rect x={0} y={0} width={1} height={1 / 3} fill="#000000" />
      <rect x={0} y={1 / 3} width={1} height={1 / 3} fill="#DD0000" />
      <rect x={0} y={2 / 3} width={1} height={1 / 3} fill="#FFCE00" />
    </>
  ),
  gb: () => (
    <>
      <rect x={0} y={0} width={1} height={1} fill="#012169" />
      <path d="M0 0 L1 1 M1 0 L0 1" stroke="#FFFFFF" strokeWidth={0.22} fill="none" />
      <path d="M0 0 L1 1 M1 0 L0 1" stroke="#C8102E" strokeWidth={0.1} fill="none" />
      <path d="M0.5 0 L0.5 1 M0 0.5 L1 0.5" stroke="#FFFFFF" strokeWidth={0.32} fill="none" />
      <path d="M0.5 0 L0.5 1 M0 0.5 L1 0.5" stroke="#C8102E" strokeWidth={0.18} fill="none" />
    </>
  ),
  vn: () => (
    <>
      <rect x={0} y={0} width={1} height={1} fill="#DA251D" />
      <path
        d="M0.5 0.2 L0.588 0.404 L0.809 0.427 L0.643 0.577 L0.69 0.795 L0.5 0.68 L0.31 0.795 L0.357 0.577 L0.191 0.427 L0.412 0.404 Z"
        fill="#FFFF00"
      />
    </>
  ),
};

/**
 * A country silhouette filled with its flag and given the same heavy ink
 * contour as everything else, so real map data still reads as drawn artwork.
 * Paths come from Natural Earth via scripts/gen-maps.mjs.
 */
export const FlagMap: React.FC<{
  country: keyof typeof MAPS;
  /** Longest edge of the rendered shape, in px. */
  size: number;
  strokeWidth?: number;
  /** Sine-wave drift so a map sitting on screen never freezes. */
  driftPhase?: number;
}> = ({ country, size, strokeWidth = 9, driftPhase = 0 }) => {
  const frame = useCurrentFrame();
  const map = MAPS[country];
  const [bx, by, bw, bh] = map.bbox;

  // The shape is drawn at its own bbox scale, so convert the desired pixel
  // stroke into user units or thin countries would get hairlines.
  const scale = size / Math.max(bw, bh);
  const sw = strokeWidth / scale;
  const Flag = FLAGS[country] ?? FLAGS.fr;
  const clipId = `clip-${country}`;

  const float = Math.sin((frame + driftPhase) / 34) * 5;
  const tilt = Math.sin((frame + driftPhase) / 47) * 1.6;

  return (
    <svg
      width={bw * scale}
      height={bh * scale}
      viewBox={`${bx} ${by} ${bw} ${bh}`}
      style={{
        overflow: "visible",
        transform: `translateY(${float}px) rotate(${tilt}deg)`,
        filter: `drop-shadow(0 ${sw * 1.4}px 0 rgba(26,18,8,0.28))`,
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={map.d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g transform={`translate(${bx} ${by}) scale(${bw} ${bh})`}>
          <Flag />
        </g>
      </g>
      <path
        d={map.d}
        fill="none"
        stroke={theme.colors.ink}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};
