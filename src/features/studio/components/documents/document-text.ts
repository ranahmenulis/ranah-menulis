import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/format";
import { format } from "@/lib/i18n/provider";
import type { studioDocuments } from "../../copy/documents-id";
import { formatChanged } from "../../relative-time";

export type DocumentCopy = typeof studioDocuments;

/** "1.200 kata" / "1.200 words"; English has a singular form. */
export function wordsLabel(t: DocumentCopy, count: number, locale: Locale): string {
  return format(count === 1 ? t.wordOne : t.words, { count: formatNumber(count, locale) });
}

/** "Diubah 2 jam lalu · 120 kata": the meta line of a document row. */
export function documentMeta(
  t: DocumentCopy,
  locale: Locale,
  verb: "changed" | "trashed",
  wordCount: number,
  at: number,
  now: number,
  timeZone?: string,
): string {
  const time = formatChanged(at, now, locale, timeZone);
  return `${format(t.meta[verb], { time })} · ${wordsLabel(t, wordCount, locale)}`;
}

export function folderMeta(
  t: DocumentCopy,
  locale: Locale,
  count: number,
  changedAt: number,
  now: number,
): string {
  const time = formatChanged(changedAt, now, locale);
  return format(count === 1 ? t.meta.folderOne : t.meta.folder, { count: String(count), time });
}
