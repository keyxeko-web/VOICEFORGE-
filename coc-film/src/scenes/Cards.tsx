import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_BODY, FONT_TITLE } from "../theme";
import { ForestNight, MoonPath } from "../components/Backgrounds";
import { Fireflies, Stars } from "../components/Particles";
import { Frog } from "../components/Frog";

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame, fps, config: { damping: 14, mass: 0.9 } });
  const sub = interpolate(frame, [18, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const float = Math.sin(frame * 0.05) * 10;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <ForestNight />
      <Stars count={60} />
      <Fireflies count={30} />
      {/* two frogs peeking at bottom */}
      <div style={{ position: "absolute", left: "50%", bottom: 40, transform: "translateX(-50%)", display: "flex", gap: 20, alignItems: "flex-end" }}>
        <Frog size={300} mood="happy" lookY={-0.6} arms={-1} />
        <Frog size={200} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="happy" lookY={-0.6} arms={0.6} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 220 }}>
        <div
          style={{
            fontFamily: FONT_TITLE,
            fontWeight: 800,
            fontSize: 150,
            color: COLORS.firefly,
            transform: `scale(${title}) translateY(${float}px)`,
            textShadow: "0 8px 0 rgba(0,0,0,0.35), 0 0 40px rgba(255,210,77,0.6)",
            letterSpacing: 2,
          }}
        >
          BỐ CÓC & TÍ HON
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 58,
            color: COLORS.text,
            opacity: sub,
            marginTop: 10,
            textShadow: "0 3px 12px rgba(0,0,0,0.8)",
          }}
        >
          Đêm Hòa Nhạc Đom Đóm
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16 } });
  const sub = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <MoonPath />
      <Stars count={70} />
      <Fireflies count={18} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: FONT_TITLE,
            fontWeight: 800,
            fontSize: 120,
            color: COLORS.moon,
            transform: `scale(${s})`,
            textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 0 40px rgba(255,244,194,0.5)",
          }}
        >
          Hết
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: 42,
            color: COLORS.textSoft,
            opacity: sub,
            marginTop: 16,
            textAlign: "center",
            maxWidth: 1100,
            textShadow: "0 3px 12px rgba(0,0,0,0.8)",
          }}
        >
          Đôi khi, con đường cùng nhau đi{"\n"}còn tuyệt hơn cả nơi mình định đến.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
