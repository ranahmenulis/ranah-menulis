"use client";

import { useMemo } from "react";
import { liveRegistration } from "@/features/projects/payment-model";
import { useRegistrations } from "@/features/projects/registration-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { storedProjects } from "@/features/projects/stored-projects";
import type { Project, ProjectFixture, Registration } from "@/features/projects/types";
import { useProjects } from "@/features/projects/use-projects";
import { useSubmissions } from "@/features/projects/use-submissions";
import type { Submission } from "@/features/projects/submission-types";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { manageAccess, manageableProjects, type ManageAccess } from "./organizer-access";
import { organizerStatus, type OrganizerStatus } from "./project-status";

export type OrganizerRow = {
  project: Project;
  status: OrganizerStatus;
  registrants: number;
  submissions: number;
  /** Written here, so it can be changed; the sample projects are read-only. */
  editable: boolean;
};

export type OrganizerListData =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  | { status: "ready"; now: number; rows: OrganizerRow[] };

type Sources = { store?: SubmissionStore };

function rowsFor(
  projects: Project[],
  stored: readonly ProjectFixture[],
  registrations: Record<string, Registration>,
  submissions: Submission[],
  now: number,
): OrganizerRow[] {
  return projects.map((project) => ({
    project,
    status: organizerStatus(project, now),
    registrants: liveRegistration(registrations[project.slug], now) ? 1 : 0,
    submissions: submissions.filter((s) => s.slug === project.slug && s.status !== "draf").length,
    editable: stored.some((p) => p.slug === project.slug),
  }));
}

/** The projects these roles may manage, with the numbers an Organizer looks at first. */
export function useOrganizerList(sources: Sources = {}): OrganizerListData {
  const catalog = useProjects();
  const roles = useEffectiveRoles();
  const submissions = useSubmissions(sources.store);
  const registrations = useRegistrations();
  const stored = storedProjects.use();

  return useMemo<OrganizerListData>(() => {
    if (submissions.status === "error") return { status: "error", reload: submissions.reload };
    if (catalog.status === "loading" || submissions.status === "loading") {
      return { status: "loading" };
    }
    const mine = manageableProjects(roles, catalog.projects);
    return {
      status: "ready",
      now: catalog.now,
      rows: rowsFor(mine, stored, registrations, submissions.submissions, catalog.now),
    };
  }, [catalog, submissions, roles, stored, registrations]);
}

export type OrganizerProjectData =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  | { status: "gone" }
  | { status: "blocked"; reason: Exclude<ManageAccess, "ok"> }
  | {
      status: "ready";
      now: number;
      row: OrganizerRow;
      /** Non-draft submissions of this project, newest first. */
      works: Submission[];
      registration: Registration | undefined;
      /** As stored, even when its payment hold ran out (the payments tab shows that too). */
      rawRegistration: Registration | undefined;
      fixture: ProjectFixture | undefined;
    };

export function useOrganizerProject(slug: string, sources: Sources = {}): OrganizerProjectData {
  const catalog = useProjects();
  const roles = useEffectiveRoles();
  const submissions = useSubmissions(sources.store);
  const registrations = useRegistrations();
  const stored = storedProjects.use();

  return useMemo<OrganizerProjectData>(() => {
    if (submissions.status === "error") return { status: "error", reload: submissions.reload };
    if (catalog.status === "loading" || submissions.status === "loading") {
      return { status: "loading" };
    }
    const project = catalog.projects.find((p) => p.slug === slug);
    if (!project) return { status: "gone" };
    const access = manageAccess(roles, project);
    if (access !== "ok") return { status: "blocked", reason: access };
    const works = submissions.submissions.filter((s) => s.slug === slug && s.status !== "draf");
    const [row] = rowsFor([project], stored, registrations, works, catalog.now);
    return {
      status: "ready",
      now: catalog.now,
      row,
      works,
      registration: liveRegistration(registrations[slug], catalog.now),
      rawRegistration: registrations[slug],
      fixture: stored.find((p) => p.slug === slug),
    };
  }, [catalog, submissions, roles, stored, registrations, slug]);
}
