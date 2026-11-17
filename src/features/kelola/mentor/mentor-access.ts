import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";
import { SEED_ASSIGNMENTS, isAssignedToSelf, type StaffAssignment } from "../staff-assignments";
import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";

export type ClassAccess = "ok" | "tidak-ditugaskan" | "bukan-kelas";

/**
 * Whether these roles may manage a class. Administrator and Super Admin may manage any class (PRD
 * 15.2); a Mentor only the classes assigned to them. Not access control: Row Level Security is.
 */
export function classAccess(
  roles: readonly ManagerRole[],
  slug: string,
  catalog: readonly ProjectFixture[] = projectFixtures,
  assigned: readonly StaffAssignment[] = SEED_ASSIGNMENTS,
): ClassAccess {
  const project = catalog.find((p) => p.slug === slug && p.publication === "terbit");
  if (!project || project.category !== "kelas") return "bukan-kelas";
  if (isPlatformAdmin(roles)) return "ok";
  return roles.includes("mentor") && isAssignedToSelf(assigned, slug, "mentor")
    ? "ok"
    : "tidak-ditugaskan";
}

/** The published classes these roles may manage. */
export function manageableClasses(
  roles: readonly ManagerRole[],
  catalog: readonly ProjectFixture[] = projectFixtures,
  assigned: readonly StaffAssignment[] = SEED_ASSIGNMENTS,
): ProjectFixture[] {
  return catalog.filter((p) => classAccess(roles, p.slug, catalog, assigned) === "ok");
}
