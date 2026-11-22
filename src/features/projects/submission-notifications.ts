import type { Notification, NotificationMessage } from "@/features/notifications/types";
import { projectFixtures } from "./fixtures/all-projects";
import { formatProjectDate } from "./project-model";
import { submissionHref } from "./submission-href";
import type { StatusChange, Submission } from "./submission-types";
import type { ProjectFixture } from "./types";

function messageOf(
  change: StatusChange,
  work: Submission,
  project: ProjectFixture,
): NotificationMessage | null {
  const params = { title: work.title, project: project.title };
  switch (change.status) {
    case "terkirim":
      return { key: "subReceived", params };
    case "perlu-revisi":
      return change.dueAt
        ? {
            key: "subRevisionDue",
            params: {
              ...params,
              due: formatProjectDate(change.dueAt, project.timeZone),
              dueEn: formatProjectDate(change.dueAt, project.timeZone, "en"),
            },
          }
        : { key: "subRevision", params };
    case "diterima":
      return { key: "subAccepted", params };
    case "ditolak":
      return { key: "subRejected", params };
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
      const message = messageOf(change, work, project);
      if (!message) return [];
      return [
        {
          id: `sub-${work.id}-${change.status}-${change.at}`,
          kind: "project" as const,
          actorId: null,
          others: 0,
          message,
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
