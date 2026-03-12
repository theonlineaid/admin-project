"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, X, Sun, Moon, Maximize2, Minimize2, RotateCcw, ArrowLeftRight, Layout, CircleHelp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  THEMES,
  FONT_FAMILIES,
  LAYOUT_MODES,
  COLOR_MODES,
  getStoredTheme,
  getStoredMode,
  getStoredFontSize,
  getStoredFontFamily,
  setStoredTheme,
  setStoredMode,
  setStoredFontSize,
  setStoredFontFamily,
  applyTheme,
  resetAllSettings,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_STEP,
  FONT_SIZE_DEFAULT,
  getStoredDirection,
  setStoredDirection,
  applyDirection,
  getStoredDensity,
  setStoredDensity,
  applyDensity,
  getStoredColorMode,
  setStoredColorMode,
  applyColorMode,
  type ThemeId,
  type ThemeMode,
  type FontFamilyId,
  type Direction,
  type Density,
  type ColorMode,
} from "@/lib/theme";
import { getNavForRole } from "@/lib/dashboard-nav";
import { useDashboardLayout } from "@/components/dashboard/dashboard-layout-context";
import { useLocale } from "@/components/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function HeaderDrawer({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const { layoutMode, setLayoutMode, setSidebarCollapsed } = useDashboardLayout();
  const { t, locale, setLocale, locales } = useLocale();
  const nav = getNavForRole(role);
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tab, setTab] = useState<"notifications" | "theme">("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState<ThemeId>(() => getStoredTheme());
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const [fontSize, setFontSize] = useState<number>(() => getStoredFontSize());
  const [fontFamily, setFontFamily] = useState<FontFamilyId>(() => getStoredFontFamily());
  const [direction, setDirection] = useState<Direction>(() => getStoredDirection());
  const [density, setDensity] = useState<Density>(() => getStoredDensity());
  const [colorMode, setColorMode] = useState<ColorMode>(() => getStoredColorMode());

  function loadNotifications() {
    fetch("/api/notifications?limit=30")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setNotifications(d.data);
        if (typeof d.unreadCount === "number") setUnreadCount(d.unreadCount);
      })
      .catch(console.error);
  }

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    loadNotifications();
    const t = setInterval(loadNotifications, 45000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function handleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.error("Fullscreen error:", e);
    }
  }

  function handleResetAllSettings() {
    resetAllSettings();
    setTheme("emerald");
    setMode("light");
    setFontSize(FONT_SIZE_DEFAULT);
    setFontFamily("geist");
    setLayoutMode("sidebar");
    setSidebarCollapsed(false);
    setDirection("ltr");
    setDensity("default");
    setColorMode("apparent");
    setLocale("en");
  }

  function handleColorModeChange(mode: ColorMode) {
    setColorMode(mode);
    setStoredColorMode(mode);
    applyColorMode(mode);
  }

  function handleDirectionChange(dir: Direction) {
    setDirection(dir);
    setStoredDirection(dir);
    applyDirection(dir);
  }

  function handleDensityChange(d: Density) {
    setDensity(d);
    setStoredDensity(d);
    applyDensity(d);
  }

  function handleThemeChange(newTheme: ThemeId) {
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme, mode, fontSize, fontFamily);
  }

  function handleModeChange(newMode: ThemeMode) {
    setMode(newMode);
    setStoredMode(newMode);
    applyTheme(theme, newMode, fontSize, fontFamily);
  }

  function handleFontSizeChange(newSize: number) {
    const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, newSize));
    setFontSize(clamped);
    setStoredFontSize(clamped);
    applyTheme(theme, mode, clamped, fontFamily);
  }

  function handleFontFamilyChange(id: FontFamilyId) {
    setFontFamily(id);
    setStoredFontFamily(id);
    applyTheme(theme, mode, fontSize, id);
  }

  function markAsRead(id: string) {
    fetch(`/api/notifications/${id}`, { method: "PATCH" }).then(() => loadNotifications());
  }

  function markAllRead() {
    fetch("/api/notifications/read-all", { method: "POST" }).then(() => loadNotifications());
  }

  const headerRight = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => { setOpen(true); setTab("notifications"); }}
        className="relative p-2 rounded-lg hover:bg-muted text-foreground"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setOpen(true); setTab("theme"); }}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        {t("settings.theme")}
      </Button>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "fixed top-0 z-30 h-16 flex items-center bg-background/95 border-b border-border backdrop-blur",
          layoutMode === "header"
            ? "left-0 right-0 justify-between px-4"
            : "right-0 gap-2 pr-6 pl-4 rtl:right-auto rtl:left-0 rtl:pl-6 rtl:pr-4"
        )}
      >
        {layoutMode === "header" ? (
          <>
            <div className="flex items-center gap-1 overflow-x-auto">
              <Link href="/dashboard" className="font-semibold text-primary text-lg shrink-0 mr-2">
                {t("common.admin")}
              </Link>
              <nav className="flex items-center gap-0.5">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors shrink-0",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t(`nav.${item.key}`)}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {headerRight}
          </>
        ) : (
          headerRight
        )}
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-card shadow-xl flex flex-col border-l border-border rtl:right-auto rtl:left-0 rtl:border-l-0 rtl:border-r rtl:border-border"
            role="dialog"
            aria-label={t("settings.title")}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t("settings.title")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setTab("notifications")}
                className={`flex-1 py-3 text-sm font-medium ${tab === "notifications" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              >
                {t("settings.notifications")}
                {unreadCount > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 rounded">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab("theme")}
                className={`flex-1 py-3 text-sm font-medium ${tab === "theme" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              >
                {t("settings.theme")}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {tab === "notifications" && (
                <div className="space-y-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="mb-2">
                      Mark all as read
                    </Button>
                  )}
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-8 text-center">No notifications</p>
                  ) : (
                    <ul className="space-y-2">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`rounded-lg border border-border p-3 ${!n.read ? "bg-primary/5" : ""}`}
                        >
                          {n.link ? (
                            <Link
                              href={n.link}
                              onClick={() => {
                                markAsRead(n.id);
                                setOpen(false);
                              }}
                              className="block"
                            >
                              <p className="font-medium text-foreground text-sm">{n.title}</p>
                              {n.message && (
                                <p className="text-muted-foreground text-xs mt-1">{n.message}</p>
                              )}
                              <p className="text-muted-foreground text-xs mt-1">
                                {formatDate(n.createdAt)}
                              </p>
                            </Link>
                          ) : (
                            <div>
                              <p className="font-medium text-foreground text-sm">{n.title}</p>
                              {n.message && (
                                <p className="text-muted-foreground text-xs mt-1">{n.message}</p>
                              )}
                              <p className="text-muted-foreground text-xs mt-1">
                                {formatDate(n.createdAt)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => markAsRead(n.id)}
                              >
                                Mark read
                              </Button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {tab === "theme" && (
                <div className="space-y-6">
                  {/* Language */}
                  {locales.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-sm font-medium text-foreground mb-2">{t("settings.language")}</p>
                      <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as Parameters<typeof setLocale>[0])}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {locales.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Nav: Layout as wireframe options */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                        Nav
                      </span>
                      <button type="button" className="p-0.5 rounded-full text-muted-foreground hover:text-foreground" title="Layout options">
                        <CircleHelp className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">Layout</p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Wireframe: left sidebar + content */}
                      <button
                        type="button"
                        onClick={() => setLayoutMode("sidebar")}
                        className={cn(
                          "flex flex-col rounded-lg border-2 p-2 min-h-[72px] transition-colors",
                          layoutMode === "sidebar"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-muted/30 hover:bg-muted/50"
                        )}
                        title="Sidebar (left)"
                      >
                        <div className="flex flex-1 gap-0.5 w-full">
                          <div className={cn("w-4 rounded-sm shrink-0", layoutMode === "sidebar" ? "bg-primary" : "bg-muted-foreground/40")} />
                          <div className={cn("flex-1 rounded-sm", layoutMode === "sidebar" ? "bg-primary/20" : "bg-muted-foreground/20")} />
                        </div>
                      </button>
                      {/* Wireframe: top bar + content */}
                      <button
                        type="button"
                        onClick={() => setLayoutMode("header")}
                        className={cn(
                          "flex flex-col rounded-lg border-2 p-2 min-h-[72px] transition-colors",
                          layoutMode === "header"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-muted/30 hover:bg-muted/50"
                        )}
                        title="Top header"
                      >
                        <div className={cn("w-full h-2 rounded-sm shrink-0 mb-0.5", layoutMode === "header" ? "bg-primary" : "bg-muted-foreground/40")} />
                        <div className={cn("flex-1 rounded-sm", layoutMode === "header" ? "bg-primary/20" : "bg-muted-foreground/20")} />
                      </button>
                      {/* Wireframe: right sidebar + content */}
                      <button
                        type="button"
                        onClick={() => setLayoutMode("collapsed")}
                        className={cn(
                          "flex flex-col rounded-lg border-2 p-2 min-h-[72px] transition-colors",
                          layoutMode === "collapsed"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-muted/30 hover:bg-muted/50"
                        )}
                        title="Icons only (narrow)"
                      >
                        <div className="flex flex-1 gap-0.5 w-full">
                          <div className={cn("flex-1 rounded-sm", layoutMode === "collapsed" ? "bg-primary/20" : "bg-muted-foreground/20")} />
                          <div className={cn("w-2 rounded-sm shrink-0", layoutMode === "collapsed" ? "bg-primary" : "bg-muted-foreground/40")} />
                        </div>
                      </button>
                    </div>
                  </div>
                  {/* Color: Integrate / Apparent */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground">Color</p>
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleColorModeChange("integrate")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-3 flex-1 transition-colors",
                          colorMode === "integrate"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-muted text-foreground"
                        )}
                      >
                        <div className="flex rounded overflow-hidden border border-border h-8 w-10">
                          <div className="w-1/2 bg-muted-foreground/50" />
                          <div className="w-1/2 bg-muted" />
                        </div>
                        <span className="text-xs font-medium">Integrate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleColorModeChange("apparent")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-3 flex-1 transition-colors",
                          colorMode === "apparent"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-muted text-foreground"
                        )}
                      >
                        <div className="flex rounded overflow-hidden border border-border h-8 w-10">
                          <div className="w-1/2 bg-primary" />
                          <div className="w-1/2 bg-primary/30" />
                        </div>
                        <span className="text-xs font-medium">Apparent</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Direction</p>
                    <div className="flex gap-2">
                      <Button
                        variant={direction === "ltr" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDirectionChange("ltr")}
                        className="gap-2"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        Left to right
                      </Button>
                      <Button
                        variant={direction === "rtl" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDirectionChange("rtl")}
                        className="gap-2"
                      >
                        <ArrowLeftRight className="h-4 w-4 rotate-180" />
                        Right to left
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Density</p>
                    <div className="flex gap-2">
                      <Button
                        variant={density === "default" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDensityChange("default")}
                        className="gap-2"
                      >
                        Default
                      </Button>
                      <Button
                        variant={density === "compact" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDensityChange("compact")}
                        className="gap-2"
                      >
                        <Layout className="h-4 w-4" />
                        Compact
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Mode</p>
                    <div className="flex gap-2">
                      <Button
                        variant={mode === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleModeChange("light")}
                        className="gap-2"
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button
                        variant={mode === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleModeChange("dark")}
                        className="gap-2"
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Theme (6 versions)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeChange(t.id)}
                          className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                            theme === t.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <span className="inline-block rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background mb-3">
                      Font
                    </span>
                    <p className="text-sm font-medium text-foreground mb-2">Family</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {FONT_FAMILIES.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleFontFamilyChange(f.id)}
                          className={`flex flex-col items-center justify-center rounded-lg border-2 py-3 px-2 transition-colors ${
                            fontFamily === f.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:bg-muted text-foreground"
                          }`}
                          style={{ fontFamily: f.fontFamily }}
                        >
                          <span className="text-lg font-medium">Aa</span>
                          <span className="text-xs mt-1">{f.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">Size</p>
                    <div className="relative pt-8 pb-1">
                      <div
                        className="absolute top-0 pointer-events-none -translate-x-1/2"
                        style={{
                          left: `${((fontSize - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN)) * 100}%`,
                        }}
                      >
                        <span className="rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-sm whitespace-nowrap">
                          {fontSize}px
                        </span>
                      </div>
                      <div
                        className="px-0.5"
                        style={
                          {
                            "--fill-pct": `${((fontSize - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN)) * 100}%`,
                          } as React.CSSProperties
                        }
                      >
                        <input
                          type="range"
                          min={FONT_SIZE_MIN}
                          max={FONT_SIZE_MAX}
                          step={FONT_SIZE_STEP}
                          value={fontSize}
                          onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
                          list="font-size-ticks"
                          className="font-size-slider w-full"
                          aria-label="Font size"
                        />
                        <datalist id="font-size-ticks">
                          {Array.from(
                            { length: FONT_SIZE_MAX - FONT_SIZE_MIN + 1 },
                            (_, i) => FONT_SIZE_MIN + i
                          ).map((n) => (
                            <option key={n} value={n} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    {/* Tick marks: every size 12–22 so 17, 18, etc. are clear */}
                    <div className="flex justify-between mt-2 px-0.5 text-[10px] text-muted-foreground">
                      {Array.from(
                        { length: FONT_SIZE_MAX - FONT_SIZE_MIN + 1 },
                        (_, i) => FONT_SIZE_MIN + i
                      ).map((n) => (
                        <span
                          key={n}
                          className={fontSize === n ? "font-semibold text-foreground" : ""}
                          style={{ minWidth: "1.25rem", textAlign: "center" }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFullscreen}
                      className="w-full justify-center gap-2"
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="h-4 w-4" />
                          Exit full screen
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-4 w-4" />
                          Full screen
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetAllSettings}
                      className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset all settings
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
