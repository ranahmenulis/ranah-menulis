"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { BackShell } from "../../components/back-shell";
import { JURI_HREF, contestHref, workHref } from "../area-hrefs";
import {
  JUDGE_FILTERS,
  applyJudgeFilter,
  countJudgeFilters,
  judgeEmptyText,
  judgeQuery,
  judgingText,
  parseJudgeFilter,
  scoreText,
  weightedScore,
  type JudgeFilter,
} from "../judge-model";
import { useJudgeContest } from "../use-judge-data";

const BACK = { href: JURI_HREF, label: "Penilaian" };

/** The works of one contest to score. The filter lives in the address and opens on "Belum dinilai". */
export function ContestWorksView({ slug, store }: { slug: string; store?: SubmissionStore }) {
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
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Karya belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label="Memuat karya" className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <BackShell back={BACK}>
        <h1 className="heading-lg">
          {data.status === "gone"
            ? "Lomba ini tidak ditemukan."
            : "Lomba ini tidak ditugaskan kepadamu."}
        </h1>
        <Notice>
          {data.status === "gone"
            ? "Alamatnya mungkin salah, atau proyeknya sudah diarsipkan."
            : "Kamu hanya menilai lomba yang ditugaskan kepadamu."}
        </Notice>
        <ButtonLink href={JURI_HREF} variant="secondary" className="justify-self-start">
          Kembali ke penilaian
        </ButtonLink>
      </BackShell>
    );
  }

  return (
    <BackShell back={BACK}>
      <header className="grid gap-1">
        <h1 className="heading-lg wrap-anywhere">{data.project.title}</h1>
        <p className="text-sm text-ink-muted">{judgingText[data.judging]}</p>
        {data.anonymous && (
          <p className="text-xs text-ink-muted">
            Lomba anonim: nama penulis tidak ditampilkan selama penilaian.
          </p>
        )}
      </header>
      <div role="group" aria-label="Saring karya" className="flex flex-wrap gap-2">
        {JUDGE_FILTERS.map((f) => (
          <Chip key={f.id} pressed={f.id === filter} onClick={() => change(f.id)}>
            {f.label} <span className="ml-1.5 tabular-nums">{counts[f.id]}</span>
          </Chip>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState
          action={
            filter !== "semua" && rows.length > 0 ? (
              <Button variant="text" onClick={() => change("semua")}>
                Lihat semua karya
              </Button>
            ) : undefined
          }
        >
          {judgeEmptyText[filter]}
        </EmptyState>
      ) : (
        <ul aria-label="Daftar karya" className="border-t border-line">
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
                    {row.genre} · {row.words.toLocaleString("id-ID")} kata ·{" "}
                    {mine === null ? "Belum kamu nilai" : `Skormu ${scoreText(mine)}`}
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
