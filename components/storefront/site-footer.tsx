"use client";

import type { StorefrontCategory } from "@/lib/storefront";
import { FOOTER_VARIANTS } from "@/components/storefront/footer/footer-variants";

export function SiteFooter({
  siteTitle,
  footerVariant,
  categories,
}: {
  siteTitle: string;
  footerVariant: string;
  categories: StorefrontCategory[];
}) {
  const FooterVariant =
    FOOTER_VARIANTS[footerVariant as keyof typeof FOOTER_VARIANTS] ?? FOOTER_VARIANTS["1"];

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <FooterVariant siteTitle={siteTitle} categories={categories} />
    </footer>
  );
}
