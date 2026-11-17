import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";
import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";

/**
 * [usulan] Which classes the dummy Mentor is assigned to. PRD 15.1: a Mentor gives feedback only to
 * the participants of their own class (BR-PRJ-06). Assignment screens belong to the Organizer
 * (6g-3a), so it is fixed here. One class is left out on purpose, so "not assigned to you" can be
 * reached.
 */
export const ASSIGNED_CLASSES: readonly string[] = ["kelas-cerpen-untuk-pemula"];

export type ClassAccess = "ok" | "tidak-ditugaskan" | "bukan-kelas";

/**
 * Whether these roles may manage a class. Administrator and Super Admin may manage any class (PRD
 * 15.2); a Mentor only the classes assigned to them. Not access control: Row Level Security is.
 */
export function classAccess(
  roles: readonly ManagerRole[],
  slug: string,
  catalog: readonly ProjectFixture[] = projectFixtures,
): ClassAccess {
  const project = catalog.find((p) => p.slug === slug && p.publication === "terbit");
  if (!project || project.category !== "kelas") return "bukan-kelas";
  if (isPlatformAdmin(roles)) return "ok";
  return roles.includes("mentor") && ASSIGNED_CLASSES.includes(slug) ? "ok" : "tidak-ditugaskan";
}

/** The published classes these roles may manage. */
export function manageableClasses(
  roles: readonly ManagerRole[],
  catalog: readonly ProjectFixture[] = projectFixtures,
): ProjectFixture[] {
  return catalog.filter((p) => classAccess(roles, p.slug, catalog) === "ok");
}
