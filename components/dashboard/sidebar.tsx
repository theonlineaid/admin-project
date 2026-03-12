"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getNavForRole } from "@/lib/dashboard-nav";
import { useDashboardLayout } from "@/components/dashboard/dashboard-layout-context";

export function Sidebar({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const { layoutMode, sidebarCollapsed, setSidebarCollapsed, sidebarNarrow } = useDashboardLayout();
  const nav = getNavForRole(role);

  if (layoutMode === "header") return null;

  const narrow = sidebarNarrow;

  return (
    <aside
      className={cn(
        "fixed top-0 z-40 h-screen flex flex-col transition-[width]",
        "bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]",
        "left-0 border-r rtl:left-auto rtl:right-0 rtl:border-r-0 rtl:border-l border-[var(--sidebar-border)]",
        narrow ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-[var(--sidebar-border)] shrink-0", narrow ? "justify-center px-0" : "px-4")}>
        {narrow ? (
          layoutMode === "sidebar" ? (
            <div className="flex items-center justify-between w-full px-2">
              <Link href="/dashboard" className="text-primary font-semibold text-lg" title="Admin">
                A
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/dashboard" className="text-primary font-semibold text-lg" title="Admin">
              A
            </Link>
          )
        ) : (
          <div className="flex items-center justify-between w-full">
            <Link href="/dashboard" className="font-semibold text-primary text-lg">
              Admin
            </Link>
            {layoutMode === "sidebar" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={narrow ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                narrow ? "justify-center" : "",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-[var(--sidebar-muted)] hover:bg-primary/10 hover:text-[var(--sidebar-fg)]"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!narrow && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={cn("border-t border-[var(--sidebar-border)] p-2", narrow ? "flex justify-center" : "")}>
        <Button
          variant="ghost"
          className={cn(
            "w-full text-[var(--sidebar-muted)] hover:text-[var(--sidebar-fg)]",
            narrow ? "justify-center px-0" : "justify-start gap-3"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!narrow && <span>Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
