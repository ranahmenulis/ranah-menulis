"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { canRead } from "@/features/community/feed";
import { writingGroups } from "@/features/community/groups/group-store";
import { useGroupReader } from "@/features/community/groups/group-viewer";
import { resolveFixturePosts } from "@/features/community/post-model";
import { contestNotifications } from "@/features/projects/lomba/contest-notifications";
import { useContestOverrides } from "@/features/projects/lomba/stage-store";
import { paymentNotifications } from "@/features/projects/payment-notifications";
import { useRegistrations } from "@/features/projects/registration-store";
import { activeSubmissions } from "@/features/projects/submission-model";
import { useCatalog } from "@/features/projects/use-catalog";
import { termsNotifications } from "@/features/projects/terms-notifications";
import { useClassFixtures } from "@/features/projects/kelas/class-source";
import { useProjects } from "@/features/projects/use-projects";
import { useSoloRows } from "@/features/projects/solo/hooks/use-solo-rows";
import { soloNotifications } from "@/features/projects/solo/solo-notifications";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import {
  assignmentNotifications,
  newTaskNotifications,
} from "@/features/projects/kelas/assignment-notifications";
import { useMentorTasks } from "@/features/projects/kelas/mentor-task-store";
import { useAssignments } from "@/features/projects/kelas/hooks/use-assignments";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { submissionNotifications } from "@/features/projects/submission-notifications";
import { useSubmissions } from "@/features/projects/use-submissions";
import { notificationFixtures } from "./fixtures";
import {
  newestFirst,
  type NotificationView,
  unreadCount,
  withReadState,
} from "./notification-model";
import { markRead, useReadIds } from "./read-state";
import type { Notification } from "./types";

const fixturePostsByHref = new Map(
  resolveFixturePosts(0).map((post) => [`/postingan/${post.id}`, post]),
);

/** The title of the reader's own work in each contest a panel made them a finalist of. */
function ownWorksOf(
  overrides: ReturnType<typeof useContestOverrides>,
  submissions: Parameters<typeof activeSubmissions>[0],
): Record<string, string> {
  const titles: Record<string, string> = {};
  for (const [slug, override] of Object.entries(overrides)) {
    const work = override.mine ? activeSubmissions(submissions, slug)[0] : undefined;
    if (work) titles[slug] = work.title;
  }
  return titles;
}

/**
 * The fixtures plus the events of the submissions and class assignments on this device. A failed
 * or slow read of either just leaves its events out: notifications are a hint, and everything else
 * stays.
 */
function useAllNotifications(
  store?: SubmissionStore,
  tasks?: AssignmentStore,
  solo?: SoloStore,
): Notification[] {
  const { status, submissions } = useSubmissions(store);
  const assignments = useAssignments(tasks);
  const mentorTasks = useMentorTasks();
  const soloRows = useSoloRows(solo);
  const catalog = useProjects();
  const fixtures = useCatalog();
  const classes = useClassFixtures();
  const registrations = useRegistrations();
  const overrides = useContestOverrides();
  const groups = writingGroups.use();
  const reader = useGroupReader();
  return useMemo(
    () => [
      ...(status === "ready" ? submissionNotifications(submissions, fixtures) : []),
      ...(assignments.status === "ready"
        ? assignmentNotifications(assignments.submissions, fixtures, classes, mentorTasks)
        : []),
      ...newTaskNotifications(mentorTasks, registrations, fixtures),
      ...(soloRows.status === "ready" ? soloNotifications(soloRows.rows, fixtures) : []),
      ...(catalog.status === "ready"
        ? contestNotifications({
            projects: catalog.projects,
            registrations,
            overrides,
            now: catalog.now,
            ownWorks: ownWorksOf(overrides, status === "ready" ? submissions : []),
          })
        : []),
      ...(catalog.status === "ready"
        ? paymentNotifications(catalog.projects, registrations, catalog.now)
        : []),
      ...(catalog.status === "ready"
        ? termsNotifications(catalog.projects, registrations, catalog.now)
        : []),
      ...notificationFixtures.filter(({ href }) => {
        const post = href ? fixturePostsByHref.get(href) : undefined;
        return !post || canRead(post, groups, reader);
      }),
    ],
    [
      status,
      submissions,
      assignments.status,
      assignments.submissions,
      soloRows.status,
      soloRows.rows,
      mentorTasks,
      catalog,
      fixtures,
      classes,
      registrations,
      overrides,
      groups,
      reader,
    ],
  );
}

/**
 * Unread count only, for the bell in the top bar. It reads the submissions on this device too, so
 * their events count; nothing else is loaded.
 */
export function useUnreadCount(
  store?: SubmissionStore,
  tasks?: AssignmentStore,
  solo?: SoloStore,
): number {
  const readIds = useReadIds();
  const all = useAllNotifications(store, tasks, solo);
  return useMemo(() => unreadCount(withReadState(all, readIds)), [all, readIds]);
}

export type NotificationsData = {
  items: NotificationView[];
  unread: number;
  /** When the list was opened; 0 until the first read in the browser. Times are measured from it. */
  now: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

/** What the Notifikasi screen and the Beranda line read. Notifications plus this device's read state. */
export function useNotifications(
  store?: SubmissionStore,
  tasks?: AssignmentStore,
  solo?: SoloStore,
): NotificationsData {
  const readIds = useReadIds();
  const all = useAllNotifications(store, tasks, solo);
  const [now, setNow] = useState(0);

  // Reading the clock during render is refused by Next 16 prerender, so it happens after mount.
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(() => newestFirst(withReadState(all, readIds), now), [all, readIds, now]);

  return {
    items,
    unread: unreadCount(items),
    now,
    markRead: useCallback((id: string) => markRead([id]), []),
    markAllRead: useCallback(() => markRead(all.map((n) => n.id)), [all]),
  };
}
