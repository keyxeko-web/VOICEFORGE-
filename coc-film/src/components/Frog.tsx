import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export type Mood = "happy" | "surprised" | "sad" | "sleep" | "neutral";

type FrogProps = {
  /** overall pixel height of the frog */
  size?: number;
  shirt?: string;
  shirtDark?: string;
  mood?: Mood;
  /** pupil look direction, -1..1 */
  lookX?: number;
  lookY?: number;
  /** arms up (e.g. cheering / reaching), -1 down .. 1 up */
  arms?: number;
  /** blink automatically */
  blink?: boolean;
  flip?: boolean;
  style?: React.CSSProperties;
};

/**
 * An ORIGINAL cartoon frog, built from simple geometric shapes.
 * Not derived from any existing character design.
 */
export const Frog: React.FC<FrogProps> = ({
  size = 420,
  shirt = COLORS.dadShirt,
  shirtDark = COLORS.dadShirtDark,
  mood = "happy",
  lookX = 0,
  lookY = 0,
  arms = -1,
  blink = true,
  flip = false,
  style,
}) => {
  const frame = useCurrentFrame();

  // viewBox is 200 wide, 240 tall; scale to `size`
  const W = 200;
  const H = 240;
  const px = (size / H) * W;

  // Auto blink every ~2.3s unless sleeping
  const blinkCycle = frame % 70;
  const isBlink =
    mood !== "sleep" && blink && (blinkCycle < 3 || (blinkCycle > 40 && blinkCycle < 43));
  const eyeOpen = mood === "sleep" ? 0.08 : isBlink ? 0.12 : 1;

  const pupilX = lookX * 6;
  const pupilY = lookY * 5;

  // Mouth path by mood
  const mouth = (() => {
    switch (mood) {
      case "surprised":
        return <ellipse cx="100" cy="150" rx="14" ry="18" fill="#7A2B38" />;
      case "sad":
        return (
          <path
            d="M82 156 Q100 144 118 156"
            stroke="#2C3A2A"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "sleep":
        return (
          <path
            d="M86 150 Q100 158 114 150"
            stroke="#2C3A2A"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "neutral":
        return (
          <path
            d="M84 150 L116 150"
            stroke="#2C3A2A"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
      default:
        return (
          <path
            d="M80 148 Q100 172 120 148"
            stroke="#2C3A2A"
            strokeWidth="5.5"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  })();

  const armAngle = arms * 55; // degrees up

  return (
    <svg
      width={px}
      height={size}
      viewBox={`0 0 ${W} ${H}`}
      style={{
        overflow: "visible",
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      {/* soft ground shadow */}
      <ellipse cx="100" cy="232" rx="62" ry="12" fill={COLORS.shadow} />

      {/* back legs */}
      <g fill={COLORS.frogBody} stroke={COLORS.frogBodyDark} strokeWidth="3">
        <path d="M70 196 q-26 6 -34 26 q-2 10 10 10 q10 -20 30 -22 z" />
        <path d="M130 196 q26 6 34 26 q2 10 -10 10 q-10 -20 -30 -22 z" />
      </g>

      {/* arms (rotate around shoulder) */}
      <g stroke={COLORS.frogBodyDark} strokeWidth="3" fill={COLORS.frogBody}>
        <g transform={`rotate(${armAngle} 72 150)`}>
          <rect x="44" y="142" width="34" height="16" rx="8" />
          <circle cx="46" cy="150" r="10" />
        </g>
        <g transform={`rotate(${-armAngle} 128 150)`}>
          <rect x="122" y="142" width="34" height="16" rx="8" />
          <circle cx="154" cy="150" r="10" />
        </g>
      </g>

      {/* body */}
      <path
        d="M60 150 Q60 118 100 118 Q140 118 140 150 L140 186 Q140 210 100 210 Q60 210 60 186 Z"
        fill={shirt}
        stroke={shirtDark}
        strokeWidth="3"
      />
      {/* shirt check hint */}
      <path
        d="M100 120 L100 208 M70 150 L132 150"
        stroke={shirtDark}
        strokeWidth="2"
        opacity="0.5"
      />
      {/* legs/feet front */}
      <g fill={COLORS.frogBody} stroke={COLORS.frogBodyDark} strokeWidth="3">
        <path d="M80 206 q-6 16 -20 20 q14 6 26 -4 z" />
        <path d="M120 206 q6 16 20 20 q-14 6 -26 -4 z" />
      </g>

      {/* head */}
      <path
        d="M52 112 Q52 70 100 70 Q148 70 148 112 Q148 140 100 140 Q52 140 52 112 Z"
        fill={COLORS.frogBody}
        stroke={COLORS.frogBodyDark}
        strokeWidth="3"
      />
      {/* belly/cheek highlight */}
      <ellipse cx="100" cy="128" rx="30" ry="12" fill={COLORS.frogBelly} opacity="0.55" />

      {/* eye bumps */}
      {[72, 128].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="64" r="26" fill={COLORS.frogBody} stroke={COLORS.frogBodyDark} strokeWidth="3" />
          <circle cx={cx} cy="62" r="19" fill={COLORS.eyeWhite} />
          <g transform={`translate(${cx + pupilX} ${62 + pupilY})`}>
            <ellipse cx="0" cy="0" rx="8" ry={8 * eyeOpen} fill={COLORS.pupil} />
            <circle cx="-2.5" cy={-2.5 * eyeOpen} r={2.2 * eyeOpen} fill="#fff" />
          </g>
          {/* eyelid for blink/sleep */}
          {eyeOpen < 0.9 && (
            <path
              d={`M${cx - 20} 62 Q${cx} ${62 - 2} ${cx + 20} 62`}
              stroke={COLORS.frogBodyDark}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}

      {mouth}

      {/* tiny nostrils */}
      <circle cx="92" cy="134" r="2" fill={COLORS.frogBodyDark} />
      <circle cx="108" cy="134" r="2" fill={COLORS.frogBodyDark} />
    </svg>
  );
};
