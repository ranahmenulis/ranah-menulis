"use client";

import { formatNumber } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/provider";
import { useCountUp } from "@/lib/use-count-up";

/** A whole number that rolls to its value (`useCountUp`), formatted for the interface language. */
export function CountUp({ value, duration }: { value: number; duration?: number }) {
  const locale = useLocale();
  return <>{formatNumber(useCountUp(value, duration), locale)}</>;
}
