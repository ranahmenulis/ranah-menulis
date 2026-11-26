"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { moderationRemoteSync, reportsRemoteSync } from "../storage/remote/remote-community-lists";
import type { ReportReason } from "../types";
import { REPORT_REASON_LABEL } from "./reasons";
import { lastDecision } from "./removed";

/**
 * Reports and moderation decisions (COM-05, PLT-06), kept in localStorage until the backend exists.
 * The reporter's id is stored so a second report from the same person is merged, but no screen
 * shows it: the author of the content never learns who reported (PRD 10, PLT-06).
 */
export type ReportKind = "post" | "comment";

export type Report = {
  kind: ReportKind;
  targetId: string;
  reporterId: string;
  reason: ReportReason;
  at: number;
};

/** What a moderator decided about reported content, newest last. Append-only. */
export type Decision = "abaikan" | "sembunyikan" | "hapus" | "pulihkan" | "tangguhkan";

export type ModerationEntry = {
  kind: ReportKind;
  targetId: string;
  decision: Decision;
  by: string;
  at: number;
  reason?: string;
};

const REASONS: readonly string[] = Object.keys(REPORT_REASON_LABEL);
const DECISIONS: readonly string[] = ["abaikan", "sembunyikan", "hapus", "pulihkan", "tangguhkan"];
const KINDS: readonly string[] = ["post", "comment"];

const isReport = (value: unknown): value is Report => {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    KINDS.includes(r.kind as string) &&
    typeof r.targetId === "string" &&
    typeof r.reporterId === "string" &&
    REASONS.includes(r.reason as string) &&
    Number.isFinite(r.at)
  );
};

const isEntry = (value: unknown): value is ModerationEntry => {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    KINDS.includes(e.kind as string) &&
    typeof e.targetId === "string" &&
    DECISIONS.includes(e.decision as string) &&
    typeof e.by === "string" &&
    Number.isFinite(e.at) &&
    (e.reason === undefined || typeof e.reason === "string")
  );
};

const HOUR = 3_600_000;
const seedAt = Date.UTC(2026, 10, 10);

/**
 * What an untouched device starts with [contoh]: a few reports by dummy authors on fixture content,
 * so the moderation queue can be tried without reporting everything yourself.
 */
export const SEED_REPORTS: readonly Report[] = [
  {
    kind: "post",
    targetId: "toples-kerupuk",
    reporterId: "nur-aisyah",
    reason: "spam",
    at: seedAt,
  },
  {
    kind: "post",
    targetId: "toples-kerupuk",
    reporterId: "dimas-pratama",
    reason: "spam",
    at: seedAt + HOUR,
  },
  {
    kind: "comment",
    targetId: "c-hujan-3",
    reporterId: "laras",
    reason: "hate",
    at: seedAt + 2 * HOUR,
  },
  {
    kind: "post",
    targetId: "pasar-malam-selepas-hujan",
    reporterId: "maya-anindita",
    reason: "copyright",
    at: seedAt + 3 * HOUR,
  },
];

export const reports = createLocalListStore<Report>(
  "ranah.reports",
  isReport,
  SEED_REPORTS,
  reportsRemoteSync,
);
export const moderation = createLocalListStore<ModerationEntry>(
  "ranah.moderation",
  isEntry,
  [],
  moderationRemoteSync,
);

export const useReports = reports.use;
export const useModeration = moderation.use;

/**
 * Files a report. One report per person per content until a moderator decides: a second one is
 * merged, not added. After a decision the person can report the content again.
 */
export function fileReport(
  kind: ReportKind,
  targetId: string,
  reporterId: string,
  reason: ReportReason,
  at = Date.now(),
): boolean {
  const all = reports.read();
  // A decision closes the case: the same person may report the content again after it.
  const decidedAt = lastDecision(moderation.read(), kind, targetId)?.at;
  const again = all.some(
    (r) =>
      r.kind === kind &&
      r.targetId === targetId &&
      r.reporterId === reporterId &&
      (decidedAt === undefined || r.at > decidedAt),
  );
  if (again) return false;
  reports.write([...all, { kind, targetId, reporterId, reason, at }]);
  return true;
}
