"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { shopHref, shopQueryFromSearchParams } from "@/lib/shop-url";
import { cn } from "@/lib/utils";

export function ShopSortSelect({ className }: { className?: string }) {
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
      className={cn(
        "rounded-md border border-border bg-background px-2 py-2 text-sm",
        className ?? "w-full",
      )}
      value={value}
      onChange={(e) => {
        const sort = e.target.value;
        const q = shopQueryFromSearchParams(searchParams);
        router.push(
          shopHref({
            ...q,
            sort: sort === "newest" ? null : sort,
          }),
        );
      }}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: low to high</option>
      <option value="price_desc">Price: high to low</option>
    </select>
  );
}
