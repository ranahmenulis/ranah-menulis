/**
 * Which notifications a reader can turn off (PRD 20, PLT-04, PLT-11). Only events the PRD marks
 * "Dapat dimatikan" are here; everything else (verification, payments, submission decisions,
 * production stages, judging, moderation) is always sent and has no switch. Email itself waits for
 * the backend: this keeps the choice.
 */
export const NOTIFICATION_EVENTS = [
  "streak",
  "dailyTarget",
  "docTarget",
  "encouragement",
  "weeklyEmail",
  "appreciation",
  "comments",
  "follow",
  "editorPick",
  "event",
  "deadline",
  "revisionSent",
  "classTask",
  "mentorHandIn",
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export type EventPref = { app: boolean; email: boolean };
export type NotificationPrefs = Record<NotificationEvent, EventPref>;
export type NotificationPrefsPatch = Partial<Record<NotificationEvent, Partial<EventPref>>>;

export type NotificationGroup = "writing" | "community" | "projects";

/** Where each event can reach the reader; a channel the PRD does not give is never offered. */
export const EVENT_INFO: Record<
  NotificationEvent,
  { group: NotificationGroup; app: boolean; email: boolean }
> = {
  streak: { group: "writing", app: true, email: false },
  dailyTarget: { group: "writing", app: true, email: false },
  docTarget: { group: "writing", app: true, email: false },
  encouragement: { group: "writing", app: true, email: false },
  weeklyEmail: { group: "writing", app: false, email: true },
  appreciation: { group: "community", app: true, email: false },
  comments: { group: "community", app: true, email: true },
  follow: { group: "community", app: true, email: false },
  editorPick: { group: "community", app: true, email: true },
  event: { group: "community", app: true, email: false },
  deadline: { group: "projects", app: true, email: true },
  revisionSent: { group: "projects", app: true, email: true },
  classTask: { group: "projects", app: true, email: true },
  mentorHandIn: { group: "projects", app: true, email: false },
};

export const GROUPS: readonly NotificationGroup[] = ["writing", "community", "projects"];

export const eventsOf = (group: NotificationGroup) =>
  NOTIFICATION_EVENTS.filter((e) => EVENT_INFO[e].group === group);

/** Everything on: a reader who never opened the settings gets every notification. */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = Object.fromEntries(
  NOTIFICATION_EVENTS.map((e) => [e, { app: true, email: true }]),
) as NotificationPrefs;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Reads stored preferences field by field. Accounts saved before per-event choices had two email
 * switches: the comments switch becomes the comments email, the projects switch the email of the
 * three project events that send one.
 */
export function parseNotificationPrefs(
  stored: unknown,
  legacy: { emailComments?: unknown; emailProjects?: unknown } = {},
): NotificationPrefs {
  const source = isRecord(stored) ? stored : {};
  const legacyEmail: Partial<Record<NotificationEvent, unknown>> = {
    comments: legacy.emailComments,
    deadline: legacy.emailProjects,
    revisionSent: legacy.emailProjects,
    classTask: legacy.emailProjects,
  };
  return Object.fromEntries(
    NOTIFICATION_EVENTS.map((event) => {
      const one = isRecord(source[event]) ? source[event] : {};
      const old = legacyEmail[event];
      return [
        event,
        {
          app: typeof one.app === "boolean" ? one.app : true,
          email: typeof one.email === "boolean" ? one.email : typeof old === "boolean" ? old : true,
        },
      ];
    }),
  ) as NotificationPrefs;
}

export function mergeNotificationPrefs(
  current: NotificationPrefs,
  patch: NotificationPrefsPatch | undefined,
): NotificationPrefs {
  if (!patch) return current;
  return Object.fromEntries(
    NOTIFICATION_EVENTS.map((e) => [e, { ...current[e], ...patch[e] }]),
  ) as NotificationPrefs;
}

/** Whether a notification of this event reaches the reader in the app. Mandatory ones pass. */
export const allowsInApp = (prefs: NotificationPrefs, event: NotificationEvent | null) =>
  event === null || prefs[event].app;
