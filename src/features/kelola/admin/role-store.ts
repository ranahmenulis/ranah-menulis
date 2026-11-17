"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { SETUP_ID } from "../identity";
import { MANAGER_ROLES, type ManagerRole } from "@/lib/roles";

/** A management role given to a person (PRD 15.3). Who gave it and when are kept for the audit. */
export type RoleGrant = {
  userId: string;
  role: ManagerRole;
  grantedBy: string;
  at: number;
  reason?: string;
};

/** A suspended account (PLT-05). Without sign-in this only marks the person and ends their roles. */
export type Suspension = { userId: string; by: string; at: number; reason: string };

/**
 * What an untouched device starts with [usulan]: one Super Admin and one holder of each role that is
 * assigned to projects, so there is always someone to choose from. The signed-in dummy account holds
 * nothing here: its roles come from `?sebagai=` in development, or from the Admin screen.
 */
export const SEED_GRANTS: readonly RoleGrant[] = [
  { userId: "nur-aisyah", role: "super-admin", grantedBy: SETUP_ID, at: 0 },
  { userId: "hafiz-rahman", role: "editor", grantedBy: SETUP_ID, at: 0 },
  { userId: "dimas-pratama", role: "mentor", grantedBy: SETUP_ID, at: 0 },
  { userId: "maya-anindita", role: "juri", grantedBy: SETUP_ID, at: 0 },
];

const isGrant = (value: unknown): value is RoleGrant => {
  if (typeof value !== "object" || value === null) return false;
  const g = value as Record<string, unknown>;
  return (
    typeof g.userId === "string" &&
    (MANAGER_ROLES as readonly string[]).includes(g.role as string) &&
    typeof g.grantedBy === "string" &&
    Number.isFinite(g.at) &&
    (g.reason === undefined || typeof g.reason === "string")
  );
};

const isSuspension = (value: unknown): value is Suspension => {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.userId === "string" &&
    typeof s.by === "string" &&
    Number.isFinite(s.at) &&
    typeof s.reason === "string"
  );
};

/** localStorage `ranah.roleGrants`; becomes tables with RLS (only the platform roles write). */
export const roleGrants = createLocalListStore<RoleGrant>("ranah.roleGrants", isGrant, SEED_GRANTS);
export const suspensions = createLocalListStore<Suspension>("ranah.suspensions", isSuspension);

export const useRoleGrants = roleGrants.use;
export const useSuspensions = suspensions.use;
