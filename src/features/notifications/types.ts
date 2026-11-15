/** In-app notifications (PRD section 20). Dummy data and a local read state for now. */

/** What happened. It decides the tab: comments go to "Komentar", project events to "Proyek". */
export type NotificationKind = "comment" | "reaction" | "follow" | "project";

export type NotificationTab = "semua" | "komentar" | "proyek";

export type Notification = {
  id: string;
  kind: NotificationKind;
  /** Who did it; null for events about a project, which come from the platform. */
  actorId: string | null;
  /** People merged into this line besides the actor ("Hafiz dan 11 orang lain", PRD section 20). */
  others: number;
  /** The sentence after the actor's name. */
  text: string;
  /** The object it points to; null while that screen does not exist yet. */
  href: string | null;
  /** How long before the screen opened it happened. Resolved at read time, never at render. */
  agoMs: number;
  /** Already read before the reader ever opened the list. */
  seen?: boolean;
};
