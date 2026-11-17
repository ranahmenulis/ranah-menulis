import { appendAudit, type NewAuditEntry } from "../audit/audit-log";
import { ME_ID } from "../identity";
import { readEffectiveRoles } from "../use-effective-roles";
import { validateReason } from "../reason";
import { STAFF_ROLES, removeAssignmentsOf, type StaffRole } from "../staff-assignments";
import type { ManagerRole } from "@/lib/roles";
import {
  accountChangeBlock,
  blockMessage,
  needsReason,
  roleChangeBlock,
  type AccountChange,
  type RoleChange,
} from "./role-rules";
import { roleGrants, suspensions } from "./role-store";
import { personById } from "./people";
import { roleLabel } from "./user-model";

export type AdminResult = { ok: true; message: string } | { ok: false; message: string };

const refuse = (message: string): AdminResult => ({ ok: false, message });

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

function reasonProblem(role: ManagerRole | null, change: RoleChange | AccountChange, text: string) {
  const required = needsReason(role, change);
  return validateReason(text, required) === null
    ? null
    : "Tulis alasannya (paling banyak 1.000 karakter).";
}

const asStaffRole = (role: ManagerRole): StaffRole | null =>
  (STAFF_ROLES as readonly string[]).includes(role) ? (role as StaffRole) : null;

const nameOf = (id: string) => personById(id)?.name ?? id;

export function grantRole(targetId: string, role: ManagerRole, reason = ""): AdminResult {
  if (!personById(targetId)) return refuse("Pengguna tidak ditemukan.");
  const ctx = context(targetId);
  const block = roleChangeBlock(ctx, role, "grant");
  if (block) return refuse(blockMessage[block]);
  const problem = reasonProblem(role, "grant", reason);
  if (problem) return refuse(problem);
  const note = reason.trim() || undefined;
  roleGrants.write([
    ...ctx.grants,
    { userId: targetId, role, grantedBy: ME_ID, at: Date.now(), reason: note },
  ]);
  appendAudit([{ action: "role.grant", actorId: ME_ID, targetId, role, reason: note }]);
  return { ok: true, message: `${nameOf(targetId)} kini ${roleLabel[role]}.` };
}

export function revokeRole(targetId: string, role: ManagerRole, reason: string): AdminResult {
  if (!personById(targetId)) return refuse("Pengguna tidak ditemukan.");
  const ctx = context(targetId);
  const block = roleChangeBlock(ctx, role, "revoke");
  if (block) return refuse(blockMessage[block]);
  const problem = reasonProblem(role, "revoke", reason);
  if (problem) return refuse(problem);
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
  const extra = removed.length > 0 ? ` ${removed.length} penugasan ikut dicabut.` : "";
  return { ok: true, message: `Role ${roleLabel[role]} ${nameOf(targetId)} dicabut.${extra}` };
}

export function suspendUser(targetId: string, reason: string): AdminResult {
  if (!personById(targetId)) return refuse("Pengguna tidak ditemukan.");
  const ctx = context(targetId);
  const block = accountChangeBlock(ctx, "suspend");
  if (block) return refuse(blockMessage[block]);
  const problem = reasonProblem(null, "suspend", reason);
  if (problem) return refuse(problem);
  const note = reason.trim();
  suspensions.write([
    ...ctx.suspensions,
    { userId: targetId, by: ME_ID, at: Date.now(), reason: note },
  ]);
  appendAudit([{ action: "account.suspend", actorId: ME_ID, targetId, reason: note }]);
  return { ok: true, message: `Akun ${nameOf(targetId)} ditangguhkan.` };
}

export function restoreUser(targetId: string, reason = ""): AdminResult {
  if (!personById(targetId)) return refuse("Pengguna tidak ditemukan.");
  const ctx = context(targetId);
  const block = accountChangeBlock(ctx, "restore");
  if (block) return refuse(blockMessage[block]);
  const problem = reasonProblem(null, "restore", reason);
  if (problem) return refuse(problem);
  suspensions.write(ctx.suspensions.filter((s) => s.userId !== targetId));
  appendAudit([
    { action: "account.restore", actorId: ME_ID, targetId, reason: reason.trim() || undefined },
  ]);
  return { ok: true, message: `Akun ${nameOf(targetId)} dipulihkan.` };
}
