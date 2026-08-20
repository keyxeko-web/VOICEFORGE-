import React from "react";
import { AbsoluteFill } from "remotion";
import { Sunburst, SpeedLines } from "../components/Backgrounds";
import { ChunkyWords, Caption } from "../components/ChunkyText";
import { Entrance, Scene, ScreenShake } from "../components/Motion";
import { Gau } from "../mascots/Gau";
import { Bo } from "../mascots/Bo";

/** TITLE — the slam. Riser into it, thump on the landing, shake on impact. */
export const Title: React.FC<{ duration: number }> = ({ duration }) => (
  <Scene duration={duration}>
    <Sunburst rays={22} speed={-0.16} />
    <SpeedLines start={10} count={54} opacity={0.55} />

    {/* Mascots peek in from the bottom edge — the channel's running gag. */}
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 620, marginBottom: -172 }}>
        <Entrance delay={26} preset="toon" from="bottom" rise={220}>
          <Gau size={330} phase={12} hat={false} />
        </Entrance>
        <Entrance delay={32} preset="toon" from="bottom" rise={220}>
          <Bo size={330} phase={40} hat={false} talking />
        </Entrance>
      </div>
    </AbsoluteFill>

    <ScreenShake hits={[12, 22]} amplitude={22}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 90,
        }}
      >
        <ChunkyWords text="LỊCH SỬ MÁY BAY" size={152} delay={10} per={4} tilt={-1} />
        <Entrance delay={40} rise={28} style={{ marginTop: 40 }}>
          <Caption size={40} delay={40}>
            và cách con người vượt qua giới hạn
          </Caption>
        </Entrance>
      </AbsoluteFill>
    </ScreenShake>
  </Scene>
);
