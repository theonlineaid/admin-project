"use client";

import { Menu } from "lucide-react";
import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";

/** Minimal Modern: Logo | Menu | Search | Icons */
export function HeaderMinimal({
  siteTitle,
  logoUrl,
}: HeaderVariantProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-12 items-center gap-3 px-4">
        <button
          type="button"
          className="flex shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo siteTitle={siteTitle} logoUrl={logoUrl} className="text-sm" />
        <div className="hidden lg:flex lg:min-w-0 lg:flex-1 lg:max-w-md">
          <SearchRow />
        </div>
        <div className="flex flex-1 justify-end lg:flex-initial">
          <ActionIcons />
        </div>
        <div className="lg:hidden flex min-w-0 flex-1 max-w-[120px]">
          <SearchRow />
        </div>
      </div>
    </header>
  );
}
