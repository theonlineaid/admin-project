import type { LocaleCode } from "@/lib/locales";

/** Get translated string from JSON translations object. Keys are locale codes. */
export function getTranslated(
  translations: unknown,
  locale: LocaleCode | string,
  fallback: string
): string {
  if (translations == null || typeof translations !== "object") return fallback;
  const val = (translations as Record<string, string>)[locale];
  return typeof val === "string" && val.trim() !== "" ? val : fallback;
}
