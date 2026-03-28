"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { History, Search, X } from "lucide-react";
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
  const [recentFromApi, setRecentFromApi] = useState<string[]>([]);
  const debouncedQuery = useDebouncedValue(query, 220);
  const rootRef = useRef<HTMLDivElement>(null);

  const refreshRecent = useCallback(() => {
    return fetch("/api/store/search/recent")
      .then((r) => r.json())
      .then((json: { terms?: string[] }) => {
        setRecentFromApi(Array.isArray(json.terms) ? json.terms : []);
      })
      .catch(() => setRecentFromApi([]));
  }, []);

  useEffect(() => {
    if (open) void refreshRecent();
  }, [open, refreshRecent]);

  const filteredRecent = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recentFromApi;
    return recentFromApi.filter((t) => t.toLowerCase().includes(q));
  }, [query, recentFromApi]);

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

  /** Matches `<option>` labels so measured width equals what the closed control shows. */
  const selectedCategoryLabel =
    categoryId === "" ? "All" : (categories.find((c) => c.id === categoryId)?.name ?? "All");

  const buildResultsUrl = useCallback(
    (searchText: string) => {
      const q = searchText.trim();
      const slug = categories.find((c) => c.id === categoryId)?.slug ?? "";
      const sp = new URLSearchParams();
      if (q) sp.set("search", q);
      if (slug) sp.set("categorySlug", slug);
      const qs = sp.toString();
      const base = storefrontResultsPath(pathname);
      return qs ? `${base}?${qs}` : base;
    },
    [categoryId, categories, pathname]
  );

  const persistRecentTerm = useCallback(async (term: string) => {
    const t = term.trim();
    if (!t) return;
    try {
      await fetch("/api/store/search/recent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: t }),
      });
    } catch {
      /* ignore */
    }
    void refreshRecent();
  }, [refreshRecent]);

  const submitSearch = useCallback(() => {
    const q = query.trim();
    if (q) void persistRecentTerm(q);
    router.push(buildResultsUrl(query));
    setOpen(false);
  }, [query, router, buildResultsUrl, persistRecentTerm]);

  const applyRecentTerm = useCallback(
    (term: string) => {
      setQuery(term);
      void persistRecentTerm(term);
      router.push(buildResultsUrl(term));
      setOpen(false);
    },
    [router, buildResultsUrl, persistRecentTerm]
  );

  const removeRecentTerm = useCallback(
    (term: string) => {
      fetch(`/api/store/search/recent?term=${encodeURIComponent(term)}`, {
        method: "DELETE",
      })
        .then(() => refreshRecent())
        .catch(() => {});
    },
    [refreshRecent]
  );

  const clearAllRecent = useCallback(() => {
    fetch("/api/store/search/recent", { method: "DELETE" })
      .then(() => refreshRecent())
      .catch(() => {});
  }, [refreshRecent]);

  const clearSearchKeyword = useCallback(() => {
    setQuery("");
    setOpen(false);
    setSuggestions([]);
    router.push(buildResultsUrl(""));
  }, [router, buildResultsUrl]);

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
        <div
          className="relative flex h-full min-w-0 max-w-[calc(100vw-7rem)] shrink-0 overflow-hidden border-r border-border bg-muted/70"
          title={categoryId === "" ? "All categories" : selectedCategoryLabel}
        >
          {/*
            Native <select> often sizes to the widest option. Ghost text matches the
            selected label so the gray strip grows/shrinks like Amazon (narrow "All", wide long names).
          */}
          <span
            className="invisible flex h-full items-center whitespace-nowrap py-0 pl-3 pr-8 text-xs text-foreground sm:text-sm"
            aria-hidden
          >
            {selectedCategoryLabel}
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent py-0 pl-3 pr-8 text-xs text-foreground outline-none sm:text-sm [&>option]:font-normal"
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

        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            role="searchbox"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search products"
            className={cn(
              "h-full min-w-0 w-full border-0 bg-background py-0 pl-3 text-sm text-foreground outline-none placeholder:text-muted-foreground",
              query.trim().length > 0 ? "pr-10" : "pr-3"
            )}
            autoComplete="off"
            aria-label="Search products"
            aria-controls="store-search-suggestions"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => clearSearchKeyword()}
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="flex shrink-0 items-center justify-center bg-[#febd69] px-4 text-[#111] transition-colors hover:bg-[#f3a847] dark:bg-amber-500 dark:text-[#111] dark:hover:bg-amber-400"
          aria-label="Search"
        >
          <Search className="h-5 w-5" strokeWidth={2} />
        </button>
      </form>

      {open &&
        (filteredRecent.length > 0 || query.trim().length >= 1 || loading) && (
        <div
          id="store-search-suggestions"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-[min(70vh,420px)] overflow-y-auto rounded-md border border-border bg-card py-1 shadow-lg"
          role="listbox"
          aria-label="Search suggestions"
        >
          {filteredRecent.length > 0 && (
            <div className="border-b border-border pb-1">
              <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Recent searches
                </span>
                <button
                  type="button"
                  onClick={() => clearAllRecent()}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
              {filteredRecent.map((term) => (
                <div
                  key={term}
                  className="group flex items-stretch border-b border-border/60 last:border-b-0"
                >
                  <button
                    type="button"
                    role="option"
                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted/80"
                    onClick={() => applyRecentTerm(term)}
                  >
                    <History
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="truncate">{term}</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-9 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Remove ${term}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeRecentTerm(term);
                    }}
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {loading && suggestions.length === 0 && query.trim().length >= 1 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Loading…</p>
          )}
          {!loading &&
            suggestions.length === 0 &&
            query.trim().length >= 1 &&
            filteredRecent.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No matches</p>
          )}
          {suggestions.length > 0 && query.trim().length >= 1 && (
            <div className={cn(filteredRecent.length > 0 && "pt-1")}>
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                Products
              </p>
            </div>
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
