"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type AmazonSearchCategory = { id: string; name: string; slug: string };

type Suggestion = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: string;
  categoryName: string;
};

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function storefrontResultsPath(pathname: string): string {
  if (pathname === "/store/index1") return "/store/index1";
  return "/";
}

function AmazonSearchFields({
  categories,
  className,
  initialQuery,
  initialCategoryId,
  pathname,
}: {
  categories: AmazonSearchCategory[];
  className?: string;
  initialQuery: string;
  initialCategoryId: string;
  pathname: string;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 220);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- debounced fetch; state mirrors API */
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ q });
    if (categoryId) params.set("categoryId", categoryId);
    fetch(`/api/store/search/suggestions?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setSuggestions(Array.isArray(json.suggestions) ? json.suggestions : []);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, categoryId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submitSearch = useCallback(() => {
    const q = query.trim();
    const slug = categories.find((c) => c.id === categoryId)?.slug ?? "";
    const sp = new URLSearchParams();
    if (q) sp.set("search", q);
    if (slug) sp.set("categorySlug", slug);
    const qs = sp.toString();
    const base = storefrontResultsPath(pathname);
    router.push(qs ? `${base}?${qs}` : base);
    setOpen(false);
  }, [query, categoryId, categories, router, pathname]);

  return (
    <div ref={rootRef} className={cn("relative min-w-0 flex-1", className)}>
      <form
        role="search"
        className="flex h-10 w-full max-w-3xl items-stretch overflow-hidden rounded-md border border-border bg-background shadow-sm sm:h-11"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
      >
        <div className="relative shrink-0 border-r border-border bg-muted/70">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-full max-w-[min(100vw-8rem,14rem)] cursor-pointer appearance-none bg-transparent py-0 pl-3 pr-8 text-xs text-foreground outline-none sm:max-w-[14rem] sm:text-sm"
            aria-label="Search in category"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground sm:text-xs">
            ▼
          </span>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products"
          className="min-w-0 flex-1 border-0 bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          autoComplete="off"
          aria-label="Search products"
          aria-controls="store-search-suggestions"
        />

        <button
          type="submit"
          className="flex shrink-0 items-center justify-center bg-[#febd69] px-4 text-[#111] transition-colors hover:bg-[#f3a847] dark:bg-amber-500 dark:text-[#111] dark:hover:bg-amber-400"
          aria-label="Search"
        >
          <Search className="h-5 w-5" strokeWidth={2} />
        </button>
      </form>

      {open && (query.trim().length >= 1 || loading) && (
        <div
          id="store-search-suggestions"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-[min(70vh,420px)] overflow-y-auto rounded-md border border-border bg-card py-1 shadow-lg"
          role="listbox"
          aria-label="Search suggestions"
        >
          {loading && suggestions.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Loading…</p>
          )}
          {!loading && suggestions.length === 0 && query.trim().length >= 1 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No matches</p>
          )}
          {suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/product/${s.slug}`}
              role="option"
              className="flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/80"
              onClick={() => setOpen(false)}
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-muted">
                {s.imageUrl ? (
                  <Image
                    src={s.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    —
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-medium text-foreground">{s.name}</span>
                <span className="block text-xs text-muted-foreground">{s.categoryName}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AmazonSearchBarInner({
  categories,
  className,
}: {
  categories: AmazonSearchCategory[];
  className?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") ?? "";
  const urlCategorySlug = searchParams.get("categorySlug") ?? "";
  const initialCategoryId = urlCategorySlug
    ? (categories.find((c) => c.slug === urlCategorySlug)?.id ?? "")
    : "";

  return (
    <AmazonSearchFields
      key={`${urlSearch}\0${urlCategorySlug}`}
      categories={categories}
      className={className}
      initialQuery={urlSearch}
      initialCategoryId={initialCategoryId}
      pathname={pathname}
    />
  );
}

export function AmazonSearchBar({
  categories,
  className,
}: {
  categories: AmazonSearchCategory[];
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "h-10 w-full max-w-3xl rounded-md border border-border bg-muted/40 sm:h-11",
            className
          )}
        />
      }
    >
      <AmazonSearchBarInner categories={categories} className={className} />
    </Suspense>
  );
}
