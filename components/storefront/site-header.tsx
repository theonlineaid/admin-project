"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { Search, ShoppingCart, User, Package, LogOut, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { useCart } from "@/components/storefront/cart-context";
import type { StorefrontCategory } from "@/lib/storefront";
import { CategoryStrip } from "@/components/storefront/category-nav";

type SiteUser = { name?: string | null; email?: string | null; role?: string } | null;

export function SiteHeader({
  siteTitle,
  logoUrl,
  user,
  categories,
}: {
  siteTitle: string;
  logoUrl: string | null;
  user: SiteUser;
  categories: StorefrontCategory[];
}) {
  const router = useRouter();
  const { count } = useCart();
  const [q, setQ] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            <Image src={logoUrl} alt={siteTitle} width={32} height={32} className="rounded" />
          ) : null}
          <span className="font-display text-lg font-semibold text-foreground">
            {siteTitle}
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands, and categories"
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </button>
              }
            >
              <div className="px-3 py-2 text-sm">
                <p className="font-medium text-card-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownItem onClick={() => router.push("/orders")}>
                <Package className="mr-2 h-4 w-4" /> My orders
              </DropdownItem>
              {user.role === "admin" || user.role === "seller" ? (
                <DropdownItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownItem>
              ) : null}
              <DropdownItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownItem>
            </Dropdown>
          ) : (
            <Link
              href="/login?callbackUrl=/account"
              className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-foreground hover:bg-muted"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <form onSubmit={handleSearch} className="px-4 pb-3 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="pl-9"
          />
        </div>
      </form>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <CategoryStrip categories={categories} />
      </div>
    </header>
  );
}
