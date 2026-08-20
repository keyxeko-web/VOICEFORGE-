import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { eyeOpen, inkStroke } from "../mascots/rig";

/**
 * A Wright-Flyer-style biplane, drawn head-on: two wings, vertical struts,
 * X bracing, and a goggled pilot who blinks. Wings flex on a sine so the
 * airframe reads as under load rather than pasted on.
 */
export const Biplane: React.FC<{ width?: number; phase?: number }> = ({
  width = 900,
  phase = 0,
}) => {
  const frame = useCurrentFrame();
  const c = theme.colors;
  const s = inkStroke(10);
  const flex = Math.sin((frame + phase) / 14) * 6;
  const bank = Math.sin((frame + phase) / 40) * 1.8;
  const lid = eyeOpen(frame, 76, phase);

  const struts = [-320, -190, -60, 60, 190, 320];
  const ribs = Array.from({ length: 17 }, (_, i) => -400 + i * 50);

  return (
    <svg
      width={width}
      height={width * (420 / 900)}
      viewBox="-450 -210 900 420"
      style={{
        overflow: "visible",
        transform: `rotate(${bank}deg)`,
        filter: "drop-shadow(0 22px 0 rgba(26,18,8,0.22))",
      }}
    >
      {/* Lower wing. */}
      <path
        d={`M-430 ${70 - flex * 0.4} Q0 ${96 + flex} 430 ${70 - flex * 0.4} L430 ${
          116 - flex * 0.4
        } Q0 ${142 + flex} -430 ${116 - flex * 0.4} Z`}
        fill={c.cowSpot}
        {...s}
      />
      {/* Struts and X bracing between the wings. */}
      {struts.map((x) => (
        <line key={x} x1={x} y1={-58} x2={x} y2={92} {...s} strokeWidth={9} />
      ))}
      {struts.slice(0, -1).map((x, i) => (
        <g key={`x-${x}`}>
          <line x1={x} y1={-58} x2={struts[i + 1]} y2={92} {...s} strokeWidth={6} />
          <line x1={struts[i + 1]} y1={-58} x2={x} y2={92} {...s} strokeWidth={6} />
        </g>
      ))}
      {/* Upper wing, drawn last so it sits in front of the bracing. */}
      <path
        d={`M-430 ${-104 - flex * 0.4} Q0 ${-78 + flex} 430 ${-104 - flex * 0.4} L430 ${
          -58 - flex * 0.4
        } Q0 ${-32 + flex} -430 ${-58 - flex * 0.4} Z`}
        fill={c.cowSpot}
        {...s}
      />

      {/* Pilot: helmet, goggles, blinking eyes. */}
      <g transform={`translate(0 ${6 + flex * 0.3})`}>
        <ellipse cx="0" cy="10" rx="68" ry="72" fill={c.cowSpot} {...s} />
        <path d="M-68 -6 Q0 -86 68 -6 Z" fill={c.paper} {...s} strokeWidth={9} />
        <path d="M-22 -60 L-22 -10 M22 -60 L22 -10" stroke={c.red} strokeWidth={11} fill="none" />
        <g transform={`translate(-27 22) scale(1 ${lid})`}>
          <ellipse cx="0" cy="0" rx="19" ry="21" fill={c.paper} {...s} strokeWidth={8} />
          <circle cx="2" cy="2" r="8" fill={c.ink} />
        </g>
        <g transform={`translate(27 22) scale(1 ${lid})`}>
          <ellipse cx="0" cy="0" rx="19" ry="21" fill={c.paper} {...s} strokeWidth={8} />
          <circle cx="-2" cy="2" r="8" fill={c.ink} />
        </g>
      </g>

      {/* Rib stitching across both wings. */}
      {ribs.map((x) => (
        <g key={`rib-${x}`} opacity={0.55}>
          <line
            x1={x}
            y1={-100 - flex * 0.4}
            x2={x}
            y2={-62 - flex * 0.4}
            stroke={theme.colors.inkSoft}
            strokeWidth={4}
          />
          <line
            x1={x}
            y1={74 - flex * 0.4}
            x2={x}
            y2={112 - flex * 0.4}
            stroke={theme.colors.inkSoft}
            strokeWidth={4}
          />
        </g>
      ))}

      {/* Front elevator — the canard the Wright Flyer carried ahead of its wings. */}
      <g>
        <line x1={-120} y1={112} x2={-120} y2={170} {...s} strokeWidth={8} />
        <line x1={120} y1={112} x2={120} y2={170} {...s} strokeWidth={8} />
        <path
          d={`M-206 ${160 + flex * 0.3} Q0 ${174 + flex} 206 ${160 + flex * 0.3} L206 ${
            188 + flex * 0.3
          } Q0 ${202 + flex} -206 ${188 + flex * 0.3} Z`}
          fill={c.cowSpot}
          {...s}
          strokeWidth={8}
        />
      </g>
    </svg>
  );
};
