"use client";

import { createContext, useContext, useEffect, useTransition, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { setLocale } from "./actions";
import { id, type Dictionary } from "./dictionaries";

type Value = { locale: Locale; t: Dictionary };

// Defaults to Indonesian so components render without a provider (tests, previews).
const I18nContext = createContext<Value>({ locale: DEFAULT_LOCALE, t: id });

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <I18nContext value={{ locale, t: dictionary }}>{children}</I18nContext>;
}

export function useT(): Dictionary {
  return useContext(I18nContext).t;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

/** Saves the language; the server re-renders the page in it. */
export function useChangeLocale(): { change: (next: Locale) => void; pending: boolean } {
  const [pending, start] = useTransition();
  return { change: (next) => start(() => setLocale(next)), pending };
}

/** Fills `{name}` placeholders in a dictionary string. */
export function format(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
