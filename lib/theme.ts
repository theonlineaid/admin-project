export const THEMES = [
  { id: "emerald", name: "Emerald" },
  { id: "blue", name: "Blue" },
  { id: "violet", name: "Violet" },
  { id: "rose", name: "Rose" },
  { id: "amber", name: "Amber" },
  { id: "slate", name: "Slate" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY_THEME = "dashboard-theme";
const STORAGE_KEY_MODE = "dashboard-mode";
const STORAGE_KEY_FONT_SCALE = "dashboard-font-scale";

export type ThemeMode = "light" | "dark";

/** Font scale factor: 0.875 (small) to 1.25 (large). Default 1. */
export const FONT_SCALE_MIN = 0.875;
export const FONT_SCALE_MAX = 1.25;
export const FONT_SCALE_STEP = 0.0625;
export const FONT_SCALE_DEFAULT = 1;

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "emerald";
  const v = localStorage.getItem(STORAGE_KEY_THEME);
  if (v && THEMES.some((t) => t.id === v)) return v as ThemeId;
  return "emerald";
}

export function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem(STORAGE_KEY_MODE);
  if (v === "dark" || v === "light") return v;
  return "light";
}

export function setStoredTheme(theme: ThemeId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

export function setStoredMode(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MODE, mode);
}

export function getStoredFontScale(): number {
  if (typeof window === "undefined") return FONT_SCALE_DEFAULT;
  const v = localStorage.getItem(STORAGE_KEY_FONT_SCALE);
  const n = v ? parseFloat(v) : NaN;
  if (!Number.isNaN(n) && n >= FONT_SCALE_MIN && n <= FONT_SCALE_MAX) return n;
  return FONT_SCALE_DEFAULT;
}

export function setStoredFontScale(scale: number) {
  if (typeof window === "undefined") return;
  const clamped = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, scale));
  localStorage.setItem(STORAGE_KEY_FONT_SCALE, String(clamped));
}

export function applyTheme(theme: ThemeId, mode: ThemeMode, fontScale?: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  const scale = fontScale ?? (typeof window !== "undefined" ? getStoredFontScale() : FONT_SCALE_DEFAULT);
  root.style.setProperty("--font-scale", String(scale));
}
