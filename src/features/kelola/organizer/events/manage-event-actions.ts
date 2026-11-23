import type { Locale } from "@/lib/i18n/config";
import { withEvents, writeEvent } from "@/features/community/events/event-store";
import type { EventSettings, WritingEvent } from "@/features/community/events/event-model";
import { appendAudit } from "@/features/kelola/audit/audit-log";
import { ME_ID } from "@/features/kelola/identity";
import { readEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { eventsCopy } from "./copy";
import { canManageEvent } from "./event-access";
import { buildEvent, settingsBlock, type EventInput, type FormIssues } from "./event-input";

/** Why a save failed; `message` on the result is in the language the caller asked for. */
export type SaveEventCode =
  "unavailable" | "forbidden" | "stale" | "invalid" | "blocked" | "storage";

type Result =
  | { ok: true; id: string; revision: number }
  | { ok: false; code: SaveEventCode; message: string; errors?: FormIssues };

function commitEvent(
  settings: EventSettings,
  events: readonly WritingEvent[],
  existing: WritingEvent | undefined,
  now: number,
): Result {
  const event = {
    ...settings,
    id: existing?.id ?? crypto.randomUUID(),
    ownerId: existing?.ownerId ?? ME_ID,
    revision: (existing?.revision ?? 0) + 1,
    scheduleLocked: existing?.scheduleLocked ?? false,
    participants: existing?.participants ?? [],
  };
  appendAudit(
    [
      {
        actorId: ME_ID,
        action: existing ? "event.update" : "event.create",
        ref: `event:${event.id}`,
        label: event.title,
      },
    ],
    now,
  );
  writeEvent(events, event);
  return { ok: true, id: event.id, revision: event.revision };
}

export async function saveWritingEvent(
  input: EventInput,
  original?: { id: string; revision: number },
  clock = Date.now,
  locale: Locale = "id",
): Promise<Result> {
  const t = eventsCopy(locale).messages;
  try {
    return await withEvents((events) => {
      const existing = original ? events.find(({ id }) => id === original.id) : undefined;
      if (original && !existing) return { ok: false, code: "unavailable", message: t.unavailable };
      if (!canManageEvent(readEffectiveRoles(), existing)) {
        return { ok: false, code: "forbidden", message: t.forbidden };
      }
      if (original && original.revision !== existing?.revision) {
        return { ok: false, code: "stale", message: t.stale };
      }
      const build = buildEvent(input, locale);
      if (!build.ok)
        return { ok: false, code: "invalid", message: t.invalid, errors: build.errors };
      const now = clock();
      const blocked = settingsBlock(build.settings, existing, now, locale);
      if (blocked) return { ok: false, code: "blocked", message: blocked };
      return commitEvent(build.settings, events, existing, now);
    });
  } catch {
    return { ok: false, code: "storage", message: t.storage };
  }
}
