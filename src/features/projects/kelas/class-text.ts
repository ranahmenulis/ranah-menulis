import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { fill } from "@/features/studio/copy/fill";
import { formatProjectDate, zoneIana } from "../project-model";
import type { TimeZoneName } from "../types";
import { classCopy } from "./class-copy";
import type { AssignmentState } from "./types";

/** Indonesian defaults; screens use `stateLabelOf` and `stateHintOf` with the interface language. */
export const stateLabel: Record<AssignmentState, string> = classCopy("id").state.label;

/** One sentence under an assignment that says what to do about it. */
export const stateHint: Record<AssignmentState, string> = classCopy("id").state.hint;

export const stateLabelOf = (state: AssignmentState, locale: Locale = "id") =>
  classCopy(locale).state.label[state];

export const stateHintOf = (state: AssignmentState, locale: Locale = "id") =>
  classCopy(locale).state.hint[state];

/** "Sabtu, 21 November · 19.00 WIB": the project's own zone, named, so it reads the same for all. */
export function sessionTime(at: number, zone: TimeZoneName, locale: Locale = "id"): string {
  const timeZone = zoneIana(zone);
  const date = formatDate(at, locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = formatDate(at, locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${date} · ${time} ${zone}`;
}

export const dueText = (dueAt: number, zone: TimeZoneName, locale: Locale = "id") =>
  fill(classCopy(locale).dueText, { date: formatProjectDate(dueAt, zone, locale) });

/** "1 dari 3 selesai" for the progress line. */
export const progressText = (done: number, total: number, locale: Locale = "id") =>
  fill(classCopy(locale).progressText, { done: String(done), total: String(total) });

/** The module label shown to the reader: mentor-added tasks sit under one stored Indonesian name. */
export const moduleLabel = (module: string, locale: Locale = "id") =>
  module === classCopy("id").extraModule ? classCopy(locale).extraModule : module;
