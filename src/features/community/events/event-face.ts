import type { Locale } from "@/lib/i18n/config";
import { zoneIana } from "@/features/projects/project-model";
import type { TimeZoneName } from "@/features/projects/types";
import type { WritingEvent } from "./event-model";

/**
 * The face of an event (DESIGN.md 6.7, Event umum): its start as a calendar leaf and a countdown in words.
 * Pure, so the list, the detail band, and tests read the same values.
 */
export type DateLeaf = { day: string; month: string; weekday: string };

export function dateLeaf(timestamp: number, zone: TimeZoneName, locale: Locale = "id"): DateLeaf {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
      ...options,
      timeZone: zoneIana(zone),
    }).format(timestamp);
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "short" }).replace(".", ""),
    weekday: part({ weekday: "long" }),
  };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const WORDS = {
  id: {
    lessThanMinute: "kurang dari 1 menit",
    day: "hari",
    hour: "jam",
    minute: "menit",
    startsIn: "Mulai dalam",
    endsIn: "Berakhir dalam",
    over: "Event sudah selesai",
  },
  en: {
    lessThanMinute: "less than 1 minute",
    day: "days",
    hour: "hr",
    minute: "min",
    startsIn: "Starts in",
    endsIn: "Ends in",
    over: "The event is over",
  },
} as const;

/** "2 hari 3 jam", "5 jam 12 menit", "4 menit", "kurang dari 1 menit": the two largest units. */
export function spanLabel(ms: number, locale: Locale = "id"): string {
  const w = WORDS[locale];
  if (ms < MINUTE) return w.lessThanMinute;
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (days > 0) return hours > 0 ? `${days} ${w.day} ${hours} ${w.hour}` : `${days} ${w.day}`;
  if (hours > 0) {
    return minutes > 0 ? `${hours} ${w.hour} ${minutes} ${w.minute}` : `${hours} ${w.hour}`;
  }
  return `${minutes} ${w.minute}`;
}

/** What the clock says about an event right now. */
export function countdownLabel(
  event: Pick<WritingEvent, "startsAt" | "endsAt">,
  now: number,
  locale: Locale = "id",
) {
  const w = WORDS[locale];
  if (now < event.startsAt) return `${w.startsIn} ${spanLabel(event.startsAt - now, locale)}`;
  if (now < event.endsAt) return `${w.endsIn} ${spanLabel(event.endsAt - now, locale)}`;
  return w.over;
}

/** How far through its window an event is, 0 to 1. */
export function elapsed(event: Pick<WritingEvent, "startsAt" | "endsAt">, now: number) {
  const length = event.endsAt - event.startsAt;
  if (length <= 0) return now >= event.endsAt ? 1 : 0;
  return Math.min(1, Math.max(0, (now - event.startsAt) / length));
}
