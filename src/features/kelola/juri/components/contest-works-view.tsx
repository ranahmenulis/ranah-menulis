"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { fill } from "@/features/studio/copy/fill";
import { useFormat } from "@/lib/i18n/use-format";
import { useT } from "@/lib/i18n/provider";
import { BackShell } from "../../components/back-shell";
import { JURI_HREF, contestHref, workHref } from "../area-hrefs";
import {
  JUDGE_FILTERS,
  applyJudgeFilter,
  countJudgeFilters,
  judgeQuery,
  judgingLabel,
  parseJudgeFilter,
  scoreText,
  weightedScore,
  type JudgeFilter,
} from "../judge-model";
import { useJudgeContest } from "../use-judge-data";

/** The works of one contest to score. The filter lives in the address and opens on "Belum dinilai". */
export function ContestWorksView({ slug, store }: { slug: string; store?: SubmissionStore }) {
  const copy = useT().kelolaJuri;
  const t = copy.works;
  const fmt = useFormat();
  const BACK = { href: JURI_HREF, label: t.back };
  const data = useJudgeContest(slug, { store });
  const search = useSearchParams()?.get("status") ?? null;
  const [filter, setFilter] = useState(() => parseJudgeFilter(search));
  const [seen, setSeen] = useState(search);
  if (seen !== search) {
    setSeen(search);
    setFilter(parseJudgeFilter(search));
  }
  function change(next: JudgeFilter) {
    setFilter(next);
    window.history.replaceState(null, "", `${contestHref(slug)}${judgeQuery(next)}`);
  }

  const rows = useMemo(() => (data.status === "ready" ? data.rows : []), [data]);
  const counts = useMemo(() => countJudgeFilters(rows), [rows]);
  const shown = useMemo(() => applyJudgeFilter(rows, filter), [rows, filter]);

  if (data.status === "error") {
    return (
      <BackShell back={BACK}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>{t.loadError}</ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label={t.loading} className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <BackShell back={BACK}>
        <h1 className="heading-lg">{data.status === "gone" ? t.goneTitle : t.blockedTitle}</h1>
        <Notice>{data.status === "gone" ? t.goneNotice : t.blockedNotice}</Notice>
        <ButtonLink href={JURI_HREF} variant="secondary" className="justify-self-start">
          {t.backToList}
        </ButtonLink>
      </BackShell>
    );
  }

  return (
    <BackShell back={BACK}>
      <header className="grid gap-1">
        <h1 className="heading-lg wrap-anywhere">{data.project.title}</h1>
        <p className="text-sm text-ink-muted">{judgingLabel(data.judging, fmt.locale)}</p>
        {data.anonymous && <p className="text-xs text-ink-muted">{t.anonymous}</p>}
      </header>
      <div role="group" aria-label={t.filterGroup} className="flex flex-wrap gap-2">
        {JUDGE_FILTERS.map((f) => (
          <Chip key={f.id} pressed={f.id === filter} onClick={() => change(f.id)}>
            {copy.filters[f.id]} <span className="ml-1.5 tabular-nums">{counts[f.id]}</span>
          </Chip>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState
          action={
            filter !== "semua" && rows.length > 0 ? (
              <Button variant="text" onClick={() => change("semua")}>
                {t.showAll}
              </Button>
            ) : undefined
          }
        >
          {copy.empty[filter]}
        </EmptyState>
      ) : (
        <ul aria-label={t.list} className="border-t border-line">
          {shown.map((row) => {
            const mine = row.mine ? weightedScore(data.criteria, row.mine.scores) : null;
            return (
              <li key={row.id} className="border-b border-line">
                <Link
                  href={workHref(slug, row.id)}
                  className="grid gap-1 py-4 no-underline hover:bg-subtle"
                >
                  <span className="heading-sm wrap-anywhere">
                    {row.label} · {row.title}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {fill(t.rowMeta, {
                      genre: row.genre,
                      words: fmt.number(row.words),
                      state:
                        mine === null
                          ? t.notScored
                          : fill(t.myScore, { score: scoreText(mine, fmt.locale) }),
                    })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </BackShell>
  );
}
