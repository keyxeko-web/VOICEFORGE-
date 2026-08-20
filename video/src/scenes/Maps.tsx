import React from "react";
import { AbsoluteFill } from "remotion";
import { Sunburst } from "../components/Backgrounds";
import { ChunkyText, Caption } from "../components/ChunkyText";
import { Entrance, Pop, Scene } from "../components/Motion";
import { FlagMap } from "../components/FlagMap";
import { MAPS } from "../data/maps";

const ROW: Array<{ key: keyof typeof MAPS; size: number }> = [
  { key: "us", size: 430 },
  { key: "fr", size: 300 },
  { key: "de", size: 300 },
  { key: "gb", size: 300 },
];

/** MAPS — staggered 5 frames apart, so the race reads country by country. */
export const Maps: React.FC<{ duration: number }> = ({ duration }) => (
  <Scene duration={duration}>
    <Sunburst rays={30} speed={0.09} />

    <AbsoluteFill
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
      }}
    >
      <Entrance delay={2} preset="bouncy" rise={44}>
        <ChunkyText size={92} delay={4} tilt={-1}>
          CUỘC ĐUA TOÀN CẦU
        </ChunkyText>
      </Entrance>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 56 }}>
        {ROW.map((item, i) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            {/* Fixed-height slot: the maps have wildly different aspect ratios,
                and without it every label sits at its own height. */}
            <div style={{ height: 340, display: "flex", alignItems: "center" }}>
              <Pop delay={16 + i * 5}>
                <FlagMap country={item.key} size={item.size} driftPhase={i * 21} />
              </Pop>
            </div>
            <Entrance delay={22 + i * 5} rise={18}>
              <Caption size={30} delay={22 + i * 5}>
                {MAPS[item.key].label}
              </Caption>
            </Entrance>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  </Scene>
);
