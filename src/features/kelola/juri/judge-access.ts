import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";
import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";
import { SEED_ASSIGNMENTS, isAssignedToSelf, type StaffAssignment } from "../staff-assignments";

type Listed = Pick<ProjectFixture, "slug" | "publication" | "category">;

export type JudgeAccess = "ok" | "tidak-ditugaskan" | "bukan-lomba";

/**
 * Whether these roles may judge a contest (LMB-01, BR-PRJ-06). Assignment is per contest [usulan],
 * as for Editors. Administrator and Super Admin may open any; a Judge only the contests assigned to
 * them. An archived or draft project is not judged. Not access control: Row Level Security is.
 */
export function judgeAccess(
  roles: readonly ManagerRole[],
  slug: string,
  catalog: readonly Listed[] = projectFixtures,
  assigned: readonly StaffAssignment[] = SEED_ASSIGNMENTS,
): JudgeAccess {
  const project = catalog.find((p) => p.slug === slug && p.publication === "terbit");
  if (!project || project.category !== "lomba") return "bukan-lomba";
  if (isPlatformAdmin(roles)) return "ok";
  return roles.includes("juri") && isAssignedToSelf(assigned, slug, "juri")
    ? "ok"
    : "tidak-ditugaskan";
}

/** The published contests these roles may judge. */
export const judgeableContests = (
  roles: readonly ManagerRole[],
  catalog: readonly ProjectFixture[] = projectFixtures,
  assigned: readonly StaffAssignment[] = SEED_ASSIGNMENTS,
): ProjectFixture[] =>
  catalog.filter((p) => judgeAccess(roles, p.slug, catalog, assigned) === "ok");
