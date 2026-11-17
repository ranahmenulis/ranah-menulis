"use client";

import { createLocalListStore } from "@/lib/local-list-store";

/**
 * Who is assigned to a project (PRJ-03, Q-04): the Organizer of the project, or an Administrator,
 * assigns Editors, Mentors and Judges. [usulan] The people are a short fixed list until real
 * accounts exist (6g-5). The first of each role is the signed-in dummy account, so assigning
 * someone else makes the "not assigned to you" state reachable.
 */
export type StaffRole = "editor" | "mentor" | "juri";
export type StaffPerson = { id: string; name: string };
export type StaffAssignment = { slug: string; role: StaffRole; staffId: string };

export const STAFF_ROLES: readonly StaffRole[] = ["editor", "mentor", "juri"];

export const STAFF: Record<StaffRole, readonly StaffPerson[]> = {
  editor: [
    { id: "editor-kamu", name: "Editor (akunmu)" },
    { id: "editor-rani", name: "Rani, Editor" },
  ],
  mentor: [
    { id: "mentor-kamu", name: "Mentor (akunmu)" },
    { id: "mentor-bima", name: "Bima, Mentor" },
  ],
  juri: [
    { id: "juri-kamu", name: "Juri (akunmu)" },
    { id: "juri-sari", name: "Sari, Juri" },
  ],
};

export const staffRoleLabel: Record<StaffRole, string> = {
  editor: "Editor",
  mentor: "Mentor",
  juri: "Juri",
};

export const SELF_ID: Record<StaffRole, string> = {
  editor: STAFF.editor[0].id,
  mentor: STAFF.mentor[0].id,
  juri: STAFF.juri[0].id,
};

/** What an untouched device starts with: the projects the first Editor and Mentor screens used. */
export const SEED_ASSIGNMENTS: readonly StaffAssignment[] = [
  { slug: "antologi-surat-yang-tidak-pernah-terkirim", role: "editor", staffId: SELF_ID.editor },
  { slug: "antologi-pulang-ke-pesisir", role: "editor", staffId: SELF_ID.editor },
  { slug: "solo-penerbitan-buku-sendiri", role: "editor", staffId: SELF_ID.editor },
  { slug: "kelas-cerpen-untuk-pemula", role: "mentor", staffId: SELF_ID.mentor },
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
): boolean => list.some((a) => a.slug === slug && a.role === role && a.staffId === SELF_ID[role]);

export const assigneesOf = (list: readonly StaffAssignment[], slug: string, role: StaffRole) =>
  list.filter((a) => a.slug === slug && a.role === role).map((a) => a.staffId);

/** Replace who holds `role` on `slug`, leaving every other assignment as it is. */
export function setAssignees(slug: string, role: StaffRole, staffIds: readonly string[]) {
  const rest = staffAssignments.read().filter((a) => !(a.slug === slug && a.role === role));
  staffAssignments.write([...rest, ...staffIds.map((staffId) => ({ slug, role, staffId }))]);
}

export const useStaffAssignments = staffAssignments.use;
