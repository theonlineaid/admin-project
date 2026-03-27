"use client";

import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";

/** Classic Marketplace (Amazon-style): Logo | unified search (category + query + go) | Icons */
export function HeaderClassic({
  siteTitle,
  logoUrl,
  categories,
}: HeaderVariantProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:gap-3 sm:py-0 sm:h-14">
        <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
        <SearchRow categories={categories} />
        <ActionIcons className="shrink-0" />
      </div>
    </header>
  );
}
