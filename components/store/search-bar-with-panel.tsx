"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { ProductCard } from "./product-card";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  images: string[];
  category?: { name: string };
  brand?: { name: string } | null;
};

export function SearchBarWithPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]));
  }, []);

  const runSearch = useCallback(() => {
    const q = query.trim();
    if (!q && !categorySlug) {
      setPanelOpen(true);
      setProducts([]);
      setSearched(true);
      return;
    }
    setLoading(true);
    setPanelOpen(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (categorySlug) params.set("categorySlug", categorySlug);
    params.set("limit", "24");
    fetch(`/api/store/products?${params}`)
      .then((r) => r.json())
      .then((res) => setProducts(res.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query, categorySlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-1 max-w-md items-center gap-2">
        <div className="relative flex flex-1 items-center rounded-lg border border-border bg-muted/50 focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="h-9 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search"
          />
        </div>
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="h-9 rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 flex items-center gap-2 shrink-0"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>

      {/* Bottom panel */}
      {panelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setPanelOpen(false)}
            aria-hidden
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-card shadow-lg transition-transform duration-300 ease-out"
            role="dialog"
            aria-label="Search results"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-semibold text-foreground">
                {searched ? "Search results" : "Search"}
              </h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <p className="py-8 text-center text-muted-foreground">Loading...</p>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : searched ? (
                <p className="py-8 text-center text-muted-foreground">
                  No products found. Try a different search or category.
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  );
}
