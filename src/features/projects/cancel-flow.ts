import type { SubmissionStore } from "./storage/submission-store";
import type { AssignmentStore } from "./kelas/storage/assignment-store";
import { cancelBlock, type CancelBlock } from "./cancel-model";
import { contestStage } from "./lomba/contest-model";
import { readOverrides } from "./lomba/stage-store";
import { cancelRegistration, readRegistrations } from "./registration-store";
import { activeSubmissions } from "./submission-model";
import type { Project } from "./types";

export type CancelResult =
  { kind: "cancelled" } | { kind: "blocked"; block: CancelBlock } | { kind: "failed" };

/**
 * Cancels the reader's registration (PRJ-06). Everything is read again at the click: the
 * registration, sent works, handed-in tasks, and the contest stage. A reader who still has works in
 * review is told to withdraw them first; nothing is withdrawn on their behalf.
 */
export async function cancelOwnRegistration(input: {
  project: Project;
  submissions: Pick<SubmissionStore, "list">;
  assignments: Pick<AssignmentStore, "list">;
  now?: number;
}): Promise<CancelResult> {
  const { project, submissions, assignments } = input;
  const now = input.now ?? Date.now();
  try {
    const sent = activeSubmissions(await submissions.list(), project.slug);
    const tasks = (await assignments.list()).filter((a) => a.slug === project.slug);
    const block = cancelBlock({
      project,
      registration: readRegistrations()[project.slug],
      sentCount: sent.length,
      handedIn: tasks.length,
      contestStage: contestStage(project, now, readOverrides()[project.slug]?.stage),
    });
    if (block) return { kind: "blocked", block };
    if (!cancelRegistration(project.slug, now)) return { kind: "blocked", block: "tidak-ada" };
    return { kind: "cancelled" };
  } catch {
    return { kind: "failed" };
  }
}
