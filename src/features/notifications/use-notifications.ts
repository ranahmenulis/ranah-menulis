"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostStore } from "@/features/community/storage/post-store";
import { postStore } from "@/features/community/storage/store";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
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
import { assignmentStore } from "@/features/projects/kelas/storage/store";
import { notifyAssignmentsChanged } from "@/features/projects/kelas/storage/assignment-events";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { submissionStore } from "@/features/projects/storage/store";
import { notifySubmissionsChanged } from "@/features/projects/storage/submission-events";
import { submissionNotifications } from "@/features/projects/submission-notifications";
import { useSubmissions } from "@/features/projects/use-submissions";
import { useViewer } from "@/lib/viewer";
import {
  newestFirst,
  type NotificationView,
  unreadCount,
  withReadState,
} from "./notification-model";
import { markRead, useReadIds } from "./read-state";
import { mayActivateNotification, verifyNotification } from "./notification-access";
import type { Notification } from "./types";
import { useCommunityNotifications } from "./use-community-notifications";
import { useStaffNotifications } from "./use-staff-notifications";

const NO_NOTIFICATIONS: readonly Notification[] = [];

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

/** Every surface uses this audience-filtered inbox. Each local source can load or fail independently. */
function useAllNotifications(
  store: SubmissionStore = submissionStore,
  tasks: AssignmentStore = assignmentStore,
  solo?: SoloStore,
  posts: PostStore = postStore,
) {
  const works = useSubmissions(store);
  const { status, submissions } = works;
  const assignments = useAssignments(tasks);
  const mentorTasks = useMentorTasks();
  const soloRows = useSoloRows(solo);
  const fixtures = useCatalog();
  const catalog = useProjects(fixtures);
  const classes = useClassFixtures();
  const registrations = useRegistrations();
  const overrides = useContestOverrides();
  const viewer = useViewer();
  const roles = useEffectiveRoles();
  const community = useCommunityNotifications(posts, roles);
  const staff = useStaffNotifications({
    roles,
    catalog: fixtures,
    projects: catalog,
    submissions: status === "ready" ? submissions : undefined,
    handIns: assignments.status === "ready" ? assignments.submissions : undefined,
    classes,
    tasks: mentorTasks,
    overrides,
  });
  const items = useMemo(
    () =>
      viewer === "tamu"
        ? NO_NOTIFICATIONS
        : [
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
            ...staff,
            ...community.items,
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
      staff,
      community.items,
      viewer,
    ],
  );
  const states = [works, assignments, soloRows, community];
  const loading = states.some((source) => source.status === "loading");
  const failed = states.some((source) => source.status === "error");
  const retry = () =>
    states.forEach((source) => {
      if (source.status === "error") source.reload();
    });
  const confirmOpen = (item: Notification) =>
    verifyNotification(
      item,
      {
        submissions: store,
        assignments: tasks,
        community: posts,
      },
      catalog.status === "ready" ? catalog.now : 0,
    );
  const refreshTarget = (item: Notification) => {
    const kind = item.target?.kind;
    if (kind === "editor" || kind === "juri") notifySubmissionsChanged();
    if (kind === "mentor") notifyAssignmentsChanged();
    if (kind === "pick") community.reload();
  };
  return { items, loading, failed, retry, confirmOpen, refreshTarget };
}

/**
 * Unread count only, for the bell in the top bar. Its audience and the inbox always match.
 */
export function useUnreadCount(
  store?: SubmissionStore,
  tasks?: AssignmentStore,
  solo?: SoloStore,
  posts?: PostStore,
): number {
  const readIds = useReadIds();
  const { items: all } = useAllNotifications(store, tasks, solo, posts);
  return useMemo(() => unreadCount(withReadState(all, readIds)), [all, readIds]);
}

export type NotificationsData = {
  items: NotificationView[];
  unread: number;
  /** When the list was opened; 0 until the first read in the browser. Times are measured from it. */
  now: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  loading: boolean;
  failed: boolean;
  retry: () => void;
  confirmOpen: (item: Notification) => Promise<boolean>;
  refreshTarget: (item: Notification) => void;
};

/** What the Notifikasi screen and the Beranda line read. Notifications plus this device's read state. */
export function useNotifications(
  store?: SubmissionStore,
  tasks?: AssignmentStore,
  solo?: SoloStore,
  posts?: PostStore,
): NotificationsData {
  const readIds = useReadIds();
  const { items: all, ...state } = useAllNotifications(store, tasks, solo, posts);
  const [now, setNow] = useState(0);

  // Reading the clock during render is refused by Next 16 prerender, so it happens after mount.
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(() => newestFirst(withReadState(all, readIds), now), [all, readIds, now]);

  return {
    ...state,
    items,
    unread: unreadCount(items),
    now,
    markRead: useCallback((id: string) => markRead([id]), []),
    markAllRead: useCallback(
      () => markRead(all.filter(mayActivateNotification).map((n) => n.id)),
      [all],
    ),
  };
}
