import { withEvents, writeEvent } from "@/features/community/events/event-store";
import type { EventSettings, WritingEvent } from "@/features/community/events/event-model";
import { appendAudit } from "@/features/kelola/audit/audit-log";
import { ME_ID } from "@/features/kelola/identity";
import { readEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { canManageEvent } from "./event-access";
import { buildEvent, settingsBlock, type EventInput, type FormIssues } from "./event-input";

type Result =
  { ok: true; id: string; revision: number } | { ok: false; message: string; errors?: FormIssues };

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
): Promise<Result> {
  try {
    return await withEvents((events) => {
      const existing = original ? events.find(({ id }) => id === original.id) : undefined;
      if (original && !existing) return { ok: false, message: "Event tidak tersedia." };
      if (!canManageEvent(readEffectiveRoles(), existing)) {
        return { ok: false, message: "Kamu tidak punya akses untuk mengubah event ini." };
      }
      if (original && original.revision !== existing?.revision) {
        return {
          ok: false,
          message: "Pengaturan event sudah berubah. Muat pengaturan terbaru sebelum menyimpan.",
        };
      }
      const build = buildEvent(input);
      if (!build.ok)
        return { ok: false, message: "Periksa isian yang ditandai.", errors: build.errors };
      const now = clock();
      const blocked = settingsBlock(build.settings, existing, now);
      if (blocked) return { ok: false, message: blocked };
      return commitEvent(build.settings, events, existing, now);
    });
  } catch {
    return { ok: false, message: "Event belum tersimpan di perangkat ini. Coba lagi." };
  }
}
