/**
 * Management roles (PRD 15.1). Only the roles that open the /kelola screens; Writer, Registered
 * User and group roles are not here. While sign-in is bypassed a role is chosen with
 * `?sebagai=<role>[,<role>]` in development and tests only (see `lib/viewer.ts`).
 *
 * This is for showing the right screens. It is NOT access control: real enforcement is Row Level
 * Security in the database, which checks the account's role and assignments on every query.
 */
export const MANAGER_ROLES = [
  "organizer",
  "editor",
  "juri",
  "mentor",
  "administrator",
  "super-admin",
] as const;

export type ManagerRole = (typeof MANAGER_ROLES)[number];

export const roleLabel: Record<ManagerRole, string> = {
  organizer: "Organizer",
  editor: "Editor",
  juri: "Juri",
  mentor: "Mentor",
  administrator: "Administrator",
  "super-admin": "Super Admin",
};

export const NO_ROLES: readonly ManagerRole[] = [];

const isRole = (value: string): value is ManagerRole =>
  (MANAGER_ROLES as readonly string[]).includes(value);

/** Parses "editor, juri" into known roles in the order given. Unknown words are ignored. */
export function parseRoles(raw: string | null | undefined): readonly ManagerRole[] {
  if (!raw) return NO_ROLES;
  const found = new Set<ManagerRole>();
  for (const word of raw.split(",")) {
    const role = word.trim().toLowerCase();
    if (isRole(role)) found.add(role);
  }
  return found.size === 0 ? NO_ROLES : [...found];
}

/** Both platform roles; they reach every management area (PRD 15.2). */
export const isPlatformAdmin = (roles: readonly ManagerRole[]) =>
  roles.includes("administrator") || roles.includes("super-admin");
