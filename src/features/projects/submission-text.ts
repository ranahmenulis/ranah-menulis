import type { Locale } from "@/lib/i18n/config";
import { formatDateTime, formatNumber } from "@/lib/i18n/format";
import { fill } from "@/features/studio/copy/fill";
import { fileKindLabel, formatFileSize } from "@/lib/files/format-size";
import { flowCopy } from "./copy/flow";
import type { SubmitBlock } from "./submission-model";
import type { SubmissionRules } from "./types";

/** "800 sampai 2.000 kata", or "maksimal 150 kata" when there is no real minimum. */
export function wordRuleText(rules: SubmissionRules, locale: Locale = "id"): string {
  const text = flowCopy(locale).rule;
  return rules.minWords <= 1
    ? fill(text.max, { max: formatNumber(rules.maxWords, locale) })
    : fill(text.range, {
        min: formatNumber(rules.minWords, locale),
        max: formatNumber(rules.maxWords, locale),
      });
}

export const worksText = (n: number, locale: Locale = "id") =>
  fill(flowCopy(locale).rule.works, { n: formatNumber(n, locale) });

/** One sentence for the screen that replaces the form. */
export function blockMessage(
  block: SubmitBlock,
  rules: SubmissionRules | null,
  locale: Locale = "id",
): string {
  return fill(flowCopy(locale).blocks[block], { works: worksText(rules?.maxWorks ?? 0, locale) });
}

/** "25 Nov 2026 14.05" in the reader's own zone: this is when *they* sent it. */
export const sentAtText = (timestamp: number, locale: Locale = "id") =>
  formatDateTime(timestamp, locale);

/** "1.250 kata" for a document, "PDF · 2,3 MB" for an uploaded file (its words are not counted). */
export function versionSizeText(
  version: { wordCount: number; file?: { type: string; size: number } } | undefined,
  locale: Locale = "id",
): string {
  if (version?.file) {
    return `${fileKindLabel(version.file.type, locale)} · ${formatFileSize(version.file.size, locale)}`;
  }
  return fill(flowCopy(locale).size.words, { n: formatNumber(version?.wordCount ?? 0, locale) });
}
