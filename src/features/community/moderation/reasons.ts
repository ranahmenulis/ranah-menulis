import type { ReportReason } from "../types";

/** The reasons a reader can give when reporting (COM-05), with the words used everywhere. */
export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  spam: "Spam atau iklan",
  hate: "Ujaran kebencian atau pelecehan",
  copyright: "Melanggar hak cipta",
  other: "Alasan lain",
};
