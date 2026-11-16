import { DAY, endOfDay, projectHref, startOfDay } from "../project-model";
import type { Project, Registration } from "../types";
import type {
  AssignmentState,
  AssignmentSubmission,
  ClassAssignment,
  ClassContent,
  ClassFixture,
  ClassSession,
} from "./types";

const MINUTE = 60 * 1000;

/** The milestone that says when a class starts: the project fixtures already carry it. */
export const CLASS_START_LABEL = "Kelas dimulai";

export const dashboardHref = (slug: string) => `${projectHref(slug)}/dasbor`;
export const assignmentHref = (slug: string, assignmentId: string) =>
  `${projectHref(slug)}/tugas/${assignmentId}`;

/** "19.00" → minutes after midnight. */
function minutesOf(time: string): number {
  const [hours = 0, minutes = 0] = time.split(".").map(Number);
  return hours * 60 + minutes;
}

/**
 * Fixture days become absolute times in the project's zone. `null` when the project has no start
 * date, which a class cannot do without. Assignment deadlines land on the end of their day [usulan].
 */
export function resolveClass(fixture: ClassFixture, project: Project): ClassContent | null {
  const start = project.milestones.find((m) => m.label === CLASS_START_LABEL)?.at;
  if (start === undefined) return null;
  const zone = project.timeZone;
  const day0 = startOfDay(start, zone);
  return {
    slug: fixture.slug,
    startsAt: day0,
    sessions: fixture.sessions
      .map((s) => ({
        id: s.id,
        title: s.title,
        at: day0 + s.day * DAY + minutesOf(s.time) * MINUTE,
        minutes: s.minutes,
        link: s.link,
      }))
      .sort((a, b) => a.at - b.at),
    modules: fixture.modules.map((m) => ({
      title: m.title,
      materials: m.materials,
      assignment: {
        id: m.assignment.id,
        title: m.assignment.title,
        module: m.title,
        instructions: m.assignment.instructions,
        dueAt: endOfDay(day0 + m.assignment.dueDay * DAY, zone),
      },
    })),
  };
}

export const hasStarted = (content: ClassContent, now: number) => now >= content.startsAt;

/** Why the class dashboard cannot open for this reader; `null` means it can. */
export type DashboardBlock = "bukan-kelas" | "tamu" | "belum-terdaftar" | "menunggu-pembayaran";

export function dashboardBlock(input: {
  project: Project;
  guest: boolean;
  registration?: Registration;
}): DashboardBlock | null {
  const { project, guest, registration } = input;
  if (project.block.kind !== "kelas") return "bukan-kelas";
  if (guest) return "tamu";
  if (!registration) return "belum-terdaftar";
  if (registration.status !== "terdaftar") return "menunggu-pembayaran";
  return null;
}

/** A meeting is over once its time has run out; one that is going on is not. */
export const sessionOver = (session: ClassSession, now: number) =>
  session.at + session.minutes * MINUTE <= now;

/** The next meeting that has not ended yet, or `null` when all of them are behind. */
export function nextSession(content: ClassContent, now: number) {
  return content.sessions.find((s) => !sessionOver(s, now)) ?? null;
}

export type AssignmentRow = {
  assignment: ClassAssignment;
  submission: AssignmentSubmission | null;
  state: AssignmentState;
};

/**
 * Where each assignment stands for this reader. A late hand-in is still accepted [usulan, Q-27], so
 * "terlambat" only means: past the deadline and nothing handed in yet.
 */
export function assignmentRows(
  content: ClassContent,
  submissions: AssignmentSubmission[],
  now: number,
): AssignmentRow[] {
  return content.modules.map(({ assignment }) => {
    const submission =
      submissions.find((s) => s.slug === content.slug && s.assignmentId === assignment.id) ?? null;
    let state: AssignmentState;
    if (submission) state = submission.status;
    else if (!hasStarted(content, now)) state = "terkunci";
    else state = now > assignment.dueAt ? "terlambat" : "belum-dikumpulkan";
    return { assignment, submission, state };
  });
}

export type Progress = { done: number; total: number; percent: number };

/**
 * KLS-02: the share of materials marked done plus assignments the mentor marked Selesai. Ids that
 * no longer exist in the class (an old mark) do not count.
 */
export function classProgress(
  content: ClassContent,
  doneMaterials: ReadonlySet<string>,
  submissions: AssignmentSubmission[],
): Progress {
  const materialIds = content.modules.flatMap((m) => m.materials.map((x) => x.id));
  const finished = content.modules.filter(({ assignment }) =>
    submissions.some(
      (s) => s.slug === content.slug && s.assignmentId === assignment.id && s.status === "selesai",
    ),
  ).length;
  const total = materialIds.length + content.modules.length;
  const done = materialIds.filter((id) => doneMaterials.has(id)).length + finished;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Why an assignment cannot be handed in now; `null` means it can, late or not. */
export type AssignmentBlock = "belum-dimulai" | "tidak-ada";

export function handInBlock(
  content: ClassContent,
  assignmentId: string,
  now: number,
): AssignmentBlock | null {
  if (!content.modules.some((m) => m.assignment.id === assignmentId)) return "tidak-ada";
  return hasStarted(content, now) ? null : "belum-dimulai";
}
