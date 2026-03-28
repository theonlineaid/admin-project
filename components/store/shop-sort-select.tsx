"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { shopHref } from "@/lib/shop-url";

export function ShopSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value =
    searchParams.get("sort") === "price_asc" ||
    searchParams.get("sort") === "price_desc"
      ? searchParams.get("sort")!
      : "newest";

  return (
    <select
      id="shop-sort"
      aria-label="Sort products"
      className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
      value={value}
      onChange={(e) => {
        const sort = e.target.value;
        const href = shopHref({
          search: searchParams.get("search"),
          categorySlug: searchParams.get("categorySlug"),
          brand: searchParams.get("brand"),
          sort: sort === "newest" ? null : sort,
          page: null,
        });
        router.push(href);
      }}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: low to high</option>
      <option value="price_desc">Price: high to low</option>
    </select>
  );
}
