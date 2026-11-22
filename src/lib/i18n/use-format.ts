"use client";

import { formatDate, formatDateTime, formatNumber } from "./format";
import { useLocale } from "./provider";

/** Number and date formatters bound to the current interface language. */
export function useFormat() {
  const locale = useLocale();
  return {
    locale,
    number: (value: number) => formatNumber(value, locale),
    date: (value: number | Date, options?: Intl.DateTimeFormatOptions) =>
      formatDate(value, locale, options),
    dateTime: (value: number | Date, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(value, locale, options),
  };
}
