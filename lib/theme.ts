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
const STORAGE_KEY_FONT_SIZE = "dashboard-font-size";

export type ThemeMode = "light" | "dark";

/** Root font size in px: 12 to 22. Default 16. */
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 22;
export const FONT_SIZE_DEFAULT = 16;
export const FONT_SIZE_STEP = 1;

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

export function getStoredFontSize(): number {
  if (typeof window === "undefined") return FONT_SIZE_DEFAULT;
  const v = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
  const n = v ? parseInt(v, 10) : NaN;
  if (!Number.isNaN(n) && n >= FONT_SIZE_MIN && n <= FONT_SIZE_MAX) return n;
  return FONT_SIZE_DEFAULT;
}

export function setStoredFontSize(size: number) {
  if (typeof window === "undefined") return;
  const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, size));
  localStorage.setItem(STORAGE_KEY_FONT_SIZE, String(clamped));
}

export function applyTheme(theme: ThemeId, mode: ThemeMode, fontSize?: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  const px = fontSize ?? (typeof window !== "undefined" ? getStoredFontSize() : FONT_SIZE_DEFAULT);
  root.style.setProperty("--user-font-size", String(px));
}
