"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { HeaderDrawer } from "@/components/dashboard/header-drawer";
import { useDashboardLayout } from "@/components/dashboard/dashboard-layout-context";

export function DashboardShell({
  role,
  children,
}: {
  role?: string | null;
  children: React.ReactNode;
}) {
  const { mainPaddingClass } = useDashboardLayout();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar role={role} />
      <HeaderDrawer role={role} />
      <main className={mainPaddingClass}>
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  );
}
