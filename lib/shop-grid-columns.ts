export type ShopGridColumns = 2 | 3 | 4 | 5;

/** Clamp DB / API values to a supported shop grid column count. */
export function normalizeShopGridColumns(value: unknown): ShopGridColumns {
  const n = typeof value === "number" && Number.isFinite(value) ? value : parseInt(String(value ?? ""), 10);
  if (n === 2 || n === 3 || n === 4 || n === 5) return n;
  return 4;
}
