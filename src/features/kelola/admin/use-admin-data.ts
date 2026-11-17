"use client";

import { useMemo } from "react";
import { useCatalog } from "@/features/projects/use-catalog";
import { useAuditLog, type AuditEntry } from "../audit/audit-log";
import { canonicalId } from "../identity";
import { useStaffAssignments, type StaffRole } from "../staff-assignments";
import { personById } from "./people";
import { useRoleGrants, useSuspensions } from "./role-store";
import { userRows, type UserRow } from "./user-model";

export function useAdminUsers(): UserRow[] {
  const grants = useRoleGrants();
  const suspended = useSuspensions();
  return useMemo(() => userRows(grants, suspended), [grants, suspended]);
}

export type UserAssignment = { slug: string; title: string; role: StaffRole };

type AdminUserState =
  | { status: "gone" }
  | {
      status: "ready";
      user: UserRow;
      assignments: UserAssignment[];
      history: AuditEntry[];
    };

/** One person with their assignments and the log entries about them (newest first). */
export function useAdminUser(id: string): AdminUserState {
  const users = useAdminUsers();
  const list = useStaffAssignments();
  const catalog = useCatalog();
  const log = useAuditLog();
  return useMemo(() => {
    const user = personById(id) && users.find((u) => u.id === id);
    if (!user) return { status: "gone" };
    const assignments = list
      .filter((a) => canonicalId(a.staffId) === id)
      .map((a) => ({
        slug: a.slug,
        role: a.role,
        title: catalog.find((p) => p.slug === a.slug)?.title ?? a.slug,
      }));
    const history = log.filter((e) => e.targetId === id).toReversed();
    return { status: "ready", user, assignments, history };
  }, [id, users, list, catalog, log]);
}
