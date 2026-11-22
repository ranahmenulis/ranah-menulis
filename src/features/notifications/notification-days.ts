import { notifications as copyId } from "./copy/id";
import type { NotificationView } from "./notification-model";

/**
 * Notifications grouped by when they happened (DESIGN.md 6.6): Hari ini, Kemarin, Minggu ini
 * (two to six days ago), Lebih lama. Days are local calendar days. The order inside a group and
 * between groups follows the list as given, so sorting stays where it is.
 */
export type DayGroup = { key: string; label: string; items: NotificationView[] };

type Bucket = keyof typeof copyId.days;

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const happenedAt = (item: Pick<NotificationView, "at" | "agoMs">, now: number) =>
  item.at ?? now - item.agoMs;

export function bucketOf(at: number, now: number): Bucket {
  // Round, so a day that is 23 or 25 hours long around a clock change still counts as one.
  const days = Math.round((startOfDay(now) - startOfDay(at)) / DAY);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return "week";
  return "older";
}

export function dayGroups(
  items: readonly NotificationView[],
  now: number,
  labels: Record<Bucket, string> = copyId.days,
): DayGroup[] {
  const groups = new Map<Bucket, DayGroup>();
  for (const item of items) {
    const bucket = bucketOf(happenedAt(item, now), now);
    const group = groups.get(bucket) ?? { key: bucket, label: labels[bucket], items: [] };
    group.items.push(item);
    groups.set(bucket, group);
  }
  return [...groups.values()];
}
