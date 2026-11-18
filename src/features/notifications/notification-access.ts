import { editorPicks } from "@/features/community/curation/picks-store";
import { writingGroups } from "@/features/community/groups/group-store";
import { readGroupReader } from "@/features/community/groups/group-viewer";
import { moderation, reports } from "@/features/community/moderation/report-store";
import type { PostStore } from "@/features/community/storage/post-store";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { judgingLog, juryScores } from "@/features/kelola/juri/score-store";
import { staffAssignments } from "@/features/kelola/staff-assignments";
import { readEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { classesFor } from "@/features/projects/kelas/class-source";
import { readMentorTasks } from "@/features/projects/kelas/mentor-task-store";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { readOverrides } from "@/features/projects/lomba/stage-store";
import { resolveProjects } from "@/features/projects/project-model";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { storedProjects } from "@/features/projects/stored-projects";
import { mergeCatalog } from "@/features/projects/use-catalog";
import { readViewerNow } from "@/lib/viewer";
import {
  pickNotification,
  readNotificationPost,
  reportNotifications,
  visibleFixtureNotifications,
} from "./community-notifications";
import { notificationFixtures } from "./fixtures";
import {
  editorNotifications,
  isStaffRecipient,
  juryNotifications,
  mentorNotifications,
} from "./staff-notifications";
import type { Notification } from "./types";

const fixtureIds = new Set(notificationFixtures.map((item) => item.id));
const currentCatalog = () => mergeCatalog(storedProjects.read());
const currentAudience = () => ({
  roles: readEffectiveRoles(),
  catalog: currentCatalog(),
  assigned: staffAssignments.read(),
});

function matching(items: readonly Notification[], opened: Notification) {
  return items.some((item) => item.id === opened.id && item.href === opened.href);
}

/** Check live permissions before any link gesture, including opening in a new tab. */
export function mayActivateNotification(item: Notification) {
  if (readViewerNow().viewer !== "masuk") return false;
  const target = item.target;
  if (!target) {
    return (
      !fixtureIds.has(item.id) ||
      matching(
        visibleFixtureNotifications(writingGroups.read(), readGroupReader(), moderation.read()),
        item,
      )
    );
  }
  if (target.kind === "report") {
    return matching(
      reportNotifications(reports.read(), moderation.read(), readEffectiveRoles()),
      item,
    );
  }
  if (target.kind === "pick") {
    return Boolean(
      readGroupReader() &&
      editorPicks.read().some((pick) => pick.postId === target.postId && pick.at === item.at),
    );
  }
  return isStaffRecipient(target.kind, target.slug, currentAudience());
}

type Stores = { community: PostStore; submissions: SubmissionStore; assignments: AssignmentStore };

/** Re-read asynchronous objects before normal navigation, then check their latest audience. */
export async function verifyNotification(item: Notification, stores: Stores, catalogTime: number) {
  const target = item.target;
  if (!target || target.kind === "report") return mayActivateNotification(item);
  if (target.kind === "pick") {
    const post = await readNotificationPost(stores.community, target.postId);
    const pick = editorPicks.read().find((p) => p.postId === target.postId);
    return Boolean(
      pick &&
      mayActivateNotification(item) &&
      matching(pickNotification(pick, post, moderation.read()), item),
    );
  }
  if (target.kind === "mentor") {
    const handIns = await stores.assignments.list();
    const audience = currentAudience();
    return matching(
      mentorNotifications(handIns, {
        ...audience,
        classes: classesFor(audience.catalog),
        tasks: readMentorTasks(),
      }),
      item,
    );
  }
  const submissions = await stores.submissions.list();
  const audience = currentAudience();
  const sources = { ...audience, audit: auditLog.read() };
  if (target.kind === "editor") return matching(editorNotifications(submissions, sources), item);
  const now = Date.now();
  return matching(
    juryNotifications(submissions, {
      ...sources,
      projects: resolveProjects(audience.catalog, catalogTime || now),
      overrides: readOverrides(),
      log: judgingLog.read(),
      scores: juryScores.read(),
      now,
    }),
    item,
  );
}
