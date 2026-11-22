import type { Locale } from "@/lib/i18n/config";
import { paymentDueAt, paymentState, payHref, remainingLabel } from "./payment-model";
import { revisionDueAt } from "./submission-status";
import type { Submission } from "./submission-types";
import type { Project, Registration, RegistrationMap } from "./types";

/** One project the reader joined, with the works sent to it (PRJ-04, PRD 17.5 "Proyek saya"). */
export type MyProject = {
  project: Project;
  registration: Registration;
  /** Newest first, withdrawn ones included so the history stays visible. */
  works: Submission[];
  /** Works an editor asked to revise, which need the reader's action. */
  needsRevision: Submission[];
  /** Last thing that happened here: registering, sending, or a change of status. */
  lastActivity: number;
};

const lastChange = (s: Submission) => s.statusLog.at(-1)?.at ?? s.submittedAt;

/**
 * Every registration of this reader, with its works. A registration with no work still shows (a
 * class, or a project not sent to yet), with the registration status instead of a submission
 * status. Projects that are not published or no longer exist are left out. What needs action comes
 * first, then the most recent activity.
 */
export function myProjects(
  projects: Project[],
  registrations: RegistrationMap,
  submissions: Submission[],
): MyProject[] {
  const rows: MyProject[] = [];
  for (const project of projects) {
    const registration = registrations[project.slug];
    if (!registration || project.publication !== "terbit") continue;
    const works = submissions
      .filter((s) => s.slug === project.slug)
      .sort((a, b) => b.submittedAt - a.submittedAt);
    rows.push({
      project,
      registration,
      works,
      needsRevision: works.filter((s) => s.status === "perlu-revisi"),
      lastActivity: Math.max(registration.registeredAt, ...works.map(lastChange)),
    });
  }
  return rows.sort(
    (a, b) =>
      Number(b.needsRevision.length > 0) - Number(a.needsRevision.length > 0) ||
      b.lastActivity - a.lastActivity,
  );
}

/** Works waiting for a revision, the earliest deadline first: Beranda's "Perlu perhatian". */
export function revisionItems(rows: MyProject[]): { project: Project; work: Submission }[] {
  return rows
    .flatMap((row) => row.needsRevision.map((work) => ({ project: row.project, work })))
    .sort(
      (a, b) =>
        (revisionDueAt(a.work) ?? Infinity) - (revisionDueAt(b.work) ?? Infinity) ||
        a.work.id.localeCompare(b.work.id),
    );
}

/** Payments still waiting, the one closest to losing its seat first: Beranda's "Perlu perhatian". */
export function paymentItems(
  rows: MyProject[],
  now: number,
  locale: Locale = "id",
): { project: Project; href: string; remaining: string }[] {
  return rows
    .filter((row) => paymentState(row.registration, now) === "menunggu")
    .sort((a, b) => paymentDueAt(a.registration) - paymentDueAt(b.registration))
    .map(({ project, registration }) => ({
      project,
      href: payHref(project.slug),
      remaining: remainingLabel(paymentDueAt(registration), now, locale),
    }));
}
