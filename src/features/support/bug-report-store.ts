"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import {
  bugReportLogRemoteSync,
  bugReportsRemoteSync,
} from "@/features/kelola/storage/remote-support-lists";
import {
  isBugCategory,
  type BugContext,
  type BugLogEntry,
  type BugReport,
} from "./bug-report-model";

/**
 * Bug reports and what was done to them, kept in localStorage `ranah.bugReports` and
 * `ranah.bugReportLog` until the backend exists. On this device only: a report is not yet seen by
 * anyone else. Neither list has a function that edits or removes an entry.
 */
const optionalText = (value: unknown) => value === undefined || typeof value === "string";

function isContext(value: unknown): value is BugContext {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.path === "string" &&
    typeof c.language === "string" &&
    typeof c.theme === "string" &&
    typeof c.screen === "string" &&
    typeof c.browser === "string"
  );
}

const isReport = (value: unknown): value is BugReport => {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    isBugCategory(r.category) &&
    typeof r.description === "string" &&
    optionalText(r.steps) &&
    (r.context === undefined || isContext(r.context)) &&
    typeof r.reporterId === "string" &&
    Number.isFinite(r.at)
  );
};

const isLogEntry = (value: unknown): value is BugLogEntry => {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.reportId === "string" &&
    (e.status === "diproses" || e.status === "selesai") &&
    typeof e.by === "string" &&
    Number.isFinite(e.at) &&
    optionalText(e.note)
  );
};

export const bugReports = createLocalListStore<BugReport>(
  "ranah.bugReports",
  isReport,
  [],
  bugReportsRemoteSync,
);
export const bugReportLog = createLocalListStore<BugLogEntry>(
  "ranah.bugReportLog",
  isLogEntry,
  [],
  bugReportLogRemoteSync,
);

export const useBugReports = bugReports.use;
export const useBugReportLog = bugReportLog.use;
