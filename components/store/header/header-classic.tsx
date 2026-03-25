"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";

/** Classic Marketplace (Amazon-style): Logo | Category dropdown | Search | Icons */
export function HeaderClassic({
  siteTitle,
  logoUrl,
  categories,
}: HeaderVariantProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:gap-3 sm:py-0 sm:h-14">
        <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
        <div className="relative flex shrink-0">
          <select
            className="h-9 rounded-l-lg border border-border bg-muted/50 pl-3 pr-8 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Category"
            defaultValue=""
            onChange={(e) => {
              const slug = e.target.value;
              router.push(slug ? `/?category=${slug}` : "/");
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <SearchRow />
        <ActionIcons className="shrink-0" />
      </div>
    </header>
  );
}
