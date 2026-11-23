import type { Locale } from "@/lib/i18n/config";
import type { ReportReason } from "../types";

/** Reason labels per interface language. The stored ids (spam, hate, ...) never change. */
const LABELS: Record<Locale, Record<ReportReason, string>> = {
  id: {
    spam: "Spam atau iklan",
    hate: "Ujaran kebencian atau pelecehan",
    copyright: "Melanggar hak cipta",
    other: "Alasan lain",
  },
  en: {
    spam: "Spam or advertising",
    hate: "Hate speech or harassment",
    copyright: "Copyright violation",
    other: "Other reason",
  },
};

/** The reasons a reader can give when reporting (COM-05), in Indonesian. */
export const REPORT_REASON_LABEL: Record<ReportReason, string> = LABELS.id;

export const reportReasonLabel = (reason: ReportReason, locale: Locale = "id"): string =>
  LABELS[locale][reason];
