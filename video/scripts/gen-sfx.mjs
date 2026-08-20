// Synthesize the SFX kit + music bed as 16-bit WAVs into public/sfx/.
// Zero downloads, fully deterministic. Run: `npm run gen:sfx`.
import { writeFileSync, mkdirSync } from "node:fs";

const SR = 44100;
const dir = new URL("../public/sfx/", import.meta.url);
mkdirSync(dir, { recursive: true });

const wav = (name, samples) => {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  writeFileSync(new URL(name, dir), buf);
  return `${name} ${(n / SR).toFixed(2)}s`;
};

const build = (seconds, fn) => {
  const n = Math.floor(SR * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i / n);
  return out;
};

// Deterministic noise so re-running produces byte-identical files.
let seed = 1;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x7fffffff) * 2 - 1;
};

// Band-passed noise sweep — the classic transition whoosh.
const whoosh = build(0.5, (t, p) => {
  const env = Math.sin(Math.PI * p) ** 1.6;
  const tone = Math.sin(2 * Math.PI * (180 + 900 * p) * t) * 0.35;
  return (rnd() * 0.55 + tone) * env * 0.6;
});

// Pitch-drop sine — cartoon pop for text and object entrances.
const pop = build(0.18, (t, p) => {
  const f = 900 * Math.exp(-7 * p) + 160;
  return Math.sin(2 * Math.PI * f * t) * Math.exp(-11 * p) * 0.75;
});

// Sine thump with a click transient — lands on cuts and slams.
const thump = build(0.4, (t, p) => {
  const f = 150 * Math.exp(-9 * p) + 45;
  const body = Math.sin(2 * Math.PI * f * t) * Math.exp(-6 * p);
  const click = rnd() * Math.exp(-90 * p) * 0.4;
  return (body + click) * 0.85;
});

// Two detuned sines a fifth apart — the "fact confirmed" ding.
const ding = build(0.9, (t, p) => {
  const env = Math.exp(-4.5 * p);
  return (
    (Math.sin(2 * Math.PI * 1320 * t) * 0.6 +
      Math.sin(2 * Math.PI * 1979 * t) * 0.3 +
      Math.sin(2 * Math.PI * 2640 * t) * 0.15) *
    env *
    0.5
  );
});

// Rising noise + tone — builds tension into a cut.
const riser = build(1.2, (t, p) => {
  const env = p ** 2;
  const tone = Math.sin(2 * Math.PI * (200 + 1400 * p ** 2) * t);
  return (tone * 0.5 + rnd() * 0.3) * env * 0.55;
});

// 8-bar bed at 110 BPM: kick, offbeat hat, and a warm i-VI-III-VII pad.
const BPM = 110;
const beat = 60 / BPM;
const bars = 8;
const music = build(beat * 4 * bars, (t) => {
  const step = t / beat;
  const inBeat = step % 1;
  const barIdx = Math.floor(step / 4) % 4;

  const kick =
    Math.sin(2 * Math.PI * (110 * Math.exp(-10 * inBeat) + 42) * t) *
    Math.exp(-7 * inBeat) *
    0.5;

  const hatPhase = (step + 0.5) % 1;
  const hat = rnd() * Math.exp(-60 * hatPhase) * 0.12;

  // A minor -> F -> C -> G, one chord per bar.
  const roots = [220, 174.61, 261.63, 196];
  const r = roots[barIdx];
  const pad =
    (Math.sin(2 * Math.PI * r * t) +
      Math.sin(2 * Math.PI * r * 1.005 * t) +
      Math.sin(2 * Math.PI * r * 1.5 * t) * 0.6 +
      Math.sin(2 * Math.PI * r * 2 * t) * 0.35) *
    0.075;

  return kick + hat + pad;
});

console.log(
  [
    wav("whoosh.wav", whoosh),
    wav("pop.wav", pop),
    wav("thump.wav", thump),
    wav("ding.wav", ding),
    wav("riser.wav", riser),
    wav("music.wav", music),
  ].join("\n")
);
