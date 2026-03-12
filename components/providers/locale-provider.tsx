"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LocaleCode } from "@/lib/locales";

const STORAGE_KEY = "dashboard-locale";

type Messages = Record<string, unknown>;

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: string) => string;
  locales: { code: LocaleCode; name: string }[];
  isLoading: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getNested(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

const VALID_CODES: LocaleCode[] = ["en", "bn", "de", "hi", "es", "fr", "it"];

function parseStoredLocale(stored: string | null): LocaleCode {
  return stored && VALID_CODES.includes(stored as LocaleCode) ? (stored as LocaleCode) : "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    if (typeof window === "undefined") return "en";
    return parseStoredLocale(localStorage.getItem(STORAGE_KEY));
  });
  const [messages, setMessages] = useState<Messages>({});
  const [locales, setLocales] = useState<{ code: LocaleCode; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/locales")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setLocales(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user?.locale && VALID_CODES.includes(user.locale)) {
          setLocaleState(user.locale);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, user.locale);
          }
        }
      })
      .catch(() => {});
  }, []);

  const loadTranslations = useCallback(async (code: LocaleCode) => {
    const res = await fetch(`/api/translations/${code}`);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    loadTranslations(locale).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [locale, loadTranslations]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    async (code: LocaleCode) => {
      setLocaleState(code);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, code);
      }
      await loadTranslations(code);
      try {
        await fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: code }),
        });
      } catch {
        // ignore; user may be logged out or API may fail
      }
    },
    [loadTranslations]
  );

  const t = useCallback(
    (key: string): string => {
      const value = getNested(messages, key);
      return value ?? key;
    },
    [messages]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t, locales, isLoading }),
    [locale, setLocale, t, locales, isLoading]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
