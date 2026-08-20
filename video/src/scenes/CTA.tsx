import React from "react";
import { AbsoluteFill } from "remotion";
import { Sunburst } from "../components/Backgrounds";
import { ChunkyText, Caption } from "../components/ChunkyText";
import { Entrance, Pop, Scene, useBreathe } from "../components/Motion";
import { Gau } from "../mascots/Gau";
import { Bo } from "../mascots/Bo";
import { theme } from "../theme";

/** The one glowing element in the whole video lives here. */
const SubscribeButton: React.FC<{ delay: number }> = ({ delay }) => {
  const { scale } = useBreathe({ amp: 0.02, period: 18 });
  return (
    <Pop delay={delay}>
      <div
        style={{
          transform: `scale(${scale})`,
          display: "flex",
          alignItems: "center",
          gap: 22,
          backgroundColor: theme.colors.red,
          border: `${theme.stroke.base}px solid ${theme.colors.ink}`,
          borderRadius: 28,
          padding: "26px 58px",
          boxShadow: `0 14px 0 ${theme.colors.ink}, 0 0 70px ${theme.colors.glow}`,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 64,
          color: theme.colors.paper,
          letterSpacing: 1,
        }}
      >
        {/* Bell drawn as SVG, never an emoji — emoji ignore the palette. */}
        <svg width={58} height={58} viewBox="0 0 64 64">
          <path
            d="M32 6 C22 6 16 13 16 24 c0 12-4 14-6 18h44c-2-4-6-6-6-18 0-11-6-18-16-18Z"
            fill={theme.colors.paper}
            stroke={theme.colors.ink}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <path
            d="M25 48a7 7 0 0 0 14 0"
            fill={theme.colors.paper}
            stroke={theme.colors.ink}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </svg>
        ĐĂNG KÝ KÊNH
      </div>
    </Pop>
  );
};

export const CTA: React.FC<{ duration: number }> = ({ duration }) => (
  <Scene duration={duration}>
    <Sunburst rays={26} speed={0.12} />

    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
      <div style={{ display: "flex", gap: 900, marginBottom: -158 }}>
        <Entrance delay={14} preset="toon" from="bottom" rise={200}>
          <Gau size={300} phase={8} hat={false} talking />
        </Entrance>
        <Entrance delay={19} preset="toon" from="bottom" rise={200}>
          <Bo size={300} phase={33} hat={false} />
        </Entrance>
      </div>
    </AbsoluteFill>

    <AbsoluteFill
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
        paddingBottom: 60,
      }}
    >
      <ChunkyText size={110} delay={2} tilt={-1.5}>
        TẬP SAU CÒN HAY HƠN
      </ChunkyText>
      <SubscribeButton delay={22} />
      <Entrance delay={40} rise={20}>
        <Caption size={32} delay={40}>
          Bấm chuông để không bỏ lỡ tập mới
        </Caption>
      </Entrance>
    </AbsoluteFill>
  </Scene>
);
