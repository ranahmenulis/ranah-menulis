import { NO_ROLES, isPlatformAdmin, type ManagerRole } from "@/lib/roles";
import type { RoleGrant, Suspension } from "./role-store";

/**
 * Who may change whose roles (PRD 15.1 to 15.3, AC-SA1 to AC-SA3). Pure, so the screen and the
 * action that writes use the same rules. Not access control: Row Level Security is.
 */
export const isAdminTier = (role: ManagerRole) =>
  role === "administrator" || role === "super-admin";

export type RoleChange = "grant" | "revoke";
export type AccountChange = "suspend" | "restore";

export type RuleBlock =
  | "bukan-wewenang"
  | "hanya-super-admin"
  | "target-tingkat-administrator"
  | "diri-sendiri"
  | "sudah-memegang"
  | "tidak-memegang"
  | "super-admin-terakhir"
  | "sudah-ditangguhkan"
  | "tidak-ditangguhkan";

export const blockMessage: Record<RuleBlock, string> = {
  "bukan-wewenang": "Hanya Administrator dan Super Admin yang bisa mengubah role.",
  "hanya-super-admin": "Hanya Super Admin yang bisa memberi atau mencabut role ini.",
  "target-tingkat-administrator":
    "Pengguna ini memegang role tingkat Administrator. Hanya Super Admin yang bisa mengubahnya.",
  "diri-sendiri": "Kamu tidak bisa melakukan ini pada akunmu sendiri.",
  "sudah-memegang": "Pengguna ini sudah memegang role itu.",
  "tidak-memegang": "Pengguna ini tidak memegang role itu lagi.",
  "super-admin-terakhir": "Sistem harus menyisakan minimal satu Super Admin aktif.",
  "sudah-ditangguhkan": "Akun ini sudah ditangguhkan.",
  "tidak-ditangguhkan": "Akun ini tidak sedang ditangguhkan.",
};

type Context = {
  actorRoles: readonly ManagerRole[];
  actorId: string;
  grants: readonly RoleGrant[];
  suspensions: readonly Suspension[];
  targetId: string;
};

export const rolesOf = (grants: readonly RoleGrant[], userId: string): ManagerRole[] =>
  grants.filter((g) => g.userId === userId).map((g) => g.role);

export const isSuspended = (list: readonly Suspension[], userId: string) =>
  list.some((s) => s.userId === userId);

/** People holding `role` whose account is not suspended. */
export const activeHolders = (
  grants: readonly RoleGrant[],
  list: readonly Suspension[],
  role: ManagerRole,
): string[] => [
  ...new Set(
    grants.filter((g) => g.role === role && !isSuspended(list, g.userId)).map((g) => g.userId),
  ),
];

const holdsAdminTier = (grants: readonly RoleGrant[], userId: string) =>
  rolesOf(grants, userId).some(isAdminTier);

/** Why a Super Admin may not lose this role or account now, or null. */
function lastSuperAdmin(ctx: Context): RuleBlock | null {
  const active = activeHolders(ctx.grants, ctx.suspensions, "super-admin");
  return active.length === 1 && active[0] === ctx.targetId ? "super-admin-terakhir" : null;
}

/** Why `change` of `role` is refused, or null when it may go ahead. */
export function roleChangeBlock(
  ctx: Context,
  role: ManagerRole,
  change: RoleChange,
): RuleBlock | null {
  if (!isPlatformAdmin(ctx.actorRoles)) return "bukan-wewenang";
  const isSuper = ctx.actorRoles.includes("super-admin");
  if (isAdminTier(role) && !isSuper) return "hanya-super-admin";
  if (!isSuper && holdsAdminTier(ctx.grants, ctx.targetId)) return "target-tingkat-administrator";
  const holds = rolesOf(ctx.grants, ctx.targetId).includes(role);
  if (change === "grant") {
    if (holds) return "sudah-memegang";
    return isAdminTier(role) && ctx.actorId === ctx.targetId ? "diri-sendiri" : null;
  }
  if (!holds) return "tidak-memegang";
  return role === "super-admin" ? lastSuperAdmin(ctx) : null;
}

/** Why `change` of the account is refused, or null. A suspended Super Admin no longer counts. */
export function accountChangeBlock(ctx: Context, change: AccountChange): RuleBlock | null {
  if (!isPlatformAdmin(ctx.actorRoles)) return "bukan-wewenang";
  if (ctx.actorId === ctx.targetId) return "diri-sendiri";
  if (!ctx.actorRoles.includes("super-admin") && holdsAdminTier(ctx.grants, ctx.targetId)) {
    return "target-tingkat-administrator";
  }
  const suspended = isSuspended(ctx.suspensions, ctx.targetId);
  if (change === "restore") return suspended ? null : "tidak-ditangguhkan";
  if (suspended) return "sudah-ditangguhkan";
  return rolesOf(ctx.grants, ctx.targetId).includes("super-admin") ? lastSuperAdmin(ctx) : null;
}

/** A reason is written for the sensitive changes [usulan]: Administrator tier, any removal. */
export const needsReason = (role: ManagerRole | null, change: RoleChange | AccountChange) =>
  change !== "grant" && change !== "restore" ? true : role !== null && isAdminTier(role);

/**
 * The roles that open the management screens: those given on the Admin screen to this account,
 * plus the ones chosen with `?sebagai=` in development. A suspended or signed-out account has none.
 */
export function effectiveRoles(
  dev: readonly ManagerRole[],
  grants: readonly RoleGrant[],
  list: readonly Suspension[],
  userId: string,
  signedOut: boolean,
): readonly ManagerRole[] {
  if (signedOut || isSuspended(list, userId)) return NO_ROLES;
  const merged = new Set<ManagerRole>([...dev, ...rolesOf(grants, userId)]);
  return merged.size === 0 ? NO_ROLES : [...merged];
}
