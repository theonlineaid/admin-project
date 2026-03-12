"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Settings, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  THEMES,
  FONT_FAMILIES,
  getStoredTheme,
  getStoredMode,
  getStoredFontSize,
  getStoredFontFamily,
  setStoredTheme,
  setStoredMode,
  setStoredFontSize,
  setStoredFontFamily,
  applyTheme,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_STEP,
  type ThemeId,
  type ThemeMode,
  type FontFamilyId,
} from "@/lib/theme";
import { formatDate } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function HeaderDrawer() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"notifications" | "theme">("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState<ThemeId>(() => getStoredTheme());
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const [fontSize, setFontSize] = useState<number>(() => getStoredFontSize());
  const [fontFamily, setFontFamily] = useState<FontFamilyId>(() => getStoredFontFamily());

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

  return (
    <>
      <div className="fixed top-0 right-0 z-30 h-16 flex items-center gap-2 pr-6 pl-4 bg-background/95 border-b border-border backdrop-blur">
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
          Theme
        </Button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-card border-l border-border shadow-xl flex flex-col"
            role="dialog"
            aria-label="Settings & Notifications"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Settings & Notifications</h2>
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
                Notifications
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
                Theme
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
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
