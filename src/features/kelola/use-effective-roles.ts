"use client";

import { useMemo } from "react";
import { useRoles, useViewer, readViewerNow } from "@/lib/viewer";
import type { ManagerRole } from "@/lib/roles";
import { ME_ID } from "./identity";
import { effectiveRoles } from "./admin/role-rules";
import { roleGrants, suspensions, useRoleGrants, useSuspensions } from "./admin/role-store";

/**
 * The management roles of the signed-in dummy account: those given on the Admin screen plus, in
 * development and tests only, those chosen with `?sebagai=`. Use this, not `useRoles`, wherever a
 * screen decides what to show. Not access control: Row Level Security is.
 */
export function useEffectiveRoles(): readonly ManagerRole[] {
  const dev = useRoles();
  const viewer = useViewer();
  const grants = useRoleGrants();
  const suspended = useSuspensions();
  return useMemo(
    () => effectiveRoles(dev, grants, suspended, ME_ID, viewer === "tamu"),
    [dev, grants, suspended, viewer],
  );
}

/** The same, read at the moment a button is pressed (an action must not trust what it rendered). */
export function readEffectiveRoles(): readonly ManagerRole[] {
  const { viewer, roles } = readViewerNow();
  return effectiveRoles(roles, roleGrants.read(), suspensions.read(), ME_ID, viewer === "tamu");
}
