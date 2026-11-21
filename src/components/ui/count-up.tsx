"use client";

import { useCountUp } from "@/lib/use-count-up";

const number = new Intl.NumberFormat("id-ID");

/** A whole number that rolls to its value (`useCountUp`), formatted for Indonesian. */
export function CountUp({ value, duration }: { value: number; duration?: number }) {
  return <>{number.format(useCountUp(value, duration))}</>;
}
