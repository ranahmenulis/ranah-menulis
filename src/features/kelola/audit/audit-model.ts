import type { JudgingEntry } from "../juri/score-store";
import type { AuditAction, AuditEntry } from "./audit-log";

/** Groups the audit log can be narrowed to (PLT-05). */
export type AuditKind =
  "semua" | "role" | "penugasan" | "moderasi" | "lomba" | "kurasi" | "grup" | "event";

export const AUDIT_KINDS: readonly { id: AuditKind; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "role", label: "Role dan akun" },
  { id: "penugasan", label: "Penugasan" },
  { id: "moderasi", label: "Moderasi" },
  { id: "lomba", label: "Lomba" },
  { id: "kurasi", label: "Kurasi dan pengaturan" },
  { id: "grup", label: "Grup" },
  { id: "event", label: "Event" },
];

const KIND_OF: Record<AuditAction, Exclude<AuditKind, "semua">> = {
  "role.grant": "role",
  "role.revoke": "role",
  "account.suspend": "role",
  "account.restore": "role",
  "staff.assign": "penugasan",
  "staff.unassign": "penugasan",
  "report.dismiss": "moderasi",
  "content.hide": "moderasi",
  "content.restore": "moderasi",
  "content.delete": "moderasi",
  "contest.results.amend": "lomba",
  "contest.reopen": "lomba",
  "pick.add": "kurasi",
  "pick.remove": "kurasi",
  "pick.move": "kurasi",
  "featured.add": "kurasi",
  "featured.remove": "kurasi",
  "setting.communityLink.set": "kurasi",
  "setting.communityLink.clear": "kurasi",
  "group.create": "grup",
  "group.update": "grup",
  "group.invite": "grup",
  "group.join": "grup",
  "group.leave": "grup",
  "group.remove": "grup",
  "group.admin.grant": "grup",
  "group.admin.revoke": "grup",
  "group.code": "grup",
  "group.post.hide": "grup",
  "event.create": "event",
  "event.update": "event",
};

export const parseAuditKind = (raw: string | null): AuditKind =>
  AUDIT_KINDS.some((k) => k.id === raw) ? (raw as AuditKind) : "semua";

export const auditQuery = (kind: AuditKind) => (kind === "semua" ? "" : `?jenis=${kind}`);

export const PAGE_SIZE = 25;

/**
 * The log newest first. Reopenings of a contest's judging live in their own log (BR-PRJ-09) and are
 * read in here without changing where they are written; they do not say who did it.
 */
export function logRows(
  entries: readonly AuditEntry[],
  judging: readonly JudgingEntry[],
  kind: AuditKind,
): AuditEntry[] {
  // A reopening is a "dibuka" that follows a "ditutup" of the same contest; the log is in time order.
  const closed = new Set<string>();
  const reopened: AuditEntry[] = [];
  for (const j of judging) {
    if (j.state === "ditutup") closed.add(j.slug);
    else if (closed.has(j.slug)) {
      reopened.push({
        id: `jl-${j.slug}-${j.at}`,
        at: j.at,
        actorId: j.by ?? "",
        action: "contest.reopen",
        slug: j.slug,
        reason: j.note,
      });
    }
  }
  return [...entries, ...reopened]
    .filter((e) => kind === "semua" || KIND_OF[e.action] === kind)
    .sort((a, b) => b.at - a.at);
}
