"use client";

import Link from "next/link";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { contestHref } from "../area-hrefs";
import { judgingText } from "../judge-model";
import { useJudgeContests } from "../use-judge-data";

/**
 * The contests the viewer judges (LMB-01), with how many works they have scored. Only contests
 * assigned to the viewer are listed.
 */
export function ContestsView({ store }: { store?: SubmissionStore }) {
  const data = useJudgeContests({ store });
  return (
    <section aria-labelledby="penilaian-title" className="grid max-w-170 gap-5">
      <div className="grid gap-1">
        <h1 id="penilaian-title" className="heading-lg">
          Penilaian
        </h1>
        <p className="text-sm text-ink-muted">Lomba yang ditugaskan kepadamu.</p>
      </div>
      {data.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Lomba belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      ) : data.status === "loading" ? (
        <div role="status" aria-label="Memuat lomba" className="grid gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState>Belum ada lomba yang ditugaskan kepadamu.</EmptyState>
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
                  {scored} dari {total} karya sudah kamu nilai
                </span>
                <span className="text-xs text-ink-muted">{judgingText[judging]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
