"use client";

import Link from "next/link";
import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";

/** Two Bars: Top bar (nav) | Bottom bar (Logo + Search + Icons) */
export function HeaderTwoBars({
  siteTitle,
  logoUrl,
  categories,
}: HeaderVariantProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="bg-muted/80 px-4 py-1.5">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 text-xs sm:justify-end">
          <Link href="/categories" className="text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          <Link href="/deals" className="text-muted-foreground hover:text-foreground">
            Deals
          </Link>
          <Link href="/brands" className="text-muted-foreground hover:text-foreground">
            Brands
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
      <div className="container mx-auto flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
        <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
        <SearchRow categories={categories} />
        <ActionIcons className="shrink-0" />
      </div>
    </header>
  );
}
