/** Supported locales. Default: en */
export const LOCALES = [
  { code: "en", name: "English" },
  { code: "bn", name: "Bangla" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "vi", name: "Vietnamese" },
  { code: "fil", name: "Filipino" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";

/** Locales that use right-to-left script (e.g. Arabic). When selected, document dir is set to rtl. */
export const RTL_LOCALES: LocaleCode[] = ["ar"];

export function isRtlLocale(code: LocaleCode): boolean {
  return RTL_LOCALES.includes(code);
}

export function isValidLocale(code: string): code is LocaleCode {
  return LOCALES.some((l) => l.code === code);
}
