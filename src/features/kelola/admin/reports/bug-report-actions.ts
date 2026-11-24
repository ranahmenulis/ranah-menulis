import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit } from "../../audit/audit-log";
import { ME_ID } from "../../identity";
import { REASON_LIMIT, validateReason } from "../../reason";
import { readEffectiveRoles } from "../../use-effective-roles";
import { bugReportLog, bugReports } from "@/features/support/bug-report-store";
import { excerptOf, nextStatuses, statusOf } from "@/features/support/bug-report-model";

export type BugActionCode =
  "diproses" | "selesai" | "notAllowed" | "gone" | "unavailable" | "noteTooLong";

export type BugActionResult = { ok: boolean; code: BugActionCode; limit?: number };

/**
 * Moves a problem report forward. Everything is read again when the button is pressed: who is
 * pressing, whether the report is still there, and what was already done to it. The audit entry is
 * written before the log so a failure never leaves a change nobody can account for.
 */
export function setBugStatus(
  reportId: string,
  status: "diproses" | "selesai",
  note = "",
): BugActionResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return { ok: false, code: "notAllowed" };
  const report = bugReports.read().find((r) => r.id === reportId);
  if (!report) return { ok: false, code: "gone" };
  const log = bugReportLog.read();
  if (!nextStatuses(statusOf(log, reportId)).includes(status)) {
    return { ok: false, code: "unavailable" };
  }
  if (validateReason(note, false)) return { ok: false, code: "noteTooLong", limit: REASON_LIMIT };

  const trimmed = note.trim();
  appendAudit([
    {
      action: status === "diproses" ? "bugreport.progress" : "bugreport.resolve",
      actorId: ME_ID,
      targetId: report.reporterId,
      ref: `bug:${report.id}`,
      label: excerptOf(report.description, 40),
      reason: trimmed || undefined,
    },
  ]);
  bugReportLog.write([
    ...log,
    { reportId, status, by: ME_ID, at: Date.now(), ...(trimmed ? { note: trimmed } : {}) },
  ]);
  return { ok: true, code: status };
}
