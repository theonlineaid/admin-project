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
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const adminNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Users", icon: Users },
  { href: "/dashboard/sellers", label: "Sellers", icon: Store },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/dashboard/subcategories", label: "Subcategories", icon: FolderTree },
  { href: "/dashboard/brands", label: "Brands", icon: Tag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export const sellerNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
];

export function getNavForRole(role?: string | null): NavItem[] {
  return role === "admin" ? adminNav : sellerNav;
}
