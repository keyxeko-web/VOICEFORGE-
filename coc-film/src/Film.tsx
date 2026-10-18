import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
  type TransitionPresentation,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";

import { Letterbox, FilmLook } from "./components/Cinematic";
import { TitleCard, EndCard } from "./scenes/Cards";
import { SceneBored, SceneTicketArrives, SceneReadLetter } from "./scenes/ScenesHome";
import {
  SceneSetOff,
  ScenePuddle,
  SceneTwig,
  SceneColours,
} from "./scenes/ScenesJourney";
import {
  SceneJump,
  SceneFishGrab,
  SceneRescue,
  SceneSurface,
} from "./scenes/ScenesPond";
import {
  SceneConcertEnds,
  ScenePathHome,
  SceneBedtime,
} from "./scenes/ScenesEnd";

// Scene list with per-scene durations (frames @30fps).
export const SCENES: { comp: React.FC; dur: number }[] = [
  { comp: TitleCard, dur: 90 },
  { comp: SceneBored, dur: 150 },
  { comp: SceneTicketArrives, dur: 135 },
  { comp: SceneReadLetter, dur: 150 },
  { comp: SceneSetOff, dur: 120 },
  { comp: ScenePuddle, dur: 130 },
  { comp: SceneTwig, dur: 130 },
  { comp: SceneColours, dur: 130 },
  { comp: SceneJump, dur: 100 },
  { comp: SceneFishGrab, dur: 150 },
  { comp: SceneRescue, dur: 150 },
  { comp: SceneSurface, dur: 140 },
  { comp: SceneConcertEnds, dur: 150 },
  { comp: ScenePathHome, dur: 170 },
  { comp: SceneBedtime, dur: 160 },
  { comp: EndCard, dur: 120 },
];

const TRANS = 18; // frames per transition

// Total duration accounting for overlapping transitions.
export const FILM_DURATION =
  SCENES.reduce((a, s) => a + s.dur, 0) - TRANS * (SCENES.length - 1);

export const Film: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {SCENES.map((s, i) => {
          const Comp = s.comp;
          const nodes: React.ReactNode[] = [
            <TransitionSeries.Sequence key={`seq-${i}`} durationInFrames={s.dur}>
              <Comp />
            </TransitionSeries.Sequence>,
          ];
          if (i < SCENES.length - 1) {
            // vary the transition style for a more filmic rhythm
            const kind = i % 5;
            const presentation: TransitionPresentation<any> =
              kind === 1
                ? slide({ direction: "from-right" })
                : kind === 3
                ? wipe({ direction: "from-bottom" })
                : fade();
            const timing =
              kind === 1
                ? springTiming({ config: { damping: 200 }, durationInFrames: TRANS })
                : linearTiming({ durationInFrames: TRANS });
            nodes.push(
              <TransitionSeries.Transition
                key={`tr-${i}`}
                presentation={presentation}
                timing={timing}
              />
            );
          }
          return nodes;
        })}
      </TransitionSeries>
      <FilmLook />
      <Letterbox />
    </AbsoluteFill>
  );
};
