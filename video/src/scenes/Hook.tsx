import React from "react";
import { AbsoluteFill } from "remotion";
import { Sunburst, SpeedLines } from "../components/Backgrounds";
import { ChunkyWords, Caption } from "../components/ChunkyText";
import { Entrance, Pop, Scene, ScreenShake } from "../components/Motion";
import { Gau } from "../mascots/Gau";
import { Bo } from "../mascots/Bo";

/** HOOK — mascots land first, wordmark second. Movement inside 15 frames. */
export const Hook: React.FC<{ duration: number }> = ({ duration }) => (
  <Scene duration={duration}>
    <Sunburst rays={28} speed={0.13} />
    <SpeedLines start={2} count={44} opacity={0.42} />

    <ScreenShake hits={[8, 15]} amplitude={12}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
          <Pop delay={6}>
            <Gau size={362} talking phase={0} hat shades={false} />
          </Pop>
          <Pop delay={13}>
            <Bo size={362} phase={26} hat skeptical />
          </Pop>
        </div>

        <Entrance delay={28} preset="bouncy" rise={60} style={{ position: "relative", zIndex: 2, marginTop: 26 }}>
          <ChunkyWords text="HỌC VIỆN BÒ VÀ GẤU" size={96} delay={30} per={3} tilt={-1.5} />
        </Entrance>

        <Entrance delay={54} rise={26} style={{ marginTop: 24, position: "relative", zIndex: 2 }}>
          <Caption size={36} delay={54}>
            Kiến thức khó · kể kiểu dễ hiểu
          </Caption>
        </Entrance>
      </AbsoluteFill>
    </ScreenShake>
  </Scene>
);
