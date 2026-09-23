"use client";

import { useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, ChevronDown } from "lucide-react";
import type { StorefrontCategory } from "@/lib/storefront";
import { CategoryStrip } from "@/components/storefront/category-nav";
import {
  Logo,
  SearchForm,
  CartButton,
  CartButtonLabeled,
  AccountMenu,
  CategoryMegaMenu,
  HamburgerMenu,
  DeliveryLocation,
  LanguageCurrency,
  type SiteUser,
} from "@/components/storefront/header/header-parts";

export type HeaderVariantProps = {
  siteTitle: string;
  logoUrl: string | null;
  user: SiteUser;
  categories: StorefrontCategory[];
};

/**
 * Style 1 — Marketplace giant (Amazon-style): dark utility bar with delivery
 * location and a search bar merged into the chrome, categories as a second row.
 */
export function HeaderV1({ siteTitle, logoUrl, user, categories }: HeaderVariantProps) {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
        <DeliveryLocation tone="onDark" />
        <SearchForm className="hidden flex-1 sm:block" placeholder="Search products, brands, and categories" />
        <div className="ml-auto flex items-center gap-1">
          <div className="hidden sm:block">
            <AccountMenu user={user} tone="onDark" />
          </div>
          <CartButton tone="onDark" />
        </div>
      </div>
      <SearchForm className="px-4 pb-2.5 sm:hidden" placeholder="Search products" />
      <div className="border-t border-background/15">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 text-sm sm:px-6">
          <HamburgerMenu categories={categories} tone="onDark" />
          <span className="font-medium">All</span>
          <div className="[&_a]:text-background/80 [&_a:hover]:text-background">
            <CategoryStrip categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Style 2 — Vibrant bazaar (Daraz/AliExpress-style): saturated primary bar
 * with an oversized central search field; category icons on a white shelf below.
 */
export function HeaderV2({ siteTitle, logoUrl, user, categories }: HeaderVariantProps) {
  return (
    <div>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
          <SearchForm className="hidden max-w-2xl flex-1 sm:block" placeholder="Search for anything" />
          <div className="ml-auto flex items-center gap-3">
            <LanguageCurrency tone="onPrimary" />
            <AccountMenu user={user} tone="onPrimary" />
            <CartButton tone="onPrimary" />
          </div>
        </div>
        <SearchForm className="px-4 pb-3 sm:hidden" placeholder="Search for anything" />
      </div>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <CategoryStrip categories={categories} />
        </div>
      </div>
    </div>
  );
}

/**
 * Style 3 — Minimal storefront (indie-DTC-style): hamburger + centered logo,
 * search tucked behind an icon. The quietest of the five.
 */
export function HeaderV3({ siteTitle, logoUrl, user, categories }: HeaderVariantProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex items-center py-3">
        <div className="flex w-24 items-center sm:w-32">
          <HamburgerMenu categories={categories} />
        </div>
        <div className="flex flex-1 justify-center">
          <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
        </div>
        <div className="flex w-24 items-center justify-end gap-1 sm:w-32">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            aria-label="Search"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <CartButton />
          <AccountMenu user={user} />
        </div>
      </div>
      {searchOpen ? (
        <SearchForm className="mx-auto max-w-md pb-3" placeholder="Search products" />
      ) : null}
    </div>
  );
}

/**
 * Style 4 — Auction-house classic (eBay-style): "Shop by category" dropdown
 * beside the search bar, with a secondary row of quick links.
 */
export function HeaderV4({ siteTitle, logoUrl, user, categories }: HeaderVariantProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex items-center gap-3 py-3">
        <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
        <CategoryMegaMenu
          categories={categories}
          trigger={
            <button
              type="button"
              className="hidden h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted sm:flex"
            >
              Shop by category <ChevronDown className="h-4 w-4" />
            </button>
          }
        />
        <SearchForm className="hidden flex-1 sm:block" placeholder="Search for anything" />
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <AccountMenu user={user} />
          <CartButton />
        </div>
      </div>
      <SearchForm className="pb-3 sm:hidden" placeholder="Search products" />
      <div className="hidden items-center gap-5 border-t border-border py-2 text-sm text-muted-foreground sm:flex">
        <Link href="/products?sort=newest" className="hover:text-foreground">
          New arrivals
        </Link>
        <Link href="/products" className="hover:text-foreground">
          All products
        </Link>
        <Link href="/orders" className="hover:text-foreground">
          Track an order
        </Link>
      </div>
    </div>
  );
}

/**
 * Style 5 — Handmade-market clean (Etsy-style): pill search bar, text-first
 * sign in / register, understated category links underneath.
 */
export function HeaderV5({ siteTitle, logoUrl, user, categories }: HeaderVariantProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex items-center gap-4 py-4">
        <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
        <SearchForm
          className="hidden max-w-xl flex-1 [&_input]:rounded-full sm:block"
          placeholder="Search for products"
        />
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:block">
            <AccountMenu user={user} labeled />
          </div>
          <CartButtonLabeled />
        </div>
      </div>
      <SearchForm className="pb-3 sm:hidden [&_input]:rounded-full" placeholder="Search products" />
      <div className="border-t border-border">
        <CategoryStrip categories={categories} />
      </div>
    </div>
  );
}

export const HEADER_VARIANTS = {
  "1": HeaderV1,
  "2": HeaderV2,
  "3": HeaderV3,
  "4": HeaderV4,
  "5": HeaderV5,
} as const;
