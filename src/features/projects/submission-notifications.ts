import type { Notification } from "@/features/notifications/types";
import { projectFixtures } from "./fixtures/all-projects";
import { formatProjectDate } from "./project-model";
import { submissionHref } from "./submission-href";
import type { StatusChange, Submission } from "./submission-types";
import type { ProjectFixture } from "./types";

function sentenceOf(
  change: StatusChange,
  work: Submission,
  project: ProjectFixture,
): string | null {
  const title = `“${work.title}”`;
  switch (change.status) {
    case "terkirim":
      return `Karyamu ${title} untuk ${project.title} sudah diterima sistem.`;
    case "perlu-revisi": {
      const due = change.dueAt
        ? ` Tenggat revisi ${formatProjectDate(change.dueAt, project.timeZone)}.`
        : "";
      return `Editor meminta revisi untuk ${title} di ${project.title}.${due}`;
    }
    case "diterima":
      return `Karyamu ${title} diterima di ${project.title}.`;
    case "ditolak":
      return `Karyamu ${title} tidak lolos di ${project.title}. Alasannya ada di detail kiriman.`;
    default:
      return null;
  }
}

/**
 * Notifications that come from the submissions on this device (PRD 20): the system received the
 * work, and the editor's feedback, Perlu Revisi, Diterima and Ditolak. What the participant did
 * herself or himself (revising, withdrawing) and the quiet steps in between are not announced.
 */
export function submissionNotifications(
  submissions: Submission[],
  catalog: ProjectFixture[] = projectFixtures,
): Notification[] {
  const all = submissions.flatMap((work) => {
    const project = catalog.find((p) => p.slug === work.slug);
    if (!project) return [];
    return work.statusLog.flatMap((change) => {
      const text = sentenceOf(change, work, project);
      if (!text) return [];
      return [
        {
          id: `sub-${work.id}-${change.status}-${change.at}`,
          kind: "project" as const,
          actorId: null,
          others: 0,
          text,
          href: submissionHref(work.slug, work.id),
          agoMs: 0,
          at: change.at,
        },
      ];
    });
  });
  // Newest first, so the order is right even before a clock is known to the screen.
  return all.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
}
