import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { eyeOpen, headBob, inkStroke, mouthFlap } from "./rig";

/** Gấu — the bear. Straw boater and shades are the holiday-episode variant. */
export const Gau: React.FC<{
  size?: number;
  talking?: boolean;
  phase?: number;
  hat?: boolean;
  shades?: boolean;
}> = ({ size = 460, talking = false, phase = 0, hat = true, shades = false }) => {
  const frame = useCurrentFrame();
  const bob = headBob(frame, phase);
  const lid = eyeOpen(frame, 88, phase);
  const flap = mouthFlap(frame, talking, phase);
  const c = theme.colors;
  const s = inkStroke(12);

  return (
    <svg
      width={size}
      height={size * (520 / 400)}
      viewBox="0 0 400 520"
      style={{ overflow: "visible", filter: `drop-shadow(0 18px 0 rgba(26,18,8,0.16))` }}
    >
      <g transform={`translate(0 ${bob.y}) rotate(${bob.tilt} 200 240) scale(${bob.scale})`}>
        {/* Torso + shirt, drawn first so the head overlaps it. */}
        <path
          d="M108 470 Q112 392 200 380 Q288 392 292 470 L292 520 L108 520 Z"
          fill={c.shirtYellow}
          {...s}
        />
        <path d="M170 384 L200 424 L230 384" fill={c.paper} {...s} />

        {/* Ears. */}
        <circle cx="92" cy="112" r="52" fill={c.bear} {...s} />
        <circle cx="308" cy="112" r="52" fill={c.bear} {...s} />
        <circle cx="92" cy="112" r="24" fill={c.bearDark} {...s} strokeWidth={8} />
        <circle cx="308" cy="112" r="24" fill={c.bearDark} {...s} strokeWidth={8} />

        {/* Head. */}
        <ellipse cx="200" cy="212" rx="148" ry="152" fill={c.bear} {...s} />

        {/* Muzzle. */}
        <ellipse cx="200" cy="286" rx="92" ry="66" fill={c.bearDark} {...s} strokeWidth={10} />

        {/* Eyes — the lid scale is what sells the blink. */}
        <g transform={`translate(152 190) scale(1 ${lid})`}>
          <ellipse cx="0" cy="0" rx="36" ry="41" fill={c.paper} {...s} />
          <circle cx="6" cy="4" r="17" fill={c.ink} />
        </g>
        <g transform={`translate(252 190) scale(1 ${lid})`}>
          <ellipse cx="0" cy="0" rx="36" ry="41" fill={c.paper} {...s} />
          <circle cx="-6" cy="4" r="17" fill={c.ink} />
        </g>

        {/* Brows. */}
        <path d="M120 132 Q152 112 186 128" fill="none" {...s} strokeWidth={13} />
        <path d="M214 128 Q248 112 280 132" fill="none" {...s} strokeWidth={13} />

        {/* Nose + mouth. The mouth swaps from a closed curve to an open oval. */}
        <ellipse cx="200" cy="248" rx="33" ry="21" fill={c.ink} />
        {flap > 0.12 ? (
          <ellipse
            cx="200"
            cy={318 + flap * 5}
            rx={24 + flap * 12}
            ry={7 + flap * 19}
            fill={c.ink}
            {...s}
            strokeWidth={8}
          />
        ) : (
          <path d="M168 312 Q200 336 232 312" fill="none" {...s} strokeWidth={11} />
        )}

        {hat ? (
          <g>
            <ellipse cx="200" cy="86" rx="176" ry="42" fill={c.shirtYellow} {...s} />
            <path
              d="M104 84 Q100 18 200 14 Q300 18 296 84 Z"
              fill={c.shirtYellow}
              {...s}
            />
            <path d="M104 66 Q200 42 296 66" fill="none" stroke={c.red} strokeWidth={14} />
          </g>
        ) : null}

        {shades ? (
          <g>
            <rect x="96" y="158" width="94" height="66" rx="16" fill={c.ink} {...s} />
            <rect x="210" y="158" width="94" height="66" rx="16" fill={c.ink} {...s} />
            <path d="M190 178 L210 178" {...s} strokeWidth={14} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
