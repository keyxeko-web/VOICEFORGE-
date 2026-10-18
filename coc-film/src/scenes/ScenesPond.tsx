import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, WIDTH, HEIGHT } from "../theme";
import { PondSurface, Underwater } from "../components/Backgrounds";
import { Frog } from "../components/Frog";
import { Camera, Caption, SoundWord } from "../components/Cinematic";
import { BigFish, DragonTwig } from "../components/Props";
import { Bubbles, Ripples } from "../components/Particles";

/** S8 — Dad cannonballs into the pond. */
export const SceneJump: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jump = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const y = interpolate(jump, [0, 1], [HEIGHT - 520, HEIGHT - 60]);
  const x = interpolate(jump, [0, 1], [820, 1020]);
  const spin = interpolate(jump, [0, 1], [0, 360]);
  const splashed = frame > 40;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <PondSurface />
      {/* kid on the bank */}
      <div style={{ position: "absolute", left: 480, top: HEIGHT - 320 }}>
        <Frog size={200} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="surprised" lookX={0.6} lookY={-0.3} arms={0.7} />
      </div>
      {/* dad mid-air */}
      {!splashed && (
        <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${spin}deg)` }}>
          <Frog size={240} mood="happy" arms={0.9} />
        </div>
      )}
      {splashed && <Ripples x={1080} y={HEIGHT * 0.55} from={40} color="rgba(255,255,255,0.7)" />}
      <SoundWord text="Đại bác… ÙM!" x={1050} y={320} from={4} color="#fff" size={78} />
      <Caption vi='“Tránh ra nào — đại bác tới đây!” Ùm! Bố Cóc nhảy ùm xuống ao.' from={10} />
    </AbsoluteFill>
  );
};

/** S9 — Underwater: a big fish suddenly grabs Dad. */
export const SceneFishGrab: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // fish rushes in from the right
  const rush = spring({ frame: frame - 20, fps, config: { damping: 200 }, durationInFrames: 30 });
  const fishX = interpolate(rush, [0, 1], [WIDTH + 200, 760]);
  const mouth = interpolate(frame, [20, 36, 50], [0.1, 1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dadShake = Math.sin(frame * 0.8) * 4 * (frame > 46 ? 1 : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.pondDeep }}>
      <Camera fromScale={1.0} toScale={1.08}>
        <Underwater />
        <Bubbles count={26} seed="grab" />
        {/* dad sinking slowly, then caught */}
        <div style={{ position: "absolute", left: 1040, top: HEIGHT * 0.4 + Math.sin(frame * 0.1) * 10, transform: `rotate(${dadShake}deg)` }}>
          <Frog size={230} mood={frame > 40 ? "surprised" : "happy"} arms={frame > 40 ? 0.9 : 0.2} lookX={0.5} />
        </div>
        {/* kid above */}
        <div style={{ position: "absolute", left: 360, top: HEIGHT * 0.26 }}>
          <Frog size={170} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="surprised" lookX={0.7} lookY={0.4} arms={0.4} />
        </div>
        {/* the fish */}
        <div style={{ position: "absolute", left: fishX, top: HEIGHT * 0.34 }}>
          <BigFish size={760} mouthOpen={mouth} />
        </div>
      </Camera>
      <SoundWord text="OẠP!" x={1000} y={300} from={40} color="#FF5A7A" size={120} />
      <Caption vi='Bỗng… OẠP! Một con cá chó khổng lồ lao tới! “Bố ơi, KHÔÔÔNG!”' from={44} />
    </AbsoluteFill>
  );
};

/** S10 — Little Frog bonks the fish with the dragon-twig; it burps Dad out. */
export const SceneRescue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // kid dives down
  const dive = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 36 });
  const kidX = interpolate(dive, [0, 1], [360, 820]);
  const kidY = interpolate(dive, [0, 1], [HEIGHT * 0.24, HEIGHT * 0.42]);
  const bonk = frame > 40 && frame < 56;
  const burst = frame >= 54;
  const mouth = burst ? 1 : 0.6;
  // dad shoots free after burp
  const freeP = spring({ frame: frame - 54, fps, config: { damping: 200 }, durationInFrames: 30 });
  const dadX = interpolate(freeP, [0, 1], [720, 360]);
  const dadY = interpolate(freeP, [0, 1], [HEIGHT * 0.5, HEIGHT * 0.3]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.pondDeep }}>
      <Underwater />
      <Bubbles count={30} seed="rescue" />
      {/* fish */}
      <div style={{ position: "absolute", left: 700, top: HEIGHT * 0.34, transform: bonk ? "translateX(-14px)" : undefined }}>
        <BigFish size={760} mouthOpen={mouth} />
      </div>
      {/* dad: inside then freed */}
      {frame < 54 ? (
        <div style={{ position: "absolute", left: 760, top: HEIGHT * 0.46 }}>
          <Frog size={150} mood="surprised" arms={0.8} />
        </div>
      ) : (
        <div style={{ position: "absolute", left: dadX, top: dadY, transform: "rotate(-15deg)" }}>
          <Frog size={230} mood="surprised" arms={0.9} />
        </div>
      )}
      {/* kid with twig */}
      <div style={{ position: "absolute", left: kidX, top: kidY, transform: `rotate(${bonk ? -20 : -8}deg)` }}>
        <Frog size={180} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="happy" arms={0.9} lookX={0.4} />
        <DragonTwig size={150} style={{ position: "absolute", top: -40, left: 90 }} />
      </div>
      {bonk && <SoundWord text="CỐP!" x={820} y={HEIGHT * 0.4} from={40} color={COLORS.firefly} size={100} />}
      {burst && <SoundWord text="Ựccc!" x={560} y={HEIGHT * 0.42} from={54} color="#FF9BB5" size={96} />}
      <Caption vi='“Thả bố tớ ra, đồ bắt nạt!” Tí vung gậy rồng — CỐP! Con cá… Ực! nhả bố ra.' from={8} />
    </AbsoluteFill>
  );
};

/** S11 — They surface; hero hug; faint music drifts over. */
export const SceneSurface: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <Camera fromScale={1.1} toScale={1.0}>
        <PondSurface />
        <Ripples x={960} y={HEIGHT * 0.56} from={0} color="rgba(255,255,255,0.6)" />
        {/* hug on a lily pad */}
        <div style={{ position: "absolute", left: 860, top: HEIGHT * 0.5 - 40, width: 320, height: 60, borderRadius: "50%", background: COLORS.forestLeaf }} />
        <div style={{ position: "absolute", left: 870, top: HEIGHT * 0.5 - 250 }}>
          <Frog size={300} mood="happy" lookX={-0.2} lookY={0.2} arms={0.5} />
        </div>
        <div style={{ position: "absolute", left: 1060, top: HEIGHT * 0.5 - 200 }}>
          <Frog size={200} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="happy" lookX={-0.4} lookY={0.1} arms={0.8} flip />
        </div>
        {/* floating notes from afar */}
        {[0, 1, 2, 3].map((i) => {
          const t = (frame * 0.8 + i * 20) % 80;
          const op = interpolate(t, [0, 10, 60, 80], [0, 1, 1, 0]);
          return (
            <div key={i} style={{ position: "absolute", right: 160 + i * 10, top: 260 - t * 1.4, fontSize: 40, color: COLORS.firefly, opacity: op }}>
              {i % 2 ? "♫" : "♪"}
            </div>
          );
        })}
      </Camera>
      <Caption vi='“Bố không sao chứ? Con suýt mất bố rồi!” — “Con là người hùng của bố. Nghe kìa… có tiếng nhạc!”' from={12} />
    </AbsoluteFill>
  );
};
