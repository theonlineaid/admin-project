"use client";

import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";
import { HeaderStoreRowLayout } from "./header-store-row-layout";

/** Classic Marketplace (Amazon-style): logo left · centered search · actions right */
export function HeaderClassic({
  siteTitle,
  logoUrl,
  categories,
}: HeaderVariantProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-2 sm:py-0">
        <HeaderStoreRowLayout
          logo={<Logo siteTitle={siteTitle} logoUrl={logoUrl} />}
          search={<SearchRow categories={categories} />}
          actions={<ActionIcons className="shrink-0" />}
        />
      </div>
    </header>
  );
}
