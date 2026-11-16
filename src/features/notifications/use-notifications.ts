"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

/**
 * The fixtures plus the events of the submissions and class assignments on this device. A failed
 * or slow read of either just leaves its events out: notifications are a hint, and everything else
 * stays.
 */
function useAllNotifications(store?: SubmissionStore, tasks?: AssignmentStore): Notification[] {
  const { status, submissions } = useSubmissions(store);
  const assignments = useAssignments(tasks);
  return useMemo(
    () => [
      ...(status === "ready" ? submissionNotifications(submissions) : []),
      ...(assignments.status === "ready" ? assignmentNotifications(assignments.submissions) : []),
      ...notificationFixtures,
    ],
    [status, submissions, assignments.status, assignments.submissions],
  );
}

/**
 * Unread count only, for the bell in the top bar. It reads the submissions on this device too, so
 * their events count; nothing else is loaded.
 */
export function useUnreadCount(store?: SubmissionStore, tasks?: AssignmentStore): number {
  const readIds = useReadIds();
  const all = useAllNotifications(store, tasks);
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
): NotificationsData {
  const readIds = useReadIds();
  const all = useAllNotifications(store, tasks);
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
