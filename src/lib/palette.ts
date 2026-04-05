import type { DayState } from "./time";

export interface Palette {
  bg: string;
  text: string;
  accent: string;
  glow: string;
}

export const PALETTES: Record<DayState, Palette> = {
  dawn: {
    bg: "linear-gradient(135deg, #2d1b4e 0%, #e8a87c 50%, #ffd89b 100%)",
    text: "#1a1a2e",
    accent: "#e8a87c",
    glow: "rgba(232,168,124,0.3)",
  },
  day: {
    bg: "linear-gradient(135deg, #dce8f5 0%, #f0f4f8 50%, #e8edf3 100%)",
    text: "#1a1a2e",
    accent: "#4a7baa",
    glow: "rgba(74,123,170,0.15)",
  },
  dusk: {
    bg: "linear-gradient(135deg, #1a1a2e 0%, #c06c84 40%, #f67280 100%)",
    text: "#fef0e4",
    accent: "#f67280",
    glow: "rgba(246,114,128,0.3)",
  },
  night: {
    bg: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)",
    text: "#e8e8f0",
    accent: "#6c63ff",
    glow: "rgba(108,99,255,0.25)",
  },
};

export const SLIDER_ZONES = [
  { start: 0, end: 25, color: "rgba(108,99,255,0.35)" },
  { start: 25, end: 33.3, color: "rgba(232,168,124,0.3)" },
  { start: 33.3, end: 70.8, color: "rgba(74,123,170,0.2)" },
  { start: 70.8, end: 79.2, color: "rgba(246,114,128,0.3)" },
  { start: 79.2, end: 100, color: "rgba(108,99,255,0.35)" },
];
