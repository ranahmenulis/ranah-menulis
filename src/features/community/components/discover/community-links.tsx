"use client";

import { CalendarBlank, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { EVENTS_HREF } from "../../events/event-model";
import { GroupInvitations } from "../../groups/components/group-invitations";
import { GROUPS_HREF } from "../../groups/group-model";
import { writingGroups } from "../../groups/group-store";
import { useGroupReader } from "../../groups/group-viewer";

const linkClass =
  "inline-flex items-center gap-2 text-sm font-medium text-ink-muted no-underline hover:text-ink";

/**
 * Entry points to the people side of Community: group invitations (only when there are any), then
 * links to Event and Grup Penulis. They moved here from Beranda (client, 22 November 2026).
 */
export function CommunityLinks() {
  const groups = writingGroups.use();
  const reader = useGroupReader();
  return (
    <div className="mt-3 md:mt-4">
      <nav aria-label="Bersama penulis lain">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href={EVENTS_HREF} className={linkClass}>
              <CalendarBlank size={20} aria-hidden />
              Event
            </Link>
          </li>
          <li>
            <Link href={GROUPS_HREF} className={linkClass}>
              <UsersThree size={20} aria-hidden />
              Grup Penulis
            </Link>
          </li>
        </ul>
      </nav>
      <GroupInvitations groups={groups} reader={reader} />
    </div>
  );
}
