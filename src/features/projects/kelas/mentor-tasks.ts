import { endOfDay } from "../project-model";
import type { TimeZoneName } from "../types";
import type { AssignmentSubmission, ClassContent } from "./types";

/**
 * An assignment a mentor wrote for a class (KLS-03), kept on this device until the backend exists.
 * The deadline is a calendar date: it lands on the end of that day in the project's zone, like every
 * other deadline here [usulan]. Tasks from the class curriculum (fixtures) are not `MentorTask`s.
 */
export type MentorTask = {
  id: string;
  slug: string;
  title: string;
  /** Paragraphs separated by a blank line. */
  instructions: string;
  /** "2026-11-30", the day it is due. */
  dueDate: string;
  createdAt: number;
};

export const TASK_TITLE_LIMIT = 120;
export const TASK_INSTRUCTIONS_LIMIT = 5000;

/** The module label every mentor-written task sits under on the participant's side. */
export const EXTRA_MODULE = "Tugas tambahan";

export type TaskInput = { title: string; instructions: string; dueDate: string };
export type TaskErrors = Partial<Record<keyof TaskInput, string>>;

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Noon UTC of the date is the same calendar day in WIB and MYT, so the zone helpers apply. */
function noonOf(date: string): number | null {
  const match = DATE.exec(date);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const stamp = Date.UTC(y, m - 1, d, 12);
  const check = new Date(stamp);
  const real =
    check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
  return real ? stamp : null;
}

export const dueAtOf = (dueDate: string, zone: TimeZoneName): number | null => {
  const noon = noonOf(dueDate);
  return noon === null ? null : endOfDay(noon, zone);
};

/**
 * One message per rule that fails, none dropped. A date already behind us is refused when it is new
 * or changed, because the task would be late the moment it appears; `current` is the saved date of a
 * task being edited, which may stay as it is.
 */
export function validateTask(
  input: TaskInput,
  context: { zone: TimeZoneName; now: number; current?: string },
): TaskErrors {
  const errors: TaskErrors = {};
  const title = input.title.trim();
  if (!title) errors.title = "Tulis judul tugas.";
  else if (title.length > TASK_TITLE_LIMIT) {
    errors.title = `Judul paling banyak ${TASK_TITLE_LIMIT} karakter.`;
  }
  const instructions = input.instructions.trim();
  if (!instructions) errors.instructions = "Tulis petunjuk untuk peserta.";
  else if (instructions.length > TASK_INSTRUCTIONS_LIMIT) {
    errors.instructions = `Petunjuk paling banyak ${TASK_INSTRUCTIONS_LIMIT.toLocaleString("id-ID")} karakter.`;
  }
  const due = dueAtOf(input.dueDate, context.zone);
  if (due === null) errors.dueDate = "Pilih tanggal tenggat.";
  else if (input.dueDate !== context.current && due < context.now) {
    errors.dueDate = "Tenggat tidak boleh di hari yang sudah lewat.";
  }
  return errors;
}

export const paragraphsOf = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * A task as one more module without materials, so progress, the hand-in screens and notifications
 * treat it like any curriculum assignment. `custom` keeps it out of the materials list.
 */
export function moduleOf(
  task: MentorTask,
  zone: TimeZoneName,
): ClassContent["modules"][number] | null {
  const dueAt = dueAtOf(task.dueDate, zone);
  if (dueAt === null) return null;
  return {
    title: EXTRA_MODULE,
    materials: [],
    custom: true,
    assignment: {
      id: task.id,
      title: task.title,
      module: EXTRA_MODULE,
      instructions: paragraphsOf(task.instructions),
      dueAt,
    },
  };
}

/** A task that already has hand-ins is kept: deleting it would orphan work and feedback. */
export const canDeleteTask = (task: MentorTask, submissions: readonly AssignmentSubmission[]) =>
  !submissions.some((s) => s.slug === task.slug && s.assignmentId === task.id);

export function newTask(input: TaskInput, slug: string, now: number): MentorTask {
  return {
    id: `mt-${crypto.randomUUID()}`,
    slug,
    title: input.title.trim(),
    instructions: input.instructions.trim(),
    dueDate: input.dueDate,
    createdAt: now,
  };
}
