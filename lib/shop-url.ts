import type { StorefrontSort } from "@/lib/storefront-products";

/** Allowed page sizes for shop listing (matches public products API cap). */
export const SHOP_PAGE_SIZE_OPTIONS = [12, 24, 36, 48] as const;

export function normalizeShopPageSize(n: unknown): number {
  const v = typeof n === "number" ? n : Number.parseInt(String(n), 10);
  return (SHOP_PAGE_SIZE_OPTIONS as readonly number[]).includes(v) ? v : 12;
}

/** Stable key for current shop filters; used server-side to reset DB list page when filters change. */
export function buildShopFilterKey(q: {
  search?: string | null;
  categorySlug?: string | null;
  brand?: string | null;
  sort: StorefrontSort;
}): string {
  return JSON.stringify({
    s: (q.search ?? "").trim(),
    c: (q.categorySlug ?? "").trim(),
    b: (q.brand ?? "").trim(),
    o: q.sort === "newest" ? "" : q.sort,
  });
}

/** Read shop filter params from the URL (client navigation). Page size & page index live in the DB. */
export function shopQueryFromSearchParams(sp: URLSearchParams): {
  search: string | null;
  categorySlug: string | null;
  brand: string | null;
  sort: string | null;
} {
  const sortRaw = sp.get("sort");
  return {
    search: sp.get("search"),
    categorySlug: sp.get("categorySlug"),
    brand: sp.get("brand"),
    sort:
      sortRaw === "price_asc" || sortRaw === "price_desc" ? sortRaw : null,
  };
}

/** Build `/shop` URLs with query params (omit empties). No `page` / `limit` — those are server-persisted. */
export function shopHref(q: {
  search?: string | null;
  categorySlug?: string | null;
  brand?: string | null;
  sort?: string | null;
}): string {
  const sp = new URLSearchParams();
  const s = q.search?.trim();
  if (s) sp.set("search", s);
  const c = q.categorySlug?.trim();
  if (c) sp.set("categorySlug", c);
  const b = q.brand?.trim();
  if (b) sp.set("brand", b);
  if (q.sort === "price_asc" || q.sort === "price_desc") sp.set("sort", q.sort);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
