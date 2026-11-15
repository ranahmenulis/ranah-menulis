import type { ReactNode } from "react";
import { I18nProvider } from "./provider";
import { getDictionary, getLocale } from "./server";

/** Reads the request's locale once and hands the dictionary to client components. */
export async function I18nRoot({ children }: { children: ReactNode }) {
  const [locale, dictionary] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      {children}
    </I18nProvider>
  );
}
