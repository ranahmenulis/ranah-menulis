/** In-app notifications (PRD section 20). Dummy data and a local read state for now. */

/** What happened. It decides the tab: comments go to "Komentar", project events to "Proyek". */
export type NotificationKind = "comment" | "reaction" | "follow" | "project" | "community";

export type NotificationTab = "semua" | "komentar" | "proyek";

export type NotificationTarget =
  | { kind: "editor" | "mentor" | "juri"; slug: string }
  | { kind: "report" }
  | { kind: "pick"; postId: string };

/** A key of `notifications.messages` in the dictionary and the values for its `{placeholders}`. */
export type NotificationMessage = { key: string; params?: Record<string, string> };

export type Notification = {
  id: string;
  kind: NotificationKind;
  /** Who did it; null for events about a project, which come from the platform. */
  actorId: string | null;
  /** People merged into this line besides the actor ("Hafiz dan 11 orang lain", PRD section 20). */
  others: number;
  /**
   * The sentence after the actor's name, ready-made. Producers that have not moved to `message` yet
   * still set this (Indonesian only); `textOf` prefers `message`.
   */
  text?: string;
  /** The sentence as a dictionary key plus values, so it follows the reader's language. */
  message?: NotificationMessage;
  /** The object it points to, when there is a destination the reader may open. */
  href: string | null;
  /** Local objects whose access must be checked again when the notification is opened. */
  target?: NotificationTarget;
  /** How long before the screen opened it happened. Resolved at read time, never at render. */
  agoMs: number;
  /**
   * When it happened, for events that come from stored data (submissions). Wins over `agoMs`; the
   * fixtures only know "how long ago".
   */
  at?: number;
  /** Already read before the reader ever opened the list. */
  seen?: boolean;
};
