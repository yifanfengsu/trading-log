"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getDictionary,
  LANGUAGE_STORAGE_KEY,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "zh" || value === "en";
}

function applyBrowserLocale(locale: Locale) {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.title = getDictionary(locale).appTitle;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
    applyBrowserLocale(nextLocale);
  }, []);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isLocale(storedLocale)) {
      const timeoutId = window.setTimeout(() => {
        if (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === storedLocale) {
          setLocale(storedLocale);
        }
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "zh");
    applyBrowserLocale("zh");
  }, [setLocale]);

  const dictionary = getDictionary(locale);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      dictionary,
      t: dictionary,
    }),
    [dictionary, locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
