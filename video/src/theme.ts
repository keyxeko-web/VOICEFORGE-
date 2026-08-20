// theme.ts — single source of truth. NEVER inline a colour, easing or spring
// config in a component. Palette sampled from the Vietnamese edutainment
// cartoon look: warm gold sunburst, chunky ink outlines, one hero yellow.
import { Easing } from "remotion";

export const theme = {
  colors: {
    // Background family — the gold sunburst.
    cream: "#FDF3D2",
    gold: "#E9B33C",
    goldDeep: "#B8791A",
    ray: "#FBE3A0",

    // The single hero colour: chunky title yellow, top-to-bottom.
    heroTop: "#FFE45C",
    heroBottom: "#D79A1A",

    // Every outline in the style is this near-black warm ink.
    ink: "#1A1208",
    inkSoft: "#3A2A12",

    paper: "#FFFFFF",
    red: "#D9412F",
    blue: "#3B5CA8",

    // Character fills.
    bear: "#A8764C",
    bearDark: "#8A5C38",
    cow: "#9C7149",
    cowSpot: "#F3F0E6",
    muzzle: "#F0A6AE",
    muzzleDark: "#D97F8B",
    shirtGreen: "#8CCB3F",
    shirtYellow: "#F5C842",
    hatPink: "#EE8FA3",

    glow: "rgba(255, 228, 92, 0.45)",
  },

  fonts: {
    display: '"Baloo2", "Be Vietnam Pro", sans-serif',
    body: '"BeVietnamPro", sans-serif',
  },

  // THE easing curves. Linear is forbidden.
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo — entrances
    inOut: Easing.bezier(0.83, 0, 0.17, 1), // easeInOutQuint — moves, Ken Burns
    in: Easing.bezier(0.7, 0, 0.84, 0), // exits only
  },

  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 }, // words, small pops
    smooth: { damping: 20, stiffness: 90, mass: 1 }, // big elements
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 }, // logos, playful accents
    toon: { damping: 9, stiffness: 210, mass: 0.7 }, // cartoon overshoot
  },

  // Outline weights, in px at 1920x1080.
  stroke: {
    thin: 6,
    base: 10,
    heavy: 14,
  },
} as const;

export type Theme = typeof theme;
