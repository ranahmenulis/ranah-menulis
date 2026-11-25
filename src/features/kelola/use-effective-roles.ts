"use client";

import { useMemo } from "react";
import { readSessionNow, useSession } from "@/lib/auth/session-context";
import { useRoles, useViewer, readViewerNow } from "@/lib/viewer";
import { NO_ROLES, type ManagerRole } from "@/lib/roles";
import { ME_ID } from "./identity";
import { effectiveRoles } from "./admin/role-rules";
import { roleGrants, suspensions, useRoleGrants, useSuspensions } from "./admin/role-store";

/** Platform roles from the database (a signed-in account) added to those chosen on this device. */
function withDatabaseRoles(
  roles: readonly ManagerRole[],
  database: readonly ManagerRole[],
): readonly ManagerRole[] {
  if (database.length === 0) return roles;
  return [...new Set([...roles, ...database])];
}

/**
 * The management roles of the signed-in dummy account: those given on the Admin screen plus, in
 * development and tests only, those chosen with `?sebagai=`. Use this, not `useRoles`, wherever a
 * screen decides what to show. Not access control: Row Level Security is.
 */
export function useEffectiveRoles(): readonly ManagerRole[] {
  const dev = useRoles();
  const viewer = useViewer();
  const database = useSession()?.platformRoles ?? NO_ROLES;
  const grants = useRoleGrants();
  const suspended = useSuspensions();
  return useMemo(
    () =>
      withDatabaseRoles(effectiveRoles(dev, grants, suspended, ME_ID, viewer === "tamu"), database),
    [dev, grants, suspended, viewer, database],
  );
}

/** The same, read at the moment a button is pressed (an action must not trust what it rendered). */
export function readEffectiveRoles(): readonly ManagerRole[] {
  const { viewer, roles } = readViewerNow();
  const database = readSessionNow()?.platformRoles ?? NO_ROLES;
  return withDatabaseRoles(
    effectiveRoles(roles, roleGrants.read(), suspensions.read(), ME_ID, viewer === "tamu"),
    database,
  );
}
