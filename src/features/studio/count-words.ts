import type { Locale } from "@/lib/i18n/config";

/** 24-hour clock: "14.02" in Indonesian (a dot, as in the save indicator), "14:02" in English. */
export function formatClock(date: Date, locale: Locale = "id"): string {
  const time = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return locale === "en" ? time : time.replace(":", ".");
}
