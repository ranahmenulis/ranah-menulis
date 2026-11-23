"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/provider";
import { CommunityLink } from "@/features/app-shell/community-link";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
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
  submissions,
  assignments,
}: {
  data: StreakData;
  /** False while the first steps already ask for a target. */
  showProgress: boolean;
  showProjects: boolean;
  /** Replaces the device store in tests. */
  submissions?: SubmissionStore;
  /** Replaces the class hand-in store in tests. */
  assignments?: AssignmentStore;
}) {
  const t = useT().home.rail;
  return (
    <div className="grid content-start gap-4">
      {showProgress && <ProgressSection data={data} />}
      {showProjects && <ProjectRows store={submissions} assignments={assignments} />}
      <Section title={t.together}>
        <ul className="flex flex-wrap gap-x-6 gap-y-2.5 xl:grid">
          <RailLink href={NEW_POST_HREF} icon={<PencilSimpleLine size={20} aria-hidden />}>
            {t.writePost}
          </RailLink>
          <li className="empty:hidden">
            <CommunityLink variant="plain" />
          </li>
        </ul>
      </Section>
    </div>
  );
}
