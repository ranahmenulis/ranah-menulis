import { appendAudit, type NewAuditEntry } from "../audit/audit-log";
import { ME_ID } from "../identity";
import { readEffectiveRoles } from "../use-effective-roles";
import { REASON_LIMIT, validateReason } from "../reason";
import { STAFF_ROLES, removeAssignmentsOf, type StaffRole } from "../staff-assignments";
import { formatNumber } from "@/lib/i18n/format";
import type { ManagerRole } from "@/lib/roles";
import { coded, type AdminCode, type CodedResult } from "./copy/admin-copy";
import {
  accountChangeBlock,
  needsReason,
  roleChangeBlock,
  type AccountChange,
  type RoleChange,
} from "./role-rules";
import { roleGrants, suspensions } from "./role-store";
import { personById } from "./people";

/** Said when a required reason is left empty, by the dialog and by the action alike. */
export const REASON_EMPTY = coded("reasonEmpty").message;

/** `message` is Indonesian; screens translate by `code` with `adminMessage`. */
export type AdminResult = ({ ok: true } | { ok: false }) & CodedResult;

export const refuse = (code: AdminCode, params?: Record<string, string>): AdminResult => ({
  ok: false,
  ...coded(code, params),
});

export const done = (code: AdminCode, params?: Record<string, string>): AdminResult => ({
  ok: true,
  ...coded(code, params),
});

/** The moment of the click and the rules as they are then; nothing here trusts what was rendered. */
function context(targetId: string) {
  return {
    actorRoles: readEffectiveRoles(),
    actorId: ME_ID,
    grants: roleGrants.read(),
    suspensions: suspensions.read(),
    targetId,
  };
}

function reasonProblem(
  role: ManagerRole | null,
  change: RoleChange | AccountChange,
  text: string,
): AdminResult | null {
  const found = validateReason(text, needsReason(role, change));
  if (found === null) return null;
  return found === "kosong"
    ? refuse("reasonEmpty")
    : refuse("reasonTooLong", { limit: formatNumber(REASON_LIMIT, "id") });
}

const asStaffRole = (role: ManagerRole): StaffRole | null =>
  (STAFF_ROLES as readonly string[]).includes(role) ? (role as StaffRole) : null;

const nameOf = (id: string) => personById(id)?.name ?? id;

export function grantRole(targetId: string, role: ManagerRole, reason = ""): AdminResult {
  if (!personById(targetId)) return refuse("userNotFound");
  const ctx = context(targetId);
  const block = roleChangeBlock(ctx, role, "grant");
  if (block) return refuse(block);
  const problem = reasonProblem(role, "grant", reason);
  if (problem) return problem;
  const note = reason.trim() || undefined;
  roleGrants.write([
    ...ctx.grants,
    { userId: targetId, role, grantedBy: ME_ID, at: Date.now(), reason: note },
  ]);
  appendAudit([{ action: "role.grant", actorId: ME_ID, targetId, role, reason: note }]);
  return done("granted", { name: nameOf(targetId), role });
}

export function revokeRole(targetId: string, role: ManagerRole, reason: string): AdminResult {
  if (!personById(targetId)) return refuse("userNotFound");
  const ctx = context(targetId);
  const block = roleChangeBlock(ctx, role, "revoke");
  if (block) return refuse(block);
  const problem = reasonProblem(role, "revoke", reason);
  if (problem) return problem;
  const note = reason.trim();
  roleGrants.write(ctx.grants.filter((g) => !(g.userId === targetId && g.role === role)));
  const staffRole = asStaffRole(role);
  const removed = staffRole ? removeAssignmentsOf(targetId, staffRole) : [];
  const entries: NewAuditEntry[] = [
    { action: "role.revoke", actorId: ME_ID, targetId, role, reason: note },
    ...removed.map((a) => ({
      action: "staff.unassign" as const,
      actorId: ME_ID,
      targetId,
      role,
      slug: a.slug,
      reason: "Role dicabut",
    })),
  ];
  appendAudit(entries);
  const params = { role, name: nameOf(targetId) };
  return removed.length > 0
    ? done("revokedAssignments", { ...params, count: String(removed.length) })
    : done("revoked", params);
}

export function suspendUser(targetId: string, reason: string): AdminResult {
  if (!personById(targetId)) return refuse("userNotFound");
  const ctx = context(targetId);
  const block = accountChangeBlock(ctx, "suspend");
  if (block) return refuse(block);
  const problem = reasonProblem(null, "suspend", reason);
  if (problem) return problem;
  const note = reason.trim();
  suspensions.write([
    ...ctx.suspensions,
    { userId: targetId, by: ME_ID, at: Date.now(), reason: note },
  ]);
  appendAudit([{ action: "account.suspend", actorId: ME_ID, targetId, reason: note }]);
  return done("suspended", { name: nameOf(targetId) });
}

export function restoreUser(targetId: string, reason = ""): AdminResult {
  if (!personById(targetId)) return refuse("userNotFound");
  const ctx = context(targetId);
  const block = accountChangeBlock(ctx, "restore");
  if (block) return refuse(block);
  const problem = reasonProblem(null, "restore", reason);
  if (problem) return problem;
  suspensions.write(ctx.suspensions.filter((s) => s.userId !== targetId));
  appendAudit([
    { action: "account.restore", actorId: ME_ID, targetId, reason: reason.trim() || undefined },
  ]);
  return done("restored", { name: nameOf(targetId) });
}
