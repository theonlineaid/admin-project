"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import type { HeaderVariantProps } from "./types";
import { Logo } from "./logo";
import { SearchRow } from "./search-row";
import { ActionIcons } from "./action-icons";

/** Mega Menu: Row1 Logo | Search | Icons | Row2 ☰ All Categories (mega) | category links */
export function HeaderMegaMenu({
  siteTitle,
  logoUrl,
  categories,
  categoriesWithSubs,
}: HeaderVariantProps) {
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex flex-col px-4">
        <div className="flex items-center gap-4 py-2">
          <Logo siteTitle={siteTitle} logoUrl={logoUrl} />
          <SearchRow categories={categories} />
          <ActionIcons className="shrink-0" />
        </div>
        <nav className="flex items-center gap-1 border-t border-border">
          <div
            className="relative flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 rounded-t"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <Menu className="h-4 w-4" />
            <span>All Categories</span>
            <ChevronDown className="h-4 w-4" />
            {megaOpen && categoriesWithSubs.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-0 w-64 rounded-b-lg border border-border bg-card py-2 shadow-lg">
                {categoriesWithSubs.map((cat) => (
                  <div key={cat.id} className="px-3 py-1">
                    <Link
                      href={`/?categorySlug=${cat.slug}`}
                      className="font-medium text-foreground hover:text-primary block py-1"
                    >
                      {cat.name}
                    </Link>
                    {cat.subcategories?.length > 0 && (
                      <div className="pl-2 mt-0.5 space-y-0.5">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/?categorySlug=${cat.slug}&sub=${sub.slug}`}
                            className="block text-sm text-muted-foreground hover:text-foreground py-0.5"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?categorySlug=${c.slug}`}
              className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
