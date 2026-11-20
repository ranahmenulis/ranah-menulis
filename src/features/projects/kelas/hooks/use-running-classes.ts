"use client";

import { useMemo } from "react";
import { useViewer } from "@/lib/viewer";
import { useRegistrations } from "../../registration-store";
import type { ProjectFixture } from "../../types";
import { useProjects } from "../../use-projects";
import { runningClasses, type RunningClass } from "../continue-model";
import { useClassFixtures } from "../class-source";
import { useDoneMarks } from "../material-progress";
import { useMentorTasks } from "../mentor-task-store";
import type { AssignmentStore } from "../storage/assignment-store";
import type { ClassFixture } from "../types";
import { useAssignments } from "./use-assignments";

export type RunningClassesData =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  | { status: "ready"; rows: RunningClass[] };

type Sources = { source?: ProjectFixture[]; store?: AssignmentStore; classes?: ClassFixture[] };

/**
 * The classes this reader can continue (KLS-05), from one read of the catalog, registrations,
 * hand-ins and marks. A guest has none. A failed read of the hand-ins is an error, never an empty
 * list, because the next step depends on what was handed in.
 */
export function useRunningClasses(sources: Sources = {}): RunningClassesData {
  const { source, store, classes: overrideClasses } = sources;
  const defaultClasses = useClassFixtures();
  const classes = overrideClasses ?? defaultClasses;
  const catalog = useProjects(source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const assignments = useAssignments(store);
  const marks = useDoneMarks();
  const tasks = useMentorTasks();

  return useMemo<RunningClassesData>(() => {
    if (assignments.status === "error") return { status: "error", reload: assignments.reload };
    if (catalog.status === "loading" || assignments.status === "loading") {
      return { status: "loading" };
    }
    if (guest) return { status: "ready", rows: [] };
    return {
      status: "ready",
      rows: runningClasses({
        projects: catalog.projects,
        registrations,
        classes,
        tasks,
        submissions: assignments.submissions,
        marks,
        now: catalog.now,
      }),
    };
  }, [catalog, guest, registrations, assignments, marks, classes, tasks]);
}
