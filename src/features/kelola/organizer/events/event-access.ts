import { isSelf } from "@/features/kelola/identity";
import type { WritingEvent } from "@/features/community/events/event-model";
import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";
import { ORGANIZER_HREF } from "../area-hrefs";

export const MANAGE_EVENTS_HREF = `${ORGANIZER_HREF}/event`;
export const NEW_EVENT_HREF = `${MANAGE_EVENTS_HREF}/baru`;
export const manageEventHref = (id: string) => `${MANAGE_EVENTS_HREF}/${encodeURIComponent(id)}`;

export function canManageEvent(
  roles: readonly ManagerRole[],
  event?: Pick<WritingEvent, "ownerId">,
) {
  // [usulan] Organizer owns its events; platform administrators can manage all events.
  return (
    isPlatformAdmin(roles) || (roles.includes("organizer") && (!event || isSelf(event.ownerId)))
  );
}
