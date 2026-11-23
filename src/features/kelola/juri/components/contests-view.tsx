"use client";

import Link from "next/link";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { fill } from "@/features/studio/copy/fill";
import { useT, useLocale } from "@/lib/i18n/provider";
import { RoleBand } from "../../components/role-band";
import { bandFrom, judgeWork } from "../../role-band";
import { contestHref } from "../area-hrefs";
import { judgingLabel } from "../judge-model";
import { useJudgeContests } from "../use-judge-data";

/**
 * The contests the viewer judges (LMB-01), with how many works they have scored. Only contests
 * assigned to the viewer are listed.
 */
export function ContestsView({ store }: { store?: SubmissionStore }) {
  const t = useT().kelolaJuri.contests;
  const locale = useLocale();
  const data = useJudgeContests({ store });
  const work = bandFrom(data, (d) => judgeWork(d.items, locale));
  return (
    <section aria-labelledby="penilaian-title" className="grid max-w-170 gap-5">
      <RoleBand
        area="juri"
        title={t.title}
        titleId="penilaian-title"
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
          {data.items.map(({ project, total, scored, judging }) => (
            <li key={project.slug} className="border-b border-line">
              <Link
                href={contestHref(project.slug)}
                className="grid gap-1 py-4 no-underline hover:bg-subtle"
              >
                <span className="heading-sm wrap-anywhere">{project.title}</span>
                <span className="text-sm text-ink-muted">
                  {fill(t.progress, { scored: String(scored), total: String(total) })}
                </span>
                <span className="text-xs text-ink-muted">{judgingLabel(judging, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
