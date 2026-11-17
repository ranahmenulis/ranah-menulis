import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";
import { SEED_ASSIGNMENTS, isAssignedToSelf, type StaffAssignment } from "../staff-assignments";
import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";

export type ReviewAccess = "ok" | "tidak-ditugaskan" | "bukan-karya-editor";

/**
 * Whether these roles may review work sent to a project. Only Antologi and Solo go through an
 * Editor (PRJ-04); Lomba is judged (6g-4) and Kelas has assignments. Administrator and Super Admin
 * may review any of them (PRD 15.2); an Editor only what is assigned (BR-PRJ-06).
 *
 * This decides what the screen shows. It is not access control: Row Level Security is.
 */
export function reviewAccess(
  roles: readonly ManagerRole[],
  slug: string,
  catalog: readonly ProjectFixture[] = projectFixtures,
  assigned: readonly StaffAssignment[] = SEED_ASSIGNMENTS,
): ReviewAccess {
  const project = catalog.find((p) => p.slug === slug);
  if (!project || (project.category !== "antologi" && project.category !== "solo")) {
    return "bukan-karya-editor";
  }
  if (isPlatformAdmin(roles)) return "ok";
  // An archived project ends its assignments (Q-04).
  if (project.publication === "arsip") return "tidak-ditugaskan";
  return roles.includes("editor") && isAssignedToSelf(assigned, slug, "editor")
    ? "ok"
    : "tidak-ditugaskan";
}
