import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, WIDTH, HEIGHT } from "../theme";
import { ConcertClearing, MoonPath, HomeInterior } from "../components/Backgrounds";
import { Frog } from "../components/Frog";
import { Camera, Caption } from "../components/Cinematic";
import { Fireflies, Stars, ShootingStar } from "../components/Particles";

/** S12 — They arrive just as the concert ends; Dad reassures Tí. */
export const SceneConcertEnds: React.FC = () => {
  const frame = useCurrentFrame();
  // firefly 'fireworks' fading out
  const fade = interpolate(frame, [0, 60], [1, 0.25], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.forestDark }}>
      <Camera fromScale={1.0} toScale={1.06}>
        <ConcertClearing />
        <div style={{ opacity: fade }}>
          <Fireflies count={40} seed="concert" />
        </div>
        {/* little firefly band packing up on stage */}
        {new Array(4).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: WIDTH / 2 - 260 + i * 150, top: HEIGHT - 430 }}>
            <Frog size={120} shirt={["#F27D9D", "#79C4D8", "#B89BE6", "#FFE58A"][i]} shirtDark="#333" mood="happy" lookX={-0.3} arms={-0.5} />
          </div>
        ))}
        {/* our two frogs arriving at lower-left, a bit out of breath */}
        <div style={{ position: "absolute", left: 300, top: HEIGHT - 360 }}>
          <Frog size={300} mood="neutral" lookX={0.6} arms={-0.6} />
        </div>
        <div style={{ position: "absolute", left: 560, top: HEIGHT - 300 }}>
          <Frog size={210} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="sad" lookX={0.6} arms={-0.7} />
        </div>
      </Camera>
      <Caption vi='Ôi… buổi diễn vừa tan mất rồi. “Đừng buồn con. Cả chặng đường tới đây đã đẹp và vui lắm rồi!”' from={14} />
    </AbsoluteFill>
  );
};

/** S13 — Walking home under the moon; a shooting star; Tí dozes off on Dad's back. */
export const ScenePathHome: React.FC = () => {
  const frame = useCurrentFrame();
  const bob = Math.abs(Math.sin(frame * 0.18)) * 10;
  const asleep = frame > 70;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.nightSky }}>
      <Camera fromScale={1.04} toScale={1.0} panX={-30}>
        <MoonPath />
        <Stars count={70} />
        <Fireflies count={14} seed="home2" />
        <ShootingStar from={24} />
        {/* dad walking, kid riding on his back */}
        <div style={{ position: "absolute", left: 880, top: HEIGHT - 420 - bob }}>
          <Frog size={320} mood="happy" lookX={0.4} lookY={-0.3} arms={-0.4} />
          {/* kid on the back */}
          <div style={{ position: "absolute", left: 150, top: 40 }}>
            <Frog size={170} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood={asleep ? "sleep" : "happy"} lookY={-0.4} arms={-1} />
          </div>
          {asleep && (
            <div style={{ position: "absolute", left: 300, top: 10, fontSize: 40, color: "#fff", opacity: 0.8, transform: `translateY(${-(frame % 40)}px)` }}>
              z
            </div>
          )}
        </div>
      </Camera>
      <Caption vi={asleep ? "Nhưng Tí Hon không nghe thấy nữa — cậu đã ngủ say trên lưng bố." : "“Con có thấy ngôi sao băng kia không? Ước một điều đi nào…”"} from={10} />
    </AbsoluteFill>
  );
};

/** S14 — Home; Dad tucks Tí into bed. */
export const SceneBedtime: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = Math.sin(frame * 0.08) * 4;
  const dim = interpolate(frame, [80, 150], [1, 0.82], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.forestDark }}>
      <Camera fromScale={1.08} toScale={1.0} originY="60%">
        <div style={{ filter: `brightness(${dim})` }}>
          <HomeInterior />
        </div>
        <Fireflies count={5} seed="bed" />
        {/* bed */}
        <div style={{ position: "absolute", left: 620, top: HEIGHT - 300, width: 700, height: 150, borderRadius: 20, background: "#2A3A4E" }} />
        <div style={{ position: "absolute", left: 600, top: HEIGHT - 330, width: 220, height: 180, borderRadius: 20, background: "#35506E" }} />
        {/* sleeping kid */}
        <div style={{ position: "absolute", left: 700, top: HEIGHT - 360 + breath }}>
          <Frog size={180} shirt={COLORS.kidShirt} shirtDark={COLORS.kidShirtDark} mood="sleep" lookY={0.3} arms={-1} />
        </div>
        {/* dad leaning in */}
        <div style={{ position: "absolute", left: 1000, top: HEIGHT - 430 }}>
          <Frog size={280} mood="happy" lookX={-0.6} lookY={0.4} arms={-0.7} />
        </div>
      </Camera>
      <Caption vi='“Ngủ ngon nhé, Tí Hon bé bỏng của bố.” Bố Cóc thì thầm, và khẽ hôn lên trán cậu.' from={16} />
    </AbsoluteFill>
  );
};
