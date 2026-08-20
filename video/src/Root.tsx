import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, Series, staticFile } from "remotion";
import { theme } from "./theme";
import { Grade, Grain, Vignette } from "./components/Backgrounds";
import { Flash } from "./components/Motion";
import { FontStyles } from "./components/FontStyles";
import { Hook } from "./scenes/Hook";
import { Title } from "./scenes/Title";
import { Stat } from "./scenes/Stat";
import { Maps } from "./scenes/Maps";
import { CTA } from "./scenes/CTA";

export const FPS = 30;

/** Scene lengths in frames. Every timing in the video derives from these. */
export const BEATS = {
  hook: 150,
  title: 135,
  stat: 165,
  maps: 150,
  cta: 90,
} as const;

export const TOTAL = Object.values(BEATS).reduce((a, b) => a + b, 0);

/** Absolute frame each scene starts on — used for cut flashes and SFX. */
const CUTS = {
  hook: 0,
  title: BEATS.hook,
  stat: BEATS.hook + BEATS.title,
  maps: BEATS.hook + BEATS.title + BEATS.stat,
  cta: BEATS.hook + BEATS.title + BEATS.stat + BEATS.maps,
};

/** One-shot SFX. Lands 2–3 frames BEFORE its visual: early feels synced. */
const Sfx: React.FC<{ at: number; file: string; volume?: number }> = ({
  at,
  file,
  volume = 0.6,
}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={FPS * 2} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const StyleKit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.gold }}>
    <FontStyles />

    <Series>
      <Series.Sequence durationInFrames={BEATS.hook}>
        <Hook duration={BEATS.hook} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.title}>
        <Title duration={BEATS.title} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.stat}>
        <Stat duration={BEATS.stat} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.maps}>
        <Maps duration={BEATS.maps} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.cta}>
        <CTA duration={BEATS.cta} />
      </Series.Sequence>
    </Series>

    {/* Flashes sit on the cuts so the hard transitions read as impacts. */}
    <Flash at={CUTS.title} />
    <Flash at={CUTS.stat} />
    <Flash at={CUTS.maps} />
    <Flash at={CUTS.cta} />

    {/* Grade above content, grain and vignette on top of everything. */}
    <Grade />
    <Grain />
    <Vignette />

    <Audio src={staticFile("sfx/music.wav")} volume={0.2} loop />

    <Sfx at={CUTS.hook} file="whoosh.wav" volume={0.5} />
    <Sfx at={CUTS.hook + 4} file="pop.wav" volume={0.6} />
    <Sfx at={CUTS.hook + 11} file="pop.wav" volume={0.6} />
    <Sfx at={CUTS.hook + 28} file="ding.wav" volume={0.45} />

    <Sfx at={CUTS.title - 30} file="riser.wav" volume={0.42} />
    <Sfx at={CUTS.title} file="thump.wav" volume={0.75} />
    <Sfx at={CUTS.title + 8} file="whoosh.wav" volume={0.4} />

    <Sfx at={CUTS.stat} file="whoosh.wav" volume={0.55} />
    <Sfx at={CUTS.stat + 32} file="pop.wav" volume={0.7} />
    <Sfx at={CUTS.stat + 56} file="thump.wav" volume={0.6} />
    <Sfx at={CUTS.stat + 60} file="ding.wav" volume={0.5} />

    <Sfx at={CUTS.maps} file="whoosh.wav" volume={0.5} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} file="pop.wav" at={CUTS.maps + 14 + i * 5} volume={0.5} />
    ))}

    <Sfx at={CUTS.cta} file="thump.wav" volume={0.6} />
    <Sfx at={CUTS.cta + 20} file="ding.wav" volume={0.55} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="StyleKit"
    component={StyleKit}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
