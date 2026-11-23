import {
  moderation,
  reports,
  type Decision,
  type ReportKind,
} from "@/features/community/moderation/report-store";
import { contentAuthor } from "@/features/community/moderation/content-author";
import { contentState } from "@/features/community/moderation/removed";
import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit, type AuditAction } from "../../audit/audit-log";
import { ME_ID } from "../../identity";
import { REASON_LIMIT, validateReason } from "../../reason";
import { formatNumber } from "@/lib/i18n/format";
import { readEffectiveRoles } from "../../use-effective-roles";
import { done, refuse, suspendUser, type AdminResult } from "../admin-actions";
import { allowedDecisions, decisionNeedsReason } from "./moderation-model";

const AUDIT_OF: Record<Exclude<Decision, "tangguhkan">, AuditAction> = {
  abaikan: "report.dismiss",
  sembunyikan: "content.hide",
  pulihkan: "content.restore",
  hapus: "content.delete",
};

/**
 * Decides a case (PLT-06). Everything is read again when the button is pressed: who is pressing,
 * whether the content was reported at all, and what a moderator already did to it. Suspending the
 * author goes through the same rules as on the Admin screen and is only recorded when it worked.
 * The author is found from the content here, not taken from the screen.
 */
export function decideCase(
  kind: ReportKind,
  targetId: string,
  decision: Decision,
  reason = "",
): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) {
    return refuse("moderationNotAllowed");
  }
  if (!reports.read().some((r) => r.kind === kind && r.targetId === targetId)) {
    return refuse("reportGone");
  }
  const entries = moderation.read();
  if (!allowedDecisions(contentState(entries, kind, targetId)).includes(decision)) {
    return refuse("decisionUnavailable");
  }
  const found = validateReason(reason, decisionNeedsReason(decision));
  if (found) {
    return found === "kosong"
      ? refuse("reasonEmpty")
      : refuse("reasonTooLong", { limit: formatNumber(REASON_LIMIT, "id") });
  }

  const note = reason.trim();
  const authorId = contentAuthor(kind, targetId);
  if (decision === "tangguhkan") {
    const suspended = suspendUser(authorId, note);
    if (!suspended.ok) return suspended;
  } else {
    appendAudit([
      {
        action: AUDIT_OF[decision],
        actorId: ME_ID,
        targetId: authorId,
        ref: `${kind}:${targetId}`,
        reason: note || undefined,
      },
    ]);
  }
  moderation.write([
    ...entries,
    { kind, targetId, decision, by: ME_ID, at: Date.now(), reason: note || undefined },
  ]);
  return done("decided", { decision });
}
