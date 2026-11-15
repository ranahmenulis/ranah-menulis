"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationFixtures } from "./fixtures";
import { type NotificationView, unreadCount, withReadState } from "./notification-model";
import { markRead, useReadIds } from "./read-state";

/** Unread count only, for the bell in the top bar. Does not load anything else. */
export function useUnreadCount(): number {
  const readIds = useReadIds();
  return useMemo(() => unreadCount(withReadState(notificationFixtures, readIds)), [readIds]);
}

export type NotificationsData = {
  items: NotificationView[];
  unread: number;
  /** When the list was opened; 0 until the first read in the browser. Times are measured from it. */
  now: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

/** What the Notifikasi screen and the Beranda line read. Fixtures plus this device's read state. */
export function useNotifications(): NotificationsData {
  const readIds = useReadIds();
  const [now, setNow] = useState(0);

  // Reading the clock during render is refused by Next 16 prerender, so it happens after mount.
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(() => withReadState(notificationFixtures, readIds), [readIds]);

  return {
    items,
    unread: unreadCount(items),
    now,
    markRead: useCallback((id: string) => markRead([id]), []),
    markAllRead: useCallback(() => markRead(notificationFixtures.map((n) => n.id)), []),
  };
}
