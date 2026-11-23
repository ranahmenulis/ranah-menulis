"use client";

import Link from "next/link";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { RoleBand } from "../../components/role-band";
import { bandFrom, mentorWork } from "../../role-band";
import { pluralOf } from "../copy/mentor-copy";
import { classHref } from "../area-hrefs";
import { useMentorClasses } from "../use-mentor-data";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";

/**
 * The classes the viewer manages (KLS-03), with what needs a mentor first: how many hand-ins wait
 * for a decision. Only classes assigned to the viewer are listed.
 */
export function MentorClassesView({ store }: { store?: AssignmentStore }) {
  const t = useT().kelolaMentor.list;
  const locale = useLocale();
  const data = useMentorClasses({ store });
  const work = bandFrom(data, (d) => mentorWork(d.items, locale));
  return (
    <section aria-labelledby="kelas-title" className="grid max-w-170 gap-5">
      <RoleBand
        area="mentor"
        title={t.title}
        titleId="kelas-title"
        description={t.description}
        work={work}
      />
      {data.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>{t.loadError}</ErrorBanner>
      ) : data.status === "loading" ? (
        <div role="status" aria-label={t.loading} className="grid gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul className="border-t border-line">
          {data.items.map(({ project, started, participants, tasks, toGrade }) => (
            <li key={project.slug} className="border-b border-line">
              <Link
                href={classHref(project.slug)}
                className="grid gap-1 py-4 no-underline hover:bg-subtle"
              >
                <span className="heading-sm wrap-anywhere">{project.title}</span>
                <span className="text-sm text-ink-muted">
                  {started ? t.running : t.notStarted} ·{" "}
                  {format(pluralOf(t.participantsOne, t.participantsOther, participants, locale), {
                    n: String(participants),
                  })}{" "}
                  ·{" "}
                  {format(pluralOf(t.tasksOne, t.tasksOther, tasks, locale), { n: String(tasks) })}
                </span>
                <span className="text-sm">
                  {toGrade > 0 ? (
                    <b className="font-medium">{format(t.toGrade, { n: String(toGrade) })}</b>
                  ) : (
                    <span className="text-ink-muted">{t.noneToGrade}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
