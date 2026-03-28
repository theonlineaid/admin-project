"use client";

import { Menu } from "lucide-react";
import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";
import { HeaderStoreRowLayout } from "./header-store-row-layout";

/** Minimal Modern: menu + logo left · centered search · icons right (desktop); stacked on small screens */
export function HeaderMinimal({
  siteTitle,
  logoUrl,
  categories,
}: HeaderVariantProps) {
  const menuBtn = (
    <button
      type="button"
      className="flex shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      aria-label="Menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-2 sm:py-0 sm:min-h-12 sm:flex sm:items-center">
        <HeaderStoreRowLayout
          className="sm:min-h-12"
          logo={
            <div className="flex items-center gap-1">
              {menuBtn}
              <Logo siteTitle={siteTitle} logoUrl={logoUrl} className="text-sm" />
            </div>
          }
          search={<SearchRow categories={categories} />}
          actions={<ActionIcons className="shrink-0" />}
        />
      </div>
    </header>
  );
}
