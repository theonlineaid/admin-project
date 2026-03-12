"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredLayout,
  setStoredLayout,
  getStoredSidebarCollapsed,
  setStoredSidebarCollapsed,
  applyLayout,
  type LayoutMode,
} from "@/lib/theme";

type DashboardLayoutContextValue = {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  /** Effective: true when sidebar is shown as narrow (icons only) */
  sidebarNarrow: boolean;
  /** Effective: main content left padding class */
  mainPaddingClass: string;
};

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null);

export function useDashboardLayout() {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx) throw new Error("useDashboardLayout must be used inside DashboardLayoutProvider");
  return ctx;
}

export function DashboardLayoutProvider({
  role,
  children,
}: {
  role?: string | null;
  children: React.ReactNode;
}) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>("sidebar");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  useEffect(() => {
    setLayoutModeState(getStoredLayout());
    setSidebarCollapsedState(getStoredSidebarCollapsed());
  }, []);

  useEffect(() => {
    applyLayout(layoutMode);
  }, [layoutMode]);

  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    setStoredLayout(mode);
    applyLayout(mode);
  };

  const setSidebarCollapsed = (v: boolean) => {
    setSidebarCollapsedState(v);
    setStoredSidebarCollapsed(v);
  };

  const sidebarNarrow =
    layoutMode === "collapsed" || (layoutMode === "sidebar" && sidebarCollapsed);
  const mainPaddingClass =
    layoutMode === "header"
      ? "pl-0 pt-16"
      : sidebarNarrow
        ? "pl-16 pt-16"
        : "pl-64 pt-16";

  const value: DashboardLayoutContextValue = {
    layoutMode,
    setLayoutMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarNarrow,
    mainPaddingClass,
  };

  return (
    <DashboardLayoutContext.Provider value={value}>
      {children}
    </DashboardLayoutContext.Provider>
  );
}
