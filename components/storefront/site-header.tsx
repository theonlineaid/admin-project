"use client";

import type { StorefrontCategory } from "@/lib/storefront";
import { TopBar, type TopbarItem } from "@/components/storefront/header/topbar";
import { HEADER_VARIANTS } from "@/components/storefront/header/header-variants";
import type { SiteUser } from "@/components/storefront/header/header-parts";

export function SiteHeader({
  siteTitle,
  logoUrl,
  user,
  categories,
  headerVariant,
  topbarItems,
}: {
  siteTitle: string;
  logoUrl: string | null;
  user: SiteUser;
  categories: StorefrontCategory[];
  headerVariant: string;
  topbarItems: TopbarItem[];
}) {
  const HeaderVariant =
    HEADER_VARIANTS[headerVariant as keyof typeof HEADER_VARIANTS] ?? HEADER_VARIANTS["1"];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <TopBar items={topbarItems} />
      <HeaderVariant siteTitle={siteTitle} logoUrl={logoUrl} user={user} categories={categories} />
    </header>
  );
}
