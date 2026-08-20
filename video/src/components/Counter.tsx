import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { ChunkyText } from "./ChunkyText";

/**
 * A number that counts up on a spring and lands in the chunky title treatment.
 * `tabular-nums` is what stops the digits jittering the layout as they change.
 */
export const Counter: React.FC<{
  to: number;
  size: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  tilt?: number;
}> = ({ to, size, delay = 0, decimals = 0, prefix = "", suffix = "", tilt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 55, mass: 1 },
  });
  const value = interpolate(p, [0, 1], [0, to]);

  return (
    <ChunkyText
      size={size}
      delay={delay}
      tilt={tilt}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {`${prefix}${value.toFixed(decimals)}${suffix}`}
    </ChunkyText>
  );
};
