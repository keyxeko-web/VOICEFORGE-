import { loadFont as loadBaloo } from "@remotion/google-fonts/Baloo2";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";

// Fonts that support Vietnamese diacritics.
export const baloo = loadBaloo("normal", { weights: ["700", "800"] });
export const nunito = loadNunito("normal", { weights: ["400", "700", "800"] });

export const FONT_TITLE = baloo.fontFamily;
export const FONT_BODY = nunito.fontFamily;

// Original colour palette for the film (not taken from any existing work).
export const COLORS = {
  // Characters
  frogBody: "#6DBE4B",
  frogBodyDark: "#4E9A37",
  frogBelly: "#CBE8A8",
  dadShirt: "#F4C542",
  dadShirtDark: "#E0A82E",
  kidShirt: "#C9B6F0",
  kidShirtDark: "#A98FE0",
  eyeWhite: "#FBFBF4",
  pupil: "#1B2430",

  // Night / forest
  nightSky: "#10243B",
  nightSky2: "#1C3A5E",
  forestDark: "#0C1C2E",
  forest: "#143A2E",
  forestLeaf: "#1F5B46",
  leafLight: "#2E7D5B",

  // Water
  pond: "#2E6E8E",
  pondDeep: "#123047",
  water: "#3C86A8",
  waterLight: "#79C4D8",

  // Warmth / lights
  firefly: "#FFE58A",
  fireflyGlow: "#FFD24D",
  moon: "#FFF4C2",
  warmGlow: "#FFCF6B",
  rose: "#F27D9D",
  lilac: "#B89BE6",

  text: "#FFFFFF",
  textSoft: "#EAF2F8",
  shadow: "rgba(0,0,0,0.35)",
};

// Master 2.35:1-ish cinematic feel is achieved with letterbox bars over 16:9.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
