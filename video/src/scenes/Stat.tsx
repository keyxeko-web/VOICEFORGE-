import React from "react";
import { AbsoluteFill } from "remotion";
import { Sunburst, SpeedLines } from "../components/Backgrounds";
import { ChunkyText } from "../components/ChunkyText";
import { Counter } from "../components/Counter";
import { Entrance, Pop, Scene, ScreenShake } from "../components/Motion";
import { Biplane } from "../components/Plane";

/**
 * STAT — the payoff beat. Plane flies in, then the two numbers land one after
 * the other so the viewer reads them in order instead of all at once.
 */
export const Stat: React.FC<{ duration: number }> = ({ duration }) => (
  <Scene duration={duration}>
    <Sunburst rays={20} speed={0.2} />
    <SpeedLines start={4} count={64} opacity={0.6} />

    <ScreenShake hits={[34, 58]} amplitude={18}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 30,
        }}
      >
        <Entrance delay={2} preset="smooth" from="left" rise={260} scaleFrom={0.82}>
          <Biplane width={980} />
        </Entrance>

        <Pop delay={34} style={{ marginTop: -8 }}>
          <Counter to={125} size={168} delay={34} suffix=" KM" tilt={-2} />
        </Pop>

        <Pop delay={58} style={{ marginTop: 6 }}>
          <ChunkyText size={132} delay={58} tilt={1.5}>
            2 GIỜ 18 PHÚT
          </ChunkyText>
        </Pop>
      </AbsoluteFill>
    </ScreenShake>
  </Scene>
);
