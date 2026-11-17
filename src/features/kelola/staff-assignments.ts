"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { roleLabel } from "@/lib/roles";
import { appendAudit } from "./audit/audit-log";
import { ME_ID, canonicalId, isSelf } from "./identity";

/**
 * Who is assigned to a project (PRJ-03, Q-04): the Organizer of the project, or an Administrator,
 * assigns Editors, Mentors and Judges. The people to choose from are those who hold that role,
 * which Administrators give on the Admin screen (`admin/role-store.ts`, 6g-5).
 */
export type StaffRole = "editor" | "mentor" | "juri";
export type StaffAssignment = { slug: string; role: StaffRole; staffId: string };

export const STAFF_ROLES: readonly StaffRole[] = ["editor", "mentor", "juri"];

export const staffRoleLabel: Record<StaffRole, string> = {
  editor: roleLabel.editor,
  mentor: roleLabel.mentor,
  juri: roleLabel.juri,
};

/** What an untouched device starts with: the projects the first Editor and Mentor screens used. */
export const SEED_ASSIGNMENTS: readonly StaffAssignment[] = [
  { slug: "antologi-surat-yang-tidak-pernah-terkirim", role: "editor", staffId: ME_ID },
  { slug: "antologi-pulang-ke-pesisir", role: "editor", staffId: ME_ID },
  { slug: "solo-penerbitan-buku-sendiri", role: "editor", staffId: ME_ID },
  { slug: "kelas-cerpen-untuk-pemula", role: "mentor", staffId: ME_ID },
  { slug: "lomba-cerpen-hujan-2026", role: "juri", staffId: ME_ID },
];

const isAssignment = (value: unknown): value is StaffAssignment => {
  if (typeof value !== "object" || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.slug === "string" &&
    typeof a.staffId === "string" &&
    STAFF_ROLES.includes(a.role as StaffRole)
  );
};

export const staffAssignments = createLocalListStore<StaffAssignment>(
  "ranah.staffAssignments",
  isAssignment,
  SEED_ASSIGNMENTS,
);

/** Whether the signed-in dummy account holds this role on the project. */
export const isAssignedToSelf = (
  list: readonly StaffAssignment[],
  slug: string,
  role: StaffRole,
): boolean => list.some((a) => a.slug === slug && a.role === role && isSelf(a.staffId));

/** Who holds `role` on `slug`, by the id data is compared by. */
export const assigneesOf = (list: readonly StaffAssignment[], slug: string, role: StaffRole) =>
  list.filter((a) => a.slug === slug && a.role === role).map((a) => canonicalId(a.staffId));

/** Replace who holds `role` on `slug`, leaving every other assignment as it is. Logged (PLT-05). */
export function setAssignees(slug: string, role: StaffRole, staffIds: readonly string[]) {
  const before = assigneesOf(staffAssignments.read(), slug, role);
  const rest = staffAssignments.read().filter((a) => !(a.slug === slug && a.role === role));
  staffAssignments.write([...rest, ...staffIds.map((staffId) => ({ slug, role, staffId }))]);
  const entry = (action: "staff.assign" | "staff.unassign", targetId: string) => ({
    action,
    actorId: ME_ID,
    targetId,
    role,
    slug,
  });
  appendAudit([
    ...staffIds.filter((id) => !before.includes(id)).map((id) => entry("staff.assign", id)),
    ...before.filter((id) => !staffIds.includes(id)).map((id) => entry("staff.unassign", id)),
  ]);
}

/**
 * Takes a person off every project where they hold `role` (their role was revoked). Returns what
 * was removed so the caller can log it.
 */
export function removeAssignmentsOf(personId: string, role: StaffRole): StaffAssignment[] {
  const all = staffAssignments.read();
  const removed = all.filter((a) => a.role === role && canonicalId(a.staffId) === personId);
  if (removed.length > 0) staffAssignments.write(all.filter((a) => !removed.includes(a)));
  return removed;
}

export const useStaffAssignments = staffAssignments.use;
