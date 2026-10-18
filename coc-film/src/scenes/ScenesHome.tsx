import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { HomeInterior } from "../components/Backgrounds";
import { Frog } from "../components/Frog";
import { Camera, Caption, SoundWord } from "../components/Cinematic";
import { GlowTicket, FireflySprite } from "../components/Props";
import { Fireflies } from "../components/Particles";

/** S1 — Little Frog is bored; Dad reads with headphones and can't hear. */
export const SceneBored: React.FC = () => {
  const frame = useCurrentFrame();
  // Tí tugs/sighs: small bob
  const bob = Math.sin(frame * 0.18) * 6;
  const dadNod = Math.sin(frame * 0.08) * 3;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.forestDark }}>
      <Camera fromScale={1.06} toScale={1.0} panX={10}>
        <HomeInterior />
        {/* Dad on the couch reading, headphones on */}
        <div style={{ position: "absolute", left: 1180, bottom: 230, transform: `rotate(${dadNod}deg)` }}>
          <Frog size={300} mood="neutral" lookY={0.4} arms={-1} />
          {/* headphones */}
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", top: -6, left: 56 }}>
            <path d="M20 60 A40 40 0 0 1 100 60" stroke="#222" strokeWidth="8" fill="none" />
            <rect x="12" y="56" width="18" height="30" rx="7" fill="#333" />
            <rect x="90" y="56" width="18" height="30" rx="7" fill="#333" />
          </svg>
          {/* music notes */}
          {[0, 1, 2].map((i) => {
            const t = (frame * 0.9 + i * 18) % 54;
            const op = interpolate(t, [0, 10, 44, 54], [0, 1, 1, 0]);
            return (
              <div key={i} style={{ position: "absolute", left: 150 + i * 6, top: -t * 1.6, fontSize: 34, opacity: op, color: COLORS.firefly }}>
                ♪
              </div>
            );
          })}
        </div>
        {/* Little frog, bored, looking up at dad */}
        <div style={{ position: "absolute", left: 560, bottom: 150, transform: `translateY(${bob}px)` }}>
          <Frog size={210} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="sad" lookX={0.6} lookY={-0.2} arms={-0.8} />
        </div>
      </Camera>
      <Caption vi='“Bố ơi, con chán quá… mình chơi gì bây giờ ạ?”' from={10} />
    </AbsoluteFill>
  );
};

/** S2 — A firefly flutters in carrying a glowing ticket. */
export const SceneTicketArrives: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // firefly path from top-right to centre
  const p = spring({ frame, fps, config: { damping: 40 }, durationInFrames: 70 });
  const fx = interpolate(p, [0, 1], [1750, 980]);
  const fy = interpolate(p, [0, 1], [120, 430]) + Math.sin(frame * 0.2) * 20;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.forestDark }}>
      <HomeInterior />
      <Fireflies count={6} seed="home" />
      {/* the delivery firefly + ticket */}
      <div style={{ position: "absolute", left: fx, top: fy, transform: "translate(-50%,-50%)" }}>
        <GlowTicket size={210} />
        <FireflySprite size={34} style={{ position: "absolute", top: -6, left: -10 }} />
      </div>
      <div style={{ position: "absolute", left: 540, bottom: 150 }}>
        <Frog size={220} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="surprised" lookX={0.7} lookY={-0.1} arms={0.3} />
      </div>
      <div style={{ position: "absolute", left: 1220, bottom: 230 }}>
        <Frog size={300} mood="happy" lookX={-0.5} lookY={-0.1} arms={-1} />
      </div>
      <SoundWord text="Vù~" x={1500} y={260} from={6} color={COLORS.firefly} size={70} />
      <Caption vi='“Ồ kìa! Một chú đom đóm… mang theo tấm giấy phát sáng!”' from={30} />
    </AbsoluteFill>
  );
};

/** S3 — Reading the invitation: the Fireflies' Night Concert, starting soon. */
export const SceneReadLetter: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.08));
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.forestDark }}>
      <Camera fromScale={1.0} toScale={1.12} originX="48%" originY="55%">
        <HomeInterior />
        <Fireflies count={5} seed="read" />
        {/* both frogs huddled over the ticket */}
        <div style={{ position: "absolute", left: 760, bottom: 150 }}>
          <Frog size={300} mood="happy" lookX={-0.2} lookY={0.5} arms={0.2} />
        </div>
        <div style={{ position: "absolute", left: 1040, bottom: 150 }}>
          <Frog size={210} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="surprised" lookX={-0.4} lookY={0.5} arms={0.2} flip />
        </div>
        <div style={{ position: "absolute", left: 930, bottom: 300, filter: `drop-shadow(0 0 ${glow * 30}px ${COLORS.fireflyGlow})` }}>
          <GlowTicket size={240} />
        </div>
      </Camera>
      <Caption vi='“Vé mời đêm hòa nhạc Đom Đóm — sắp bắt đầu rồi! Mình phải đi thật nhanh thôi!”' from={14} />
    </AbsoluteFill>
  );
};
