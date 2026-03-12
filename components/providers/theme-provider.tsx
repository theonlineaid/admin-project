"use client";

import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, getStoredMode, type ThemeId, type ThemeMode } from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    const mode = getStoredMode();
    applyTheme(theme, mode);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "dashboard-theme" || e.key === "dashboard-mode" || e.key === "dashboard-font-size" || e.key === "dashboard-font-family") {
        applyTheme(getStoredTheme(), getStoredMode());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  return <>{children}</>;
}
