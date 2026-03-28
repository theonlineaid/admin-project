"use client";

import Link from "next/link";
import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";
import { HeaderStoreRowLayout } from "./header-store-row-layout";

/** Two Row Professional: Row1 logo · centered search · actions | Row2 nav links */
export function HeaderTwoRow({
  siteTitle,
  logoUrl,
  categories,
}: HeaderVariantProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex flex-col gap-2 px-4 py-3">
        <HeaderStoreRowLayout
          logo={<Logo siteTitle={siteTitle} logoUrl={logoUrl} />}
          search={<SearchRow categories={categories} />}
          actions={<ActionIcons className="shrink-0" />}
        />
        <nav className="flex flex-wrap items-center gap-4 border-t border-border pt-2 text-sm">
          <Link href="/categories" className="font-medium text-foreground hover:text-primary">
            Categories
          </Link>
          <Link href="/deals" className="text-muted-foreground hover:text-foreground">
            Deals
          </Link>
          <Link href="/brands" className="text-muted-foreground hover:text-foreground">
            Brands
          </Link>
          <Link href="/flash-sale" className="text-muted-foreground hover:text-foreground">
            Flash Sale
          </Link>
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              href={`/?categorySlug=${c.slug}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
