"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { StoreProductSearchBar } from "@/components/store/store-product-search-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  images: string[];
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string } | null;
};

export function HomeProductsSection({
  variant = "default",
  initialProducts,
  categories,
  initialCategoryId,
  initialSearchQuery,
  initialTotal,
  initialTotalPages,
}: {
  variant?: "default" | "index1";
  initialProducts: ProductRow[];
  categories: { id: string; name: string; slug: string }[];
  initialCategoryId: string;
  initialSearchQuery: string;
  initialTotal: number;
  initialTotalPages: number;
}) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [search, setSearch] = useState(initialSearchQuery);
  const [loading, setLoading] = useState(false);
  const skipFirstFetch = useRef(true);

  /* eslint-disable react-hooks/set-state-in-effect -- client pagination / filter fetch */
  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    fetch(`/api/store/products?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setProducts(json.data ?? []);
        setTotalPages(json.totalPages ?? 1);
        setTotal(json.total ?? 0);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, categoryId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isIndex1 = variant === "index1";

  return (
    <>
      <div
        className={cn(
          "mb-6 sm:mb-8",
          isIndex1
            ? "flex flex-col items-center gap-6 text-center"
            : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        )}
      >
        <div className={cn(isIndex1 && "max-w-2xl")}>
          <h1
            className={cn(
              "font-bold text-foreground",
              isIndex1 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            )}
          >
            {isIndex1 ? "Browse the store" : "Shop"}
          </h1>
          <p className="mt-2 text-muted-foreground sm:text-lg">
            {isIndex1
              ? "Pick a category, then search — same catalog as the home page, in a focused layout."
              : "Browse by category or search our catalog."}
          </p>
        </div>
        <StoreProductSearchBar
          className={cn(isIndex1 && "max-w-3xl w-full")}
          categories={categories}
          search={search}
          categoryId={categoryId}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onCategoryChange={(id) => {
            setCategoryId(id);
            setPage(1);
          }}
        />
      </div>

      {loading && (
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          Loading…
        </p>
      )}

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  images: product.images,
                  category: product.category,
                  brand: product.brand,
                }}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
                <span className="sr-only">, {total} products total</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
          <p className="text-muted-foreground">
            No products match your filters. Try another category or search term.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </>
  );
}
