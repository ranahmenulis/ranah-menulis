"use client";

import { useMemo } from "react";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { useClassFixtures } from "@/features/projects/kelas/class-source";
import { useStaffAssignments } from "../staff-assignments";
import { useCatalog } from "@/features/projects/use-catalog";
import { resolveClass } from "@/features/projects/kelas/class-model";
import { useAssignments } from "@/features/projects/kelas/hooks/use-assignments";
import { useMentorTasks } from "@/features/projects/kelas/mentor-task-store";
import type { MentorTask } from "@/features/projects/kelas/mentor-tasks";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type {
  AssignmentSubmission,
  ClassContent,
  ClassFixture,
} from "@/features/projects/kelas/types";
import { liveRegistration } from "@/features/projects/payment-model";
import { useRegistrations } from "@/features/projects/registration-store";
import type { Project, ProjectFixture, Registration } from "@/features/projects/types";
import { useProjects } from "@/features/projects/use-projects";
import { classAccess, manageableClasses, type ClassAccess } from "./mentor-access";

type Sources = { source?: ProjectFixture[]; store?: AssignmentStore; classes?: ClassFixture[] };

export type MentorClassData =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  | { status: "gone" }
  | { status: "blocked"; project: Project; reason: Exclude<ClassAccess, "ok"> }
  | {
      status: "ready";
      project: Project;
      content: ClassContent;
      now: number;
      /** Hand-ins of this class, newest first. */
      submissions: AssignmentSubmission[];
      /** Tasks written by mentors for this class. */
      tasks: MentorTask[];
      /** The registration made on this device, when active. */
      registration: Registration | undefined;
    };

/**
 * One class for the Mentor: the project, its content with the tasks written here, and every hand-in
 * of the class. A failed read is an error with a retry, never an empty class.
 */
export function useMentorClass(slug: string, sources: Sources = {}): MentorClassData {
  const { source: override, store, classes: overrideClasses } = sources;
  const fixtures = useCatalog();
  const source = override ?? fixtures;
  const defaultClasses = useClassFixtures();
  const classes = overrideClasses ?? defaultClasses;
  const catalog = useProjects(source);
  const roles = useEffectiveRoles();
  const assigned = useStaffAssignments();
  const assignments = useAssignments(store);
  const allTasks = useMentorTasks();
  const registrations = useRegistrations();

  return useMemo<MentorClassData>(() => {
    if (assignments.status === "error") return { status: "error", reload: assignments.reload };
    if (catalog.status === "loading" || assignments.status === "loading") {
      return { status: "loading" };
    }
    const project = catalog.projects.find((p) => p.slug === slug && p.publication === "terbit");
    if (!project || project.category !== "kelas") return { status: "gone" };
    const access = classAccess(roles, slug, source, assigned);
    if (access !== "ok") return { status: "blocked", project, reason: access };
    const tasks = allTasks.filter((t) => t.slug === slug);
    const fixture = classes.find((c) => c.slug === slug);
    const content = fixture ? resolveClass(fixture, project, tasks) : null;
    if (!content) return { status: "gone" };
    return {
      status: "ready",
      project,
      content,
      now: catalog.now,
      submissions: assignments.submissions.filter((s) => s.slug === slug),
      tasks: [...tasks],
      registration: liveRegistration(registrations[slug], catalog.now),
    };
  }, [catalog, assignments, roles, assigned, allTasks, registrations, slug, source, classes]);
}

export type ClassSummary = {
  project: Project;
  started: boolean;
  participants: number;
  tasks: number;
  toGrade: number;
};

export type MentorClassesData =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  | { status: "ready"; items: ClassSummary[] };

/** The classes these roles may manage, with the numbers a Mentor looks at first. */
export function useMentorClasses(sources: Sources = {}): MentorClassesData {
  const { source: override, store, classes: overrideClasses } = sources;
  const fixtures = useCatalog();
  const source = override ?? fixtures;
  const defaultClasses = useClassFixtures();
  const classes = overrideClasses ?? defaultClasses;
  const catalog = useProjects(source);
  const roles = useEffectiveRoles();
  const assigned = useStaffAssignments();
  const assignments = useAssignments(store);
  const allTasks = useMentorTasks();
  const registrations = useRegistrations();

  return useMemo<MentorClassesData>(() => {
    if (assignments.status === "error") return { status: "error", reload: assignments.reload };
    if (catalog.status === "loading" || assignments.status === "loading") {
      return { status: "loading" };
    }
    const allowed = new Set(manageableClasses(roles, source, assigned).map((p) => p.slug));
    const items = catalog.projects.flatMap((project) => {
      const fixture = classes.find((c) => c.slug === project.slug);
      if (!allowed.has(project.slug) || !fixture) return [];
      const content = resolveClass(
        fixture,
        project,
        allTasks.filter((t) => t.slug === project.slug),
      );
      if (!content) return [];
      const mine = assignments.submissions.filter((s) => s.slug === project.slug);
      return [
        {
          project,
          started: catalog.now >= content.startsAt,
          participants:
            liveRegistration(registrations[project.slug], catalog.now)?.status === "terdaftar"
              ? 1
              : 0,
          tasks: content.modules.length,
          toGrade: mine.filter((s) => s.status === "dikumpulkan").length,
        },
      ];
    });
    return { status: "ready", items };
  }, [catalog, assignments, roles, assigned, allTasks, registrations, source, classes]);
}
