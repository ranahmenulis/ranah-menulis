import { personLabel } from "../admin/people";
import { roleLabel, type ManagerRole } from "@/lib/roles";
import type { AuditEntry } from "./audit-log";

const roleName = (role: string | undefined) =>
  role && role in roleLabel ? roleLabel[role as ManagerRole] : (role ?? "");

/** One sentence per entry, from the actor's side: "Super Admin memberi Editor kepada Hafiz". */
export function auditSentence(entry: AuditEntry): string {
  const actor = personLabel(entry.actorId);
  const target = personLabel(entry.targetId);
  const role = roleName(entry.role);
  switch (entry.action) {
    case "role.grant":
      return `${actor} memberi role ${role} kepada ${target}.`;
    case "role.revoke":
      return `${actor} mencabut role ${role} dari ${target}.`;
    case "account.suspend":
      return `${actor} menangguhkan akun ${target}.`;
    case "account.restore":
      return `${actor} memulihkan akun ${target}.`;
    case "staff.assign":
      return `${actor} menugaskan ${target} sebagai ${role} di ${entry.slug ?? "proyek"}.`;
    case "staff.unassign":
      return `${actor} mencabut penugasan ${role} ${target} di ${entry.slug ?? "proyek"}.`;
  }
}
