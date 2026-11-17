import type { ManagerRole } from "@/lib/roles";
import { isPlatformAdmin } from "@/lib/roles";
import type { ProjectFixture } from "@/features/projects/types";

import { ME_ID, isSelf } from "../identity";

/** The signed-in dummy account, as an Organizer. Real accounts replace it. */
export const OWNER_ID = ME_ID;

export type ManageAccess = "ok" | "bukan-milikmu" | "tidak-ada";

/**
 * Whether these roles may manage a project (PRJ-03, BR-PRJ-06, AC-26): an Organizer only the
 * projects they own, Administrator and Super Admin all of them [usulan, PRD 15.2]. The sample
 * projects have no owner and belong to the team, so the dummy Organizer manages them. Archived
 * projects stay manageable, so they can be read back. Not access control: Row Level Security is.
 */
export function manageAccess(
  roles: readonly ManagerRole[],
  project: Pick<ProjectFixture, "ownerId"> | undefined,
): ManageAccess {
  if (!project) return "tidak-ada";
  if (isPlatformAdmin(roles)) return "ok";
  if (!roles.includes("organizer")) return "bukan-milikmu";
  return project.ownerId === undefined || isSelf(project.ownerId) ? "ok" : "bukan-milikmu";
}

export const manageableProjects = <T extends Pick<ProjectFixture, "ownerId">>(
  roles: readonly ManagerRole[],
  catalog: readonly T[],
): T[] => catalog.filter((p) => manageAccess(roles, p) === "ok");
