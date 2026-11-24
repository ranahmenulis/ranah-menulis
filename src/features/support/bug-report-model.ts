/**
 * Bug reports from users (client, 23 November 2026): pure rules, no storage and no React.
 * A report is never edited. What happened to it afterwards is a separate append-only log, so the
 * status is worked out from that log and not stored on the report (as with moderation).
 */
export const BUG_REPORTS_HREF = "/kelola/admin/laporan";
export const bugReportHref = (id: string) => `${BUG_REPORTS_HREF}/${encodeURIComponent(id)}`;

export const BUG_CATEGORIES = ["save", "display", "feature", "other"] as const;
export type BugCategory = (typeof BUG_CATEGORIES)[number];

/** [usulan] Longest description and steps a reporter can write. */
export const DESCRIPTION_LIMIT = 1000;
export const STEPS_LIMIT = 600;

/** What the browser tells us about where the problem happened. Never the text a person wrote. */
export type BugContext = {
  /** The page without query or fragment. */
  path: string;
  language: string;
  theme: string;
  screen: string;
  browser: string;
};

export type BugReport = {
  id: string;
  category: BugCategory;
  description: string;
  steps?: string;
  /** Present only when the reporter left "include technical info" on. */
  context?: BugContext;
  reporterId: string;
  at: number;
};

export type BugStatus = "baru" | "diproses" | "selesai";

/** What an Administrator did to a report, newest last. Append-only. */
export type BugLogEntry = {
  reportId: string;
  status: "diproses" | "selesai";
  by: string;
  at: number;
  note?: string;
};

export type BugProblem =
  "categoryRequired" | "descriptionEmpty" | "descriptionTooLong" | "stepsTooLong";

export type BugProblems = Partial<Record<"category" | "description" | "steps", BugProblem>>;

export const isBugCategory = (value: unknown): value is BugCategory =>
  (BUG_CATEGORIES as readonly unknown[]).includes(value);

/** One problem per field; an empty object means the report can be sent. */
export function validateBugReport(input: {
  category: string;
  description: string;
  steps: string;
}): BugProblems {
  const problems: BugProblems = {};
  if (!isBugCategory(input.category)) problems.category = "categoryRequired";
  const description = input.description.trim();
  if (description === "") problems.description = "descriptionEmpty";
  else if (description.length > DESCRIPTION_LIMIT) problems.description = "descriptionTooLong";
  if (input.steps.trim().length > STEPS_LIMIT) problems.steps = "stepsTooLong";
  return problems;
}

/** The status is the last thing done to the report; nothing done means it is new. */
export function statusOf(log: readonly BugLogEntry[], reportId: string): BugStatus {
  for (let i = log.length - 1; i >= 0; i--) if (log[i].reportId === reportId) return log[i].status;
  return "baru";
}

/** What an Administrator may do next. A finished report stays finished. */
export function nextStatuses(status: BugStatus): ("diproses" | "selesai")[] {
  if (status === "baru") return ["diproses", "selesai"];
  if (status === "diproses") return ["selesai"];
  return [];
}

export type BugRow = { report: BugReport; status: BugStatus };

/** Newest first. */
export function bugRows(reports: readonly BugReport[], log: readonly BugLogEntry[]): BugRow[] {
  return reports
    .map((report) => ({ report, status: statusOf(log, report.id) }))
    .sort((a, b) => b.report.at - a.report.at);
}

export type BugFilter = BugStatus | "semua";
export const BUG_FILTERS: readonly BugFilter[] = ["baru", "diproses", "selesai", "semua"];

/** The queue opens on what is new. */
export const parseBugFilter = (raw: string | null): BugFilter =>
  BUG_FILTERS.includes(raw as BugFilter) ? (raw as BugFilter) : "baru";

export const bugFilterQuery = (filter: BugFilter) => (filter === "baru" ? "" : `?status=${filter}`);

export const applyBugFilter = (rows: readonly BugRow[], filter: BugFilter): BugRow[] =>
  filter === "semua" ? [...rows] : rows.filter((row) => row.status === filter);

export function countBugs(rows: readonly BugRow[]): Record<BugFilter, number> {
  const counts: Record<BugFilter, number> = {
    baru: 0,
    diproses: 0,
    selesai: 0,
    semua: rows.length,
  };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

/** The start of a description, for a list row and the audit log. */
export function excerptOf(text: string, max = 60): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
}
