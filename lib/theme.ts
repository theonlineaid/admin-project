export const THEMES = [
  { id: "emerald", name: "Emerald" },
  { id: "blue", name: "Blue" },
  { id: "violet", name: "Violet" },
  { id: "rose", name: "Rose" },
  { id: "amber", name: "Amber" },
  { id: "slate", name: "Slate" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

/** 4 font family options for admin. id = storage value, fontFamily = CSS font-family value. */
export const FONT_FAMILIES = [
  { id: "geist", name: "Geist Sans", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" },
  { id: "inter", name: "Inter", fontFamily: "'Inter', system-ui, sans-serif" },
  { id: "public_sans", name: "Public Sans", fontFamily: "'Public Sans', system-ui, sans-serif" },
  { id: "dm_sans", name: "DM Sans", fontFamily: "'DM Sans', system-ui, sans-serif" },
] as const;

export type FontFamilyId = (typeof FONT_FAMILIES)[number]["id"];

/** Layout: sidebar (full + collapse btn), collapsed (icons only), header (nav in top bar). */
export const LAYOUT_MODES = [
  { id: "sidebar", name: "Sidebar", description: "Full sidebar with collapse" },
  { id: "collapsed", name: "Icons only", description: "Collapsed sidebar" },
  { id: "header", name: "Top header", description: "All nav in header" },
] as const;

export type LayoutMode = (typeof LAYOUT_MODES)[number]["id"];

const STORAGE_KEY_THEME = "dashboard-theme";
const STORAGE_KEY_MODE = "dashboard-mode";
const STORAGE_KEY_FONT_SIZE = "dashboard-font-size";
const STORAGE_KEY_FONT_FAMILY = "dashboard-font-family";
const STORAGE_KEY_LAYOUT = "dashboard-layout";
const STORAGE_KEY_SIDEBAR_COLLAPSED = "dashboard-sidebar-collapsed";
const STORAGE_KEY_DIRECTION = "dashboard-direction";
const STORAGE_KEY_DENSITY = "dashboard-density";
const STORAGE_KEY_COLOR_MODE = "dashboard-color-mode";

export type ThemeMode = "light" | "dark";

export type Direction = "ltr" | "rtl";

export type Density = "default" | "compact";

/** Color: Apparent = theme colors visible; Integrate = muted/unified grey accent */
export const COLOR_MODES = [
  { id: "apparent", name: "Apparent" },
  { id: "integrate", name: "Integrate" },
] as const;

export type ColorMode = (typeof COLOR_MODES)[number]["id"];

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

export function getStoredFontFamily(): FontFamilyId {
  if (typeof window === "undefined") return "geist";
  const v = localStorage.getItem(STORAGE_KEY_FONT_FAMILY);
  if (v && FONT_FAMILIES.some((f) => f.id === v)) return v as FontFamilyId;
  return "geist";
}

export function setStoredFontFamily(id: FontFamilyId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_FONT_FAMILY, id);
}

export function applyTheme(
  theme: ThemeId,
  mode: ThemeMode,
  fontSize?: number,
  fontFamilyId?: FontFamilyId
) {
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
  const ffId = fontFamilyId ?? (typeof window !== "undefined" ? getStoredFontFamily() : "geist");
  const ff = FONT_FAMILIES.find((f) => f.id === ffId);
  if (ff) root.style.setProperty("--user-font-family", ff.fontFamily);
}

export function getStoredLayout(): LayoutMode {
  if (typeof window === "undefined") return "sidebar";
  const v = localStorage.getItem(STORAGE_KEY_LAYOUT);
  if (v && LAYOUT_MODES.some((l) => l.id === v)) return v as LayoutMode;
  return "sidebar";
}

export function setStoredLayout(mode: LayoutMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_LAYOUT, mode);
}

export function getStoredSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_SIDEBAR_COLLAPSED) === "true";
}

export function setStoredSidebarCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_SIDEBAR_COLLAPSED, collapsed ? "true" : "false");
}

export function applyLayout(mode: LayoutMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-dashboard-layout", mode);
}

export function getStoredDirection(): Direction {
  if (typeof window === "undefined") return "ltr";
  const v = localStorage.getItem(STORAGE_KEY_DIRECTION);
  if (v === "ltr" || v === "rtl") return v;
  return "ltr";
}

export function setStoredDirection(dir: Direction) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_DIRECTION, dir);
}

/** Applies to entire website (html element). Affects all pages: login, dashboard, etc. */
export function applyDirection(dir: Direction) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("dir", dir);
}

export function getStoredDensity(): Density {
  if (typeof window === "undefined") return "default";
  const v = localStorage.getItem(STORAGE_KEY_DENSITY);
  if (v === "default" || v === "compact") return v;
  return "default";
}

export function setStoredDensity(density: Density) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_DENSITY, density);
}

/** Applies to entire website (html element). Affects all pages: login, dashboard, etc. */
export function applyDensity(density: Density) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-density", density);
}

export function getStoredColorMode(): ColorMode {
  if (typeof window === "undefined") return "apparent";
  const v = localStorage.getItem(STORAGE_KEY_COLOR_MODE);
  if (v === "apparent" || v === "integrate") return v;
  return "apparent";
}

export function setStoredColorMode(mode: ColorMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_COLOR_MODE, mode);
}

/** Applies to entire website. Integrate = muted primary (grey); Apparent = theme colors. */
export function applyColorMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-color-mode", mode);
}

/** Reset all dashboard settings to defaults and apply them. Call from client only. */
export function resetAllSettings() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  setStoredTheme("emerald");
  setStoredMode("light");
  setStoredFontSize(FONT_SIZE_DEFAULT);
  setStoredFontFamily("geist");
  setStoredLayout("sidebar");
  setStoredSidebarCollapsed(false);
  setStoredDirection("ltr");
  setStoredDensity("default");
  setStoredColorMode("apparent");
  applyTheme("emerald", "light", FONT_SIZE_DEFAULT, "geist");
  applyLayout("sidebar");
  applyDirection("ltr");
  applyDensity("default");
  applyColorMode("apparent");
}
