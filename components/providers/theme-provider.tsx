"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  getStoredMode,
  getStoredDirection,
  getStoredDensity,
  applyDirection,
  applyDensity,
} from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    const mode = getStoredMode();
    applyTheme(theme, mode);
    applyDirection(getStoredDirection());
    applyDensity(getStoredDensity());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "dashboard-theme" || e.key === "dashboard-mode" || e.key === "dashboard-font-size" || e.key === "dashboard-font-family") {
        applyTheme(getStoredTheme(), getStoredMode());
      }
      if (e.key === "dashboard-direction") applyDirection(getStoredDirection());
      if (e.key === "dashboard-density") applyDensity(getStoredDensity());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  return <>{children}</>;
}
