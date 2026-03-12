/** Supported locales. Default: en */
export const LOCALES = [
  { code: "en", name: "English" },
  { code: "bn", name: "Bangla" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";

export function isValidLocale(code: string): code is LocaleCode {
  return LOCALES.some((l) => l.code === code);
}
