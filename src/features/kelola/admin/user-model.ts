import { MANAGER_ROLES, type ManagerRole } from "@/lib/roles";
import { people } from "./people";
import { isSuspended, rolesOf } from "./role-rules";
import type { RoleGrant, Suspension } from "./role-store";

export type UserRow = {
  id: string;
  name: string;
  handle: string;
  roles: ManagerRole[];
  suspended: boolean;
};

export function userRows(grants: readonly RoleGrant[], list: readonly Suspension[]): UserRow[] {
  return people.map((p) => {
    const held = rolesOf(grants, p.id);
    return {
      ...p,
      roles: MANAGER_ROLES.filter((role) => held.includes(role)),
      suspended: isSuspended(list, p.id),
    };
  });
}

/** "peran" in the address: one role, or nothing for everyone. */
export type RoleFilter = ManagerRole | "semua";

export const parseRoleFilter = (raw: string | null): RoleFilter =>
  (MANAGER_ROLES as readonly string[]).includes(raw ?? "") ? (raw as ManagerRole) : "semua";

export const usersQuery = (q: string, role: RoleFilter) => {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (role !== "semua") params.set("peran", role);
  const text = params.toString();
  return text ? `?${text}` : "";
};

/** Search by name or handle, ignoring case, then keep those holding the role. */
export function filterUsers(rows: readonly UserRow[], q: string, role: RoleFilter): UserRow[] {
  const needle = q.trim().toLowerCase().replace(/^@/, "");
  return rows.filter(
    (r) =>
      (role === "semua" || r.roles.includes(role)) &&
      (needle === "" ||
        r.name.toLowerCase().includes(needle) ||
        r.handle.toLowerCase().includes(needle)),
  );
}
