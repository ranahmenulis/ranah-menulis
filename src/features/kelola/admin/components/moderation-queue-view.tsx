"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { authorOf } from "@/features/community/post-model";
import type { PostStore } from "@/features/community/storage/post-store";
import {
  CASE_FILTERS,
  MODERATION_HREF,
  applyCaseFilter,
  caseHref,
  caseQuery,
  countCases,
  emptyText,
  excerpt,
  parseCaseFilter,
  reasonLabel,
  stateLabel,
  type CaseFilter,
  type CaseRow,
} from "../moderation/moderation-model";
import { useCaseList } from "../moderation/use-moderation-data";
import { sentAtText } from "@/features/projects/submission-text";

const NO_ROWS: CaseRow[] = [];

function QueueSkeleton() {
  return (
    <div role="status" aria-label="Memuat laporan" className="grid gap-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

/**
 * Moderation queue (PLT-06): one row per reported content, merged. The filter lives in the address;
 * it opens on "Baru". Reporters are never shown, only how many and for what reason.
 */
export function ModerationQueueView({ store }: { store?: PostStore }) {
  const list = useCaseList(store);
  const asked = useSearchParams()?.get("status") ?? null;
  const [filter, setFilter] = useState(() => parseCaseFilter(asked));
  const [seen, setSeen] = useState(asked);
  if (seen !== asked) {
    setSeen(asked);
    setFilter(parseCaseFilter(asked));
  }
  function change(next: CaseFilter) {
    setFilter(next);
    window.history.replaceState(null, "", `${MODERATION_HREF}${caseQuery(next)}`);
  }

  const rows = list.status === "ready" ? list.rows : NO_ROWS;
  const counts = useMemo(() => countCases(rows), [rows]);
  const shown = useMemo(() => applyCaseFilter(rows, filter), [rows, filter]);

  return (
    <section aria-labelledby="moderasi-title" className="grid gap-5">
      <div className="grid gap-1">
        <h1 id="moderasi-title" className="heading-lg">
          Moderasi
        </h1>
        <p className="text-sm text-ink-muted">
          Laporan atas tulisan dan komentar. Laporan ganda pada konten yang sama digabung, dan
          pelapor tidak terlihat.
        </p>
      </div>
      {list.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={list.reload} />}>
          Laporan belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      ) : list.status === "loading" ? (
        <QueueSkeleton />
      ) : (
        <>
          <div role="group" aria-label="Saring laporan" className="flex flex-wrap gap-2">
            {CASE_FILTERS.map((f) => (
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
                    Lihat semua laporan
                  </Button>
                ) : undefined
              }
            >
              {emptyText[filter]}
            </EmptyState>
          ) : (
            <ul aria-label="Kasus" className="border-t border-line">
              {shown.map((row) => {
                const content = list.contentOf(row);
                return (
                  <li key={`${row.kind}:${row.targetId}`} className="border-b border-line">
                    <Link
                      href={caseHref(row.kind, row.targetId)}
                      className="grid gap-0.5 py-3 no-underline hover:bg-subtle"
                    >
                      <span className="font-medium wrap-anywhere text-ink">
                        {row.kind === "post" ? "Tulisan" : "Komentar"}
                        {content ? ` · ${authorOf(content.authorId).name}` : ""}
                        {row.state !== "tampil" && (
                          <span className="font-normal text-ink-muted">
                            {" "}
                            · {stateLabel[row.state]}
                          </span>
                        )}
                      </span>
                      <span className="text-sm wrap-anywhere text-ink-muted">
                        {content ? excerpt(content.text) : "Konten tidak ditemukan"}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {row.reports} laporan · {reasonLabel[row.topReason]} ·{" "}
                        {sentAtText(row.since)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
