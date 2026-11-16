"use client";

import { useMemo } from "react";
import { useViewer } from "@/lib/viewer";
import { useRegistrations } from "../../registration-store";
import type { Project, ProjectFixture, Registration } from "../../types";
import { useProjects } from "../../use-projects";
import {
  assignmentRows,
  classProgress,
  dashboardBlock,
  resolveClass,
  type AssignmentRow,
  type DashboardBlock,
  type Progress,
} from "../class-model";
import { classFixtures } from "../fixtures/all";
import { useDoneMaterials } from "../material-progress";
import type { AssignmentStore } from "../storage/assignment-store";
import type { AssignmentSubmission, ClassContent, ClassFixture } from "../types";
import { useAssignments } from "./use-assignments";

export type ClassData =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  /** No such project, a draft, or a project with no class content: all "not found". */
  | { status: "gone" }
  | { status: "blocked"; project: Project; block: DashboardBlock }
  | {
      status: "ready";
      project: Project;
      registration: Registration;
      content: ClassContent;
      /** When the page opened; the real check happens again when a button is pressed. */
      now: number;
      rows: AssignmentRow[];
      submissions: AssignmentSubmission[];
      done: ReadonlySet<string>;
      progress: Progress;
    };

type Sources = { source?: ProjectFixture[]; store?: AssignmentStore; classes?: ClassFixture[] };

/**
 * Everything the class screens need, read once for the page: the project, who the reader is, the
 * class content, what was handed in and what was marked done. Loading, error, blocked and ready
 * are separate, so a failed read is never shown as "nothing handed in yet".
 */
export function useClass(slug: string, sources: Sources = {}): ClassData {
  const { source, store, classes = classFixtures } = sources;
  const catalog = useProjects(source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const assignments = useAssignments(store);
  const done = useDoneMaterials(slug);

  return useMemo<ClassData>(() => {
    if (assignments.status === "error") return { status: "error", reload: assignments.reload };
    if (catalog.status === "loading" || assignments.status === "loading") {
      return { status: "loading" };
    }
    const project = catalog.projects.find((p) => p.slug === slug && p.publication === "terbit");
    if (!project) return { status: "gone" };
    const registration = guest ? undefined : registrations[slug];
    const block = dashboardBlock({ project, guest, registration });
    if (block !== null) return { status: "blocked", project, block };
    const fixture = classes.find((c) => c.slug === slug);
    const content = fixture ? resolveClass(fixture, project) : null;
    if (!content || !registration) return { status: "gone" };
    const mine = assignments.submissions.filter((s) => s.slug === slug);
    return {
      status: "ready",
      project,
      registration,
      content,
      now: catalog.now,
      rows: assignmentRows(content, mine, catalog.now),
      submissions: mine,
      done,
      progress: classProgress(content, done, mine),
    };
  }, [catalog, guest, registrations, assignments, done, slug, classes]);
}
