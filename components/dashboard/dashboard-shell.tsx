"use client";

import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { HeaderDrawer } from "@/components/dashboard/header-drawer";
import { useDashboardLayout } from "@/components/dashboard/dashboard-layout-context";

const agGridModules = [AllCommunityModule];

export function DashboardShell({
  role,
  children,
}: {
  role?: string | null;
  children: React.ReactNode;
}) {
  const { mainPaddingClass } = useDashboardLayout();

  return (
    <AgGridProvider modules={agGridModules}>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar role={role} />
        <HeaderDrawer role={role} />
        <main className={mainPaddingClass}>
          <div className="dashboard-main-content min-h-screen p-6">{children}</div>
        </main>
      </div>
    </AgGridProvider>
  );
}
