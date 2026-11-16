import { formatAgo } from "@/features/community/format-time";
import { authorOf } from "@/features/community/post-model";
import { ageOf } from "./notification-model";
import type { Notification } from "./types";

/** The bold start of a line: "Hafiz Rahman dan 11 orang lain"; null for events without an actor. */
export function leadOf(n: Notification): string | null {
  if (!n.actorId) return null;
  const name = authorOf(n.actorId).name;
  return n.others > 0 ? `${name} dan ${n.others} orang lain` : name;
}

/** "25 menit lalu", "2 jam lalu", "kemarin", "12 Nov". */
export function agoLabel(n: Notification, now: number): string {
  const label = formatAgo(now - ageOf(n, now), now);
  return /^\d+ (menit|jam|hari)$/.test(label) ? `${label} lalu` : label;
}
