import React from "react";
import { Composition, Folder } from "remotion";
import { FPS, WIDTH, HEIGHT } from "./theme";
import { Film, FILM_DURATION, SCENES } from "./Film";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Film"
        component={Film}
        durationInFrames={FILM_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Folder name="Scenes">
        {SCENES.map((s, i) => (
          <Composition
            key={i}
            id={`S${String(i).padStart(2, "0")}-${s.comp.name || "Scene"}`}
            component={s.comp}
            durationInFrames={s.dur}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
          />
        ))}
      </Folder>
    </>
  );
};
