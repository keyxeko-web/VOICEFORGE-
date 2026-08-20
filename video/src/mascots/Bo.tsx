import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { eyeOpen, headBob, inkStroke, mouthFlap } from "./rig";

/** Bò — the cow. Big pink muzzle, side ears, optional pink cowboy hat. */
export const Bo: React.FC<{
  size?: number;
  talking?: boolean;
  phase?: number;
  hat?: boolean;
  /** Slightly lowered lids read as the deadpan/skeptical take. */
  skeptical?: boolean;
}> = ({ size = 460, talking = false, phase = 24, hat = true, skeptical = false }) => {
  const frame = useCurrentFrame();
  const bob = headBob(frame, phase);
  const lid = eyeOpen(frame, 104, phase) * (skeptical ? 0.62 : 1);
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
        {/* Torso + shirt. */}
        <path
          d="M104 470 Q108 390 200 378 Q292 390 296 470 L296 520 L104 520 Z"
          fill={c.shirtGreen}
          {...s}
        />
        <path d="M168 382 L200 420 L232 382" fill={c.shirtGreen} {...s} strokeWidth={9} />
        <rect x="128" y="448" width="52" height="44" rx="8" fill="none" {...s} strokeWidth={8} />

        {/* Ears, angled out to the sides. */}
        <ellipse cx="58" cy="196" rx="52" ry="32" fill={c.cow} {...s} transform="rotate(-18 58 196)" />
        <ellipse cx="342" cy="196" rx="52" ry="32" fill={c.cow} {...s} transform="rotate(18 342 196)" />

        {/* Horns. */}
        <path d="M112 96 Q86 58 116 44 Q132 62 130 96" fill={c.cowSpot} {...s} strokeWidth={10} />
        <path d="M288 96 Q314 58 284 44 Q268 62 270 96" fill={c.cowSpot} {...s} strokeWidth={10} />

        {/* Head. */}
        <ellipse cx="200" cy="206" rx="142" ry="148" fill={c.cow} {...s} />

        {/* Muzzle — the biggest single shape on the character. */}
        <g>
          <rect x="98" y="252" width="204" height="118" rx="58" fill={c.muzzle} {...s} />
          <ellipse cx="152" cy="296" rx="17" ry="13" fill={c.muzzleDark} {...s} strokeWidth={8} />
          <ellipse cx="248" cy="296" rx="17" ry="13" fill={c.muzzleDark} {...s} strokeWidth={8} />
          {flap > 0.12 ? (
            <ellipse
              cx="200"
              cy={332 + flap * 4}
              rx={30 + flap * 10}
              ry={7 + flap * 22}
              fill={c.muzzleDark}
              {...s}
              strokeWidth={8}
            />
          ) : (
            <path d="M168 334 Q200 350 232 334" fill="none" {...s} strokeWidth={10} />
          )}
        </g>

        {/* Eyes. */}
        <g transform={`translate(150 176) scale(1 ${lid})`}>
          <ellipse cx="0" cy="0" rx="40" ry="45" fill={c.paper} {...s} />
          <circle cx="8" cy="2" r="18" fill={c.ink} />
        </g>
        <g transform={`translate(256 176) scale(1 ${lid})`}>
          <ellipse cx="0" cy="0" rx="40" ry="45" fill={c.paper} {...s} />
          <circle cx="-8" cy="2" r="18" fill={c.ink} />
        </g>

        {/* Brows — angled down for the skeptical read. */}
        <path
          d={skeptical ? "M108 132 Q148 128 186 146" : "M110 124 Q148 106 186 122"}
          fill="none"
          {...s}
          strokeWidth={13}
        />
        <path
          d={skeptical ? "M214 146 Q252 128 292 132" : "M214 122 Q252 106 290 124"}
          fill="none"
          {...s}
          strokeWidth={13}
        />

        {hat ? (
          <g>
            <path
              d="M40 104 Q200 44 360 104 Q200 152 40 104 Z"
              fill={c.hatPink}
              {...s}
            />
            <path d="M112 96 Q108 20 200 16 Q292 20 288 96 Z" fill={c.hatPink} {...s} />
            <path d="M112 82 Q200 58 288 82" fill="none" stroke={c.muzzleDark} strokeWidth={14} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
