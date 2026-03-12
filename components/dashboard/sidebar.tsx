"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  CreditCard,
  FolderTree,
  Tag,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/sellers", label: "Sellers", icon: Store },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/dashboard/subcategories", label: "Subcategories", icon: FolderTree },
  { href: "/dashboard/brands", label: "Brands", icon: Tag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const sellerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
];

export function Sidebar({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const nav = role === "admin" ? adminNav : sellerNav;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard" className="font-semibold text-primary text-lg">
            Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
