import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";
import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";

/**
 * [usulan] Which projects the dummy Editor is assigned to. PRD 15.1 says assignment is per
 * submission and PRJ-03 lets an Organizer assign Editors per project; with one dummy Editor and
 * no assignment screen yet (Organizer, 6g-3a) it is per project and fixed here. One Antologi
 * project is left out on purpose, so the "not assigned to you" state can be reached.
 */
export const ASSIGNED_PROJECTS: readonly string[] = [
  "antologi-surat-yang-tidak-pernah-terkirim",
  "antologi-pulang-ke-pesisir",
  "solo-penerbitan-buku-sendiri",
];

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
): ReviewAccess {
  const project = catalog.find((p) => p.slug === slug);
  if (!project || (project.category !== "antologi" && project.category !== "solo")) {
    return "bukan-karya-editor";
  }
  if (isPlatformAdmin(roles)) return "ok";
  return roles.includes("editor") && ASSIGNED_PROJECTS.includes(slug) ? "ok" : "tidak-ditugaskan";
}
