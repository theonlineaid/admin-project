import type { LucideIcon } from "lucide-react";
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
  Settings,
} from "lucide-react";

export type NavItem = { href: string; label: string; key: string; icon: LucideIcon };

export const adminNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", key: "products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", key: "orders", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Users", key: "users", icon: Users },
  { href: "/dashboard/sellers", label: "Sellers", key: "sellers", icon: Store },
  { href: "/dashboard/payments", label: "Payments", key: "payments", icon: CreditCard },
  { href: "/dashboard/categories", label: "Categories", key: "categories", icon: FolderTree },
  { href: "/dashboard/subcategories", label: "Subcategories", key: "subcategories", icon: FolderTree },
  { href: "/dashboard/brands", label: "Brands", key: "brands", icon: Tag },
  { href: "/dashboard/analytics", label: "Analytics", key: "analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Site Settings", key: "settings", icon: Settings },
];

export const sellerNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", key: "products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", key: "orders", icon: ShoppingCart },
];

export function getNavForRole(role?: string | null): NavItem[] {
  return role === "admin" ? adminNav : sellerNav;
}
