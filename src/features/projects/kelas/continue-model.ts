import { liveRegistrations } from "../payment-model";
import type { Project, RegistrationMap } from "../types";
import {
  assignmentHref,
  assignmentRows,
  classProgress,
  dashboardHref,
  hasStarted,
  resolveClass,
  type AssignmentRow,
  type Progress,
} from "./class-model";
import type { MentorTask } from "./mentor-tasks";
import type { AssignmentSubmission, ClassContent, ClassFixture } from "./types";

/** KLS-05: where "Lanjutkan" leads. `dasbor` means nothing is left to do except wait for the mentor. */
export type ContinueTarget = {
  kind: "materi" | "tugas" | "dasbor";
  /** Title of the material or assignment; empty for `dasbor`. */
  title: string;
  href: string;
};

export const materialAnchor = (materialId: string) => `materi-${materialId}`;
export const materialHref = (slug: string, materialId: string) =>
  `${dashboardHref(slug)}#${materialAnchor(materialId)}`;

/** An assignment the participant still has to act on; handed in or finished ones are not. */
const NEEDS_ACTION = new Set<AssignmentRow["state"]>([
  "belum-dikumpulkan",
  "terlambat",
  "perlu-perbaikan",
]);

/**
 * The first thing left, in the order of the curriculum: the unmarked materials of a module, then
 * its assignment when it needs the participant, then the next module. Tasks a mentor added come
 * last because they are modules with no materials.
 */
export function continueTarget(
  content: ClassContent,
  done: ReadonlySet<string>,
  rows: AssignmentRow[],
): ContinueTarget {
  for (const unit of content.modules) {
    const material = unit.materials.find((m) => !done.has(m.id));
    if (material) {
      return {
        kind: "materi",
        title: material.title,
        href: materialHref(content.slug, material.id),
      };
    }
    const row = rows.find((r) => r.assignment.id === unit.assignment.id);
    if (row && NEEDS_ACTION.has(row.state)) {
      return {
        kind: "tugas",
        title: row.assignment.title,
        href: assignmentHref(content.slug, row.assignment.id),
      };
    }
  }
  return { kind: "dasbor", title: "", href: dashboardHref(content.slug) };
}

export type RunningClass = {
  project: Project;
  progress: Progress;
  next: ContinueTarget;
};

type RunningInput = {
  projects: readonly Project[];
  /** Registrations as stored; expired payment holds are dropped here. */
  registrations: RegistrationMap;
  classes: readonly ClassFixture[];
  tasks: readonly MentorTask[];
  submissions: readonly AssignmentSubmission[];
  marks: Readonly<Record<string, readonly string[]>>;
  now: number;
};

/**
 * Classes the participant is in right now: registered and paid, started, and not finished (KLS-05).
 * One that has not started, one waiting for payment and one at 100% are left out, so the section
 * disappears when there is nothing to continue. Classes with a task waiting come first.
 */
export function runningClasses(input: RunningInput): RunningClass[] {
  const { projects, classes, tasks, submissions, marks, now } = input;
  const registrations = liveRegistrations(input.registrations, now);
  const rows: { item: RunningClass; due: number }[] = [];
  for (const project of projects) {
    if (project.publication !== "terbit" || project.block.kind !== "kelas") continue;
    if (registrations[project.slug]?.status !== "terdaftar") continue;
    const fixture = classes.find((c) => c.slug === project.slug);
    const content = fixture ? resolveClass(fixture, project, tasks) : null;
    if (!content || !hasStarted(content, now)) continue;
    const mine = submissions.filter((s) => s.slug === project.slug);
    const done = new Set(marks[project.slug] ?? []);
    const progress = classProgress(content, done, mine);
    if (progress.total === 0 || progress.done >= progress.total) continue;
    const assignments = assignmentRows(content, mine, now);
    const next = continueTarget(content, done, assignments);
    const due =
      next.kind === "tugas"
        ? (assignments.find((r) => r.assignment.title === next.title)?.assignment.dueAt ?? Infinity)
        : Infinity;
    rows.push({ item: { project, progress, next }, due });
  }
  return rows
    .sort((a, b) => a.due - b.due || a.item.project.title.localeCompare(b.item.project.title))
    .map((r) => r.item);
}
