import type { Notification } from "@/features/notifications/types";
import { projectFixtures } from "../fixtures/all-projects";
import type { ProjectFixture } from "../types";
import { assignmentHref } from "./class-model";
import { classFixtures } from "./fixtures/all";
import type { AssignmentChange, AssignmentSubmission, ClassFixture } from "./types";

function sentenceOf(change: AssignmentChange, title: string, project: string): string | null {
  if (change.by !== "mentor") return null;
  return change.status === "selesai"
    ? `Mentor menandai tugas “${title}” di ${project} selesai.`
    : `Mentor meminta perbaikan untuk tugas “${title}” di ${project}.`;
}

/**
 * Notifications that come from the assignments on this device (PRD 20): the mentor's decisions.
 * What the participant did herself or himself (handing in) is not announced. The mentor's own
 * notice that something was handed in belongs to the Mentor panel (6g).
 */
export function assignmentNotifications(
  submissions: AssignmentSubmission[],
  catalog: ProjectFixture[] = projectFixtures,
  classes: ClassFixture[] = classFixtures,
): Notification[] {
  const all = submissions.flatMap((work) => {
    const project = catalog.find((p) => p.slug === work.slug);
    const title = classes
      .find((c) => c.slug === work.slug)
      ?.modules.find((m) => m.assignment.id === work.assignmentId)?.assignment.title;
    if (!project || !title) return [];
    return work.statusLog.flatMap((change) => {
      const text = sentenceOf(change, title, project.title);
      if (!text) return [];
      return [
        {
          id: `tugas-${work.id}-${change.status}-${change.at}`,
          kind: "project" as const,
          actorId: null,
          others: 0,
          text,
          href: assignmentHref(work.slug, work.assignmentId),
          agoMs: 0,
          at: change.at,
        },
      ];
    });
  });
  return all.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
}
