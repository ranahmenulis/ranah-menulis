import {
  moderation,
  reports,
  type Decision,
  type ReportKind,
} from "@/features/community/moderation/report-store";
import { contentState } from "@/features/community/moderation/removed";
import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit, type AuditAction } from "../../audit/audit-log";
import { ME_ID } from "../../identity";
import { reasonMessage, validateReason } from "../../reason";
import { readEffectiveRoles } from "../../use-effective-roles";
import { REASON_EMPTY, suspendUser, type AdminResult } from "../admin-actions";
import { allowedDecisions, decisionLabel, decisionNeedsReason } from "./moderation-model";

const refuse = (message: string): AdminResult => ({ ok: false, message });

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
 * `authorId` is the author of the content, which a fixture or a stored post fixes once and for all.
 */
export function decideCase(
  kind: ReportKind,
  targetId: string,
  authorId: string,
  decision: Decision,
  reason = "",
): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) {
    return refuse("Hanya Administrator dan Super Admin yang bisa memutuskan laporan.");
  }
  if (!reports.read().some((r) => r.kind === kind && r.targetId === targetId)) {
    return refuse("Laporan ini tidak ditemukan.");
  }
  const entries = moderation.read();
  if (!allowedDecisions(contentState(entries, kind, targetId)).includes(decision)) {
    return refuse("Keputusan ini tidak bisa diambil lagi untuk konten ini.");
  }
  const found = validateReason(reason, decisionNeedsReason(decision));
  if (found) return refuse(found === "kosong" ? REASON_EMPTY : reasonMessage[found]);

  const note = reason.trim();
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
  return { ok: true, message: `${decisionLabel[decision]}: selesai.` };
}
