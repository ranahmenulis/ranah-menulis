import { readRegistrations, settlePayment } from "@/features/projects/registration-store";
import { fileStore } from "@/lib/files/store";
import { mergeCatalog } from "@/features/projects/use-catalog";
import { storedProjects } from "@/features/projects/stored-projects";
import { liveRegistration } from "@/features/projects/payment-model";
import type { ProjectFixture, Publication } from "@/features/projects/types";
import { staffAssignments } from "../staff-assignments";
import { OWNER_ID } from "./organizer-access";
import { buildProject, type BuildResult } from "./project-build";
import { discardPoster } from "./poster-files";
import type { ProjectInput } from "./project-input";
import { renderProblem } from "./project-problem";
import type { StatusAction } from "./project-status";

/** Seats this device knows about for a project: a registration that still holds one. */
export function registrantsOf(slug: string, now: number): number {
  return liveRegistration(readRegistrations()[slug], now) ? 1 : 0;
}

/** Writes a new draft, or the changes to a stored project. Returns the build result as it is. */
export function saveProject(input: ProjectInput, slug: string | null, now: number): BuildResult {
  const stored = storedProjects.read();
  const existing = slug ? stored.find((p) => p.slug === slug) : undefined;
  if (slug && !existing) {
    const problem = { code: "notFound" } as const;
    return {
      ok: false,
      errors: { title: renderProblem(problem, "id") },
      problems: { title: problem },
    };
  }
  const result = buildProject(input, {
    now,
    taken: slug ? registrantsOf(slug, now) : 0,
    existing,
    slugs: mergeCatalog(stored).map((p) => p.slug),
    ownerId: OWNER_ID,
  });
  if (!result.ok) return result;
  storedProjects.write(
    existing
      ? stored.map((p) => (p.slug === slug ? result.project : p))
      : [...stored, result.project],
  );
  return result;
}

const publicationAfter: Partial<Record<StatusAction, Publication>> = {
  terbitkan: "terbit",
  arsipkan: "arsip",
};

/** "ok", or why nothing changed. Reads the stored project and the registrations again now. */
export function applyAction(
  slug: string,
  action: StatusAction,
  now: number,
): "ok" | "tidak-ada" | "ada-peserta" | "sudah-berubah" {
  const stored = storedProjects.read();
  const project = stored.find((p) => p.slug === slug);
  if (!project) return "tidak-ada";
  if (action === "hapus") {
    if (project.publication !== "draf") return "sudah-berubah";
    if (registrantsOf(slug, now) > 0) return "ada-peserta";
    storedProjects.write(stored.filter((p) => p.slug !== slug));
    // A new project may reuse this slug; it must not inherit who worked on this one.
    staffAssignments.write(staffAssignments.read().filter((a) => a.slug !== slug));
    // The poster belonged to this draft alone; free its file (a failure only leaves it behind).
    if (project.poster) void discardPoster(project.poster.fileId, fileStore());
    return "ok";
  }
  if (project.publication === "arsip") return "sudah-berubah";
  if (action === "tutup") {
    if (project.publication !== "terbit") return "sudah-berubah";
    const closed: ProjectFixture = {
      ...project,
      absolute: { milestones: [], ...project.absolute, closesAt: now - 1 },
    };
    storedProjects.write(stored.map((p) => (p.slug === slug ? closed : p)));
    return "ok";
  }
  const next = publicationAfter[action];
  if (!next || (action === "terbitkan" && project.publication !== "draf")) return "sudah-berubah";
  storedProjects.write(stored.map((p) => (p.slug === slug ? { ...p, publication: next } : p)));
  return "ok";
}

/**
 * An Organizer or Administrator confirms that payment arrived (PLT-07). Reads the registration again
 * now: refused when it is already paid or its hold ran out (the seat may be gone).
 */
export const confirmPaymentFor = (slug: string, now: number): boolean =>
  settlePayment(slug, now, "organizer");
