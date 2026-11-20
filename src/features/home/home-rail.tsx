"use client";

import { CalendarBlank, PencilSimpleLine, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { CommunityLink } from "@/features/app-shell/community-link";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import { EVENTS_HREF } from "@/features/community/events/event-model";
import { GROUPS_HREF, type WritingGroup } from "@/features/community/groups/group-model";
import { GroupInvitations } from "@/features/community/groups/components/group-invitations";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { ProjectRows } from "./project-rows";
import { ProgressSection } from "./today-block";
import { Section } from "./today-row";

function RailLink({ href, icon, children }: { href: string; icon: ReactNode; children: string }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted no-underline hover:text-ink"
      >
        {icon}
        {children}
      </Link>
    </li>
  );
}

/**
 * The side column of Beranda (Medium's right column, contents after Novlr's Desk): everything
 * that is not the one thing to do now. Sections with nothing to say are not drawn. From xl it
 * stands beside the feed; below that it follows the feed.
 */
export function HomeRail({
  data,
  showProgress,
  showProjects,
  groups,
  reader,
  submissions,
}: {
  data: StreakData;
  /** False while the first steps already ask for a target. */
  showProgress: boolean;
  showProjects: boolean;
  groups: readonly WritingGroup[];
  reader: string | null;
  /** Replaces the device store in tests. */
  submissions?: SubmissionStore;
}) {
  return (
    <div className="grid content-start">
      {showProgress && <ProgressSection data={data} />}
      {showProjects && <ProjectRows store={submissions} />}
      <GroupInvitations groups={groups} reader={reader} variant="rail" />
      <Section title="Bersama penulis lain">
        <ul className="flex flex-wrap gap-x-6 gap-y-2.5 xl:grid">
          <RailLink href={EVENTS_HREF} icon={<CalendarBlank size={20} aria-hidden />}>
            Event
          </RailLink>
          <RailLink href={GROUPS_HREF} icon={<UsersThree size={20} aria-hidden />}>
            Grup Penulis
          </RailLink>
          <RailLink href={NEW_POST_HREF} icon={<PencilSimpleLine size={20} aria-hidden />}>
            Tulis postingan
          </RailLink>
          <li className="empty:hidden">
            <CommunityLink variant="plain" />
          </li>
        </ul>
      </Section>
    </div>
  );
}
