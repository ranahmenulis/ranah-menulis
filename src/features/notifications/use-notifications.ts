"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { contestNotifications } from "@/features/projects/lomba/contest-notifications";
import { useContestOverrides } from "@/features/projects/lomba/stage-store";
import { paymentNotifications } from "@/features/projects/payment-notifications";
import { useRegistrations } from "@/features/projects/registration-store";
import { activeSubmissions } from "@/features/projects/submission-model";
import { useProjects } from "@/features/projects/use-projects";
import { useSoloRows } from "@/features/projects/solo/hooks/use-solo-rows";
import { soloNotifications } from "@/features/projects/solo/solo-notifications";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import { assignmentNotifications } from "@/features/projects/kelas/assignment-notifications";
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
  const soloRows = useSoloRows(solo);
  const catalog = useProjects();
  const registrations = useRegistrations();
  const overrides = useContestOverrides();
  return useMemo(
    () => [
      ...(status === "ready" ? submissionNotifications(submissions) : []),
      ...(assignments.status === "ready" ? assignmentNotifications(assignments.submissions) : []),
      ...(soloRows.status === "ready" ? soloNotifications(soloRows.rows) : []),
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
      ...notificationFixtures,
    ],
    [
      status,
      submissions,
      assignments.status,
      assignments.submissions,
      soloRows.status,
      soloRows.rows,
      catalog,
      registrations,
      overrides,
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
