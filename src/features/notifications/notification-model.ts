import type { Notification, NotificationTab } from "./types";

export type NotificationView = Notification & { read: boolean };

export const NOTIFICATION_TABS: { id: NotificationTab; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "komentar", label: "Komentar" },
  { id: "proyek", label: "Proyek" },
];

export function withReadState(
  list: readonly Notification[],
  readIds: ReadonlySet<string>,
): NotificationView[] {
  return list.map((n) => ({ ...n, read: n.seen === true || readIds.has(n.id) }));
}

export const unreadCount = (list: readonly NotificationView[]) =>
  list.filter((n) => !n.read).length;

export function inTab<T extends Notification>(list: readonly T[], tab: NotificationTab): T[] {
  if (tab === "komentar") return list.filter((n) => n.kind === "comment");
  if (tab === "proyek") return list.filter((n) => n.kind === "project");
  return [...list];
}
