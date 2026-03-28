/** Build `/shop` URLs with query params (omit empties). */
export function shopHref(q: {
  search?: string | null;
  categorySlug?: string | null;
  brand?: string | null;
  sort?: string | null;
  page?: number | null;
}): string {
  const sp = new URLSearchParams();
  const s = q.search?.trim();
  if (s) sp.set("search", s);
  const c = q.categorySlug?.trim();
  if (c) sp.set("categorySlug", c);
  const b = q.brand?.trim();
  if (b) sp.set("brand", b);
  if (q.sort === "price_asc" || q.sort === "price_desc") sp.set("sort", q.sort);
  if (q.page != null && q.page > 1) sp.set("page", String(q.page));
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
