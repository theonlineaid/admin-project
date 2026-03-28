import { randomBytes } from "node:crypto";

/** URL-safe key from label (ASCII). Empty if label is only non-latin symbols — caller should fall back. */
export function slugifyAttributeLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

/** Stable unique-ish slug: explicit key, or from name, or random fallback. */
export function resolveAttributeSlug(name: string, explicitSlug?: string | null): string {
  const key = explicitSlug?.trim();
  if (key) {
    const s = slugifyAttributeLabel(key);
    if (s.length > 0) return s.slice(0, 80);
  }
  const fromName = slugifyAttributeLabel(name);
  if (fromName.length > 0) return fromName.slice(0, 80);
  return `attr-${randomBytes(5).toString("hex")}`;
}
