import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, WIDTH, HEIGHT } from "../theme";
import { ForestPath } from "../components/Backgrounds";
import { Frog } from "../components/Frog";
import { Camera, Caption, SoundWord } from "../components/Cinematic";
import { DragonTwig } from "../components/Props";
import { Fireflies, Ripples } from "../components/Particles";

/** Reusable: a bobbing walking frog. */
const Walker: React.FC<{
  x: number;
  y: number;
  size: number;
  shirt?: string;
  shirtDark?: string;
  speed?: number;
  flip?: boolean;
  mood?: "happy" | "neutral" | "surprised" | "sad";
  arms?: number;
  lookX?: number;
}> = ({ x, y, size, shirt, shirtDark, speed = 0.3, flip = false, mood = "happy", arms = -0.3, lookX = 0.4 }) => {
  const frame = useCurrentFrame();
  const bob = Math.abs(Math.sin(frame * speed)) * 14;
  const lean = Math.sin(frame * speed) * 3;
  return (
    <div style={{ position: "absolute", left: x, top: y - bob, transform: `rotate(${lean}deg)` }}>
      <Frog size={size} shirt={shirt} shirtDark={shirtDark} mood={mood} arms={arms} lookX={lookX} flip={flip} />
    </div>
  );
};

/** S4 — They set off down the forest path. */
export const SceneSetOff: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <Camera fromScale={1.0} toScale={1.05} panX={-40}>
        <ForestPath />
        <Fireflies count={14} seed="setoff" />
        <Walker x={820} y={HEIGHT - 360} size={300} speed={0.28} lookX={0.5} arms={-0.2} />
        <Walker x={1120} y={HEIGHT - 300} size={210} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} speed={0.34} mood="happy" lookX={0.5} arms={0.3} />
      </Camera>
      <Caption vi='“Nếu đi thật nhanh thì mình vẫn kịp,” Bố Cóc nói.' from={10} />
    </AbsoluteFill>
  );
};

/** S5 — Little Frog splashes in a puddle. */
export const ScenePuddle: React.FC = () => {
  const frame = useCurrentFrame();
  const jy = Math.sin((frame % 40) / 40 * Math.PI) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <ForestPath />
      <Fireflies count={10} seed="pud" />
      {/* puddle */}
      <div style={{ position: "absolute", left: 480, top: HEIGHT - 150, width: 420, height: 90, borderRadius: "50%", background: COLORS.water, opacity: 0.85 }} />
      <Ripples x={690} y={HEIGHT - 110} from={0} />
      {/* splashing kid */}
      <div style={{ position: "absolute", left: 560, top: HEIGHT - 300 - jy }}>
        <Frog size={210} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="happy" arms={0.8} lookY={-0.2} />
      </div>
      {/* splash droplets */}
      {new Array(7).fill(0).map((_, i) => {
        const t = (frame % 40) / 40;
        const ang = (i / 7) * Math.PI - Math.PI;
        const d = t * 120;
        return (
          <div key={i} style={{ position: "absolute", left: 690 + Math.cos(ang) * d, top: HEIGHT - 120 - Math.abs(Math.sin(ang)) * d - jy * 0.3, width: 12, height: 12, borderRadius: "50%", background: COLORS.waterLight, opacity: interpolate(t, [0, 1], [0.9, 0]) }} />
        );
      })}
      {/* dad waiting ahead */}
      <div style={{ position: "absolute", left: 1250, top: HEIGHT - 340 }}>
        <Frog size={290} mood="neutral" lookX={-0.6} arms={-1} />
      </div>
      <SoundWord text="Tõm! Tõm!" x={690} y={HEIGHT - 320} from={6} color={COLORS.waterLight} size={80} />
      <Caption vi='Tõm, tõm! “Bố ơi xem này, con đạp nước tung tóe!”' from={12} />
    </AbsoluteFill>
  );
};

/** S6 — Little Frog finds a twig shaped like a dragon. */
export const SceneTwig: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lift = spring({ frame: frame - 10, fps, config: { damping: 10 } });
  const ty = interpolate(lift, [0, 1], [40, -20]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <Camera fromScale={1.08} toScale={1.0}>
        <ForestPath />
        <Fireflies count={10} seed="twig" />
        <div style={{ position: "absolute", left: 620, top: HEIGHT - 320 }}>
          <Frog size={230} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="surprised" lookY={0.3} arms={0.5} />
        </div>
        <div style={{ position: "absolute", left: 760, top: HEIGHT - 300 + ty, transform: `rotate(${lift * 10}deg)` }}>
          <DragonTwig size={200} />
        </div>
        <div style={{ position: "absolute", left: 1260, top: HEIGHT - 350 }}>
          <Frog size={290} mood="happy" lookX={-0.6} arms={-1} />
        </div>
      </Camera>
      <Caption vi='“Ơ, bố nhìn này! Một cây gậy… hình con rồng! Con mang theo nhé!”' from={16} />
    </AbsoluteFill>
  );
};

/** S7 — A rainbow of fireflies; asking Dad's favourite colour. */
export const SceneColours: React.FC = () => {
  const frame = useCurrentFrame();
  const arcGrow = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const colours = ["#F26D6D", "#F5A149", "#F6D64B", "#6FBE4B", "#4BA3D8", "#8E7BE0"];
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <ForestPath />
      {/* firefly rainbow arcs */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
        {colours.map((c, i) => (
          <path
            key={i}
            d={`M${200} ${HEIGHT - 150} A ${760 - i * 34} ${760 - i * 34} 0 0 1 ${WIDTH - 200} ${HEIGHT - 150}`}
            stroke={c}
            strokeWidth="16"
            fill="none"
            opacity={arcGrow * 0.85}
            strokeLinecap="round"
            strokeDasharray="2 26"
          />
        ))}
      </svg>
      <Fireflies count={24} seed="rain" />
      <div style={{ position: "absolute", left: 760, top: HEIGHT - 360 }}>
        <Frog size={290} mood="happy" lookX={0.3} lookY={-0.5} arms={-0.2} />
      </div>
      <div style={{ position: "absolute", left: 1040, top: HEIGHT - 300 }}>
        <Frog size={210} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="happy" lookX={0.1} lookY={-0.6} arms={0.6} />
      </div>
      <Caption vi='“Oaa, cầu vồng đom đóm! Bố thích màu gì nhất ạ?” — “Màu xanh lá, như hai bố con mình.”' from={14} />
    </AbsoluteFill>
  );
};
