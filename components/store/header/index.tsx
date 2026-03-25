"use client";

import { useState, useEffect } from "react";
import type { StoreHeaderProps, Category, CategoryWithSubs } from "./types";
import { HeaderClassic } from "./header-classic";
import { HeaderTwoRow } from "./header-two-row";
import { HeaderMegaMenu } from "./header-mega-menu";
import { HeaderMinimal } from "./header-minimal";
import { HeaderTwoBars } from "./header-two-bars";

const HEADER_VARIANTS: Record<
  string,
  React.ComponentType<{ siteTitle: string; logoUrl: string | null; categories: Category[]; categoriesWithSubs: CategoryWithSubs[] }>
> = {
  "1": HeaderClassic,
  "2": HeaderTwoRow,
  "3": HeaderMegaMenu,
  "4": HeaderMinimal,
  "5": HeaderTwoBars,
};

export function StoreHeader({ variant, siteTitle, logoUrl }: StoreHeaderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<CategoryWithSubs[]>([]);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (variant === "3") {
      fetch("/api/store/categories/with-subcategories")
        .then((r) => r.json())
        .then((list) => setCategoriesWithSubs(Array.isArray(list) ? list : []))
        .catch(() => setCategoriesWithSubs([]));
    } else {
      setCategoriesWithSubs([]);
    }
  }, [variant]);

  const HeaderComponent = HEADER_VARIANTS[variant] ?? HEADER_VARIANTS["1"];
  const props = {
    siteTitle,
    logoUrl,
    categories,
    categoriesWithSubs,
  };

  return <HeaderComponent {...props} />;
}

// Re-export for consumers who want a specific variant or shared pieces
export { HeaderClassic } from "./header-classic";
export { HeaderTwoRow } from "./header-two-row";
export { HeaderMegaMenu } from "./header-mega-menu";
export { HeaderMinimal } from "./header-minimal";
export { HeaderTwoBars } from "./header-two-bars";
export { ActionIcons } from "./action-icons";
export { Logo } from "./logo";
export { SearchRow } from "./search-row";
export type { StoreHeaderProps, HeaderVariantProps, Category, CategoryWithSubs } from "./types";
