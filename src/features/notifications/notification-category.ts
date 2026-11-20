import type { NotificationEvent } from "./preferences";
import type { Notification } from "./types";

/** [prefix of the id, the event it belongs to]. First match wins. */
const BY_ID: readonly [string, NotificationEvent][] = [
  ["editor-pick:", "editorPick"],
  ["staff-revision:", "revisionSent"],
  ["staff-mentor:", "mentorHandIn"],
  ["tugas-", "classTask"],
];

/**
 * The event a notification belongs to, so the reader's choice can switch it off; `null` for one
 * that is always sent (payments, submission decisions, production, judging, moderation, terms).
 * An unknown notification is never hidden: a wrong guess here would swallow something important.
 */
export function eventOf(n: Notification): NotificationEvent | null {
  if (n.kind === "comment") return "comments";
  if (n.kind === "reaction") return "appreciation";
  if (n.kind === "follow") return "follow";
  const hit = BY_ID.find(([prefix]) => n.id.startsWith(prefix));
  return hit ? hit[1] : null;
}
