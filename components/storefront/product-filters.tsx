"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type FacetOption = { slug: string; name: string; count: number };

export function ProductFilters({
  categories,
  brands,
}: {
  categories: FacetOption[];
  brands: FacetOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeBrand = searchParams.get("brand");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function pushWith(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function toggleParam(key: "category" | "brand", value: string) {
    pushWith((params) => {
      if (params.get(key) === value) params.delete(key);
      else params.set(key, value);
    });
  }

  function handlePriceSubmit(e: FormEvent) {
    e.preventDefault();
    pushWith((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Category</h3>
        <ul className="mt-3 space-y-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => toggleParam("category", c.slug)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm hover:bg-muted",
                  activeCategory === c.slug
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                <span>{c.name}</span>
                <span className="text-xs">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {brands.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-foreground">Brand</h3>
          <ul className="mt-3 space-y-2">
            {brands.map((b) => (
              <li key={b.slug}>
                <button
                  type="button"
                  onClick={() => toggleParam("brand", b.slug)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm hover:bg-muted",
                    activeBrand === b.slug
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <span>{b.name}</span>
                  <span className="text-xs">{b.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-foreground">Price</h3>
        <form onSubmit={handlePriceSubmit} className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm"
          />
          <button
            type="submit"
            className="h-9 shrink-0 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go
          </button>
        </form>
      </div>

      {activeCategory || activeBrand || minPrice || maxPrice ? (
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="text-sm font-medium text-primary hover:underline"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get("sort") ?? "newest";

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "newest") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 rounded-md border border-border bg-card px-2 text-sm text-card-foreground"
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: low to high</option>
      <option value="price_desc">Price: high to low</option>
    </select>
  );
}
