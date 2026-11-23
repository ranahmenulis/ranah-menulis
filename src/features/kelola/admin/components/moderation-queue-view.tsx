"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { authorOf } from "@/features/community/post-model";
import type { PostStore } from "@/features/community/storage/post-store";
import {
  caseFilters,
  MODERATION_HREF,
  applyCaseFilter,
  caseHref,
  caseQuery,
  countCases,
  excerpt,
  parseCaseFilter,
  reportReasonLabel,
  type CaseFilter,
  type CaseRow,
} from "../moderation/moderation-model";
import { useUrlFilter } from "../../use-url-filter";
import { useCaseList } from "../moderation/use-moderation-data";
import { sentAtText } from "@/features/projects/submission-text";

const NO_ROWS: CaseRow[] = [];

function QueueSkeleton() {
  const t = useT().kelolaModeration.queue;
  return (
    <div role="status" aria-label={t.loading} className="grid gap-3">
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
  const t = useT().kelolaModeration;
  const locale = useLocale();
  const list = useCaseList(store);
  const [filter, change] = useUrlFilter(
    "status",
    parseCaseFilter,
    (f: CaseFilter) => `${MODERATION_HREF}${caseQuery(f)}`,
  );

  const rows = list.status === "ready" ? list.rows : NO_ROWS;
  const counts = useMemo(() => countCases(rows), [rows]);
  const shown = useMemo(() => applyCaseFilter(rows, filter), [rows, filter]);

  return (
    <section aria-labelledby="moderasi-title" className="grid gap-5">
      <div className="grid gap-1">
        <h1 id="moderasi-title" className="heading-lg">
          {t.queue.title}
        </h1>
        <p className="text-sm text-ink-muted">{t.queue.intro}</p>
      </div>
      {list.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={list.reload} />}>
          {t.queue.loadError}
        </ErrorBanner>
      ) : list.status === "loading" ? (
        <QueueSkeleton />
      ) : (
        <>
          <div role="group" aria-label={t.queue.filterLabel} className="flex flex-wrap gap-2">
            {caseFilters(locale).map((f) => (
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
                    {t.queue.viewAll}
                  </Button>
                ) : undefined
              }
            >
              {t.empty[filter]}
            </EmptyState>
          ) : (
            <ul aria-label={t.queue.listLabel} className="border-t border-line">
              {shown.map((row) => {
                const content = list.contentOf(row);
                return (
                  <li key={`${row.kind}:${row.targetId}`} className="border-b border-line">
                    <Link
                      href={caseHref(row.kind, row.targetId)}
                      className="grid gap-0.5 py-3 no-underline hover:bg-subtle"
                    >
                      <span className="font-medium wrap-anywhere text-ink">
                        {row.kind === "post" ? t.queue.post : t.queue.comment}
                        {content ? ` · ${authorOf(content.authorId).name}` : ""}
                        {row.state !== "tampil" && (
                          <span className="font-normal text-ink-muted">
                            {" "}
                            · {t.states[row.state]}
                          </span>
                        )}
                      </span>
                      <span className="text-sm wrap-anywhere text-ink-muted">
                        {content ? excerpt(content.text) : t.queue.contentMissing}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {format(t.queue.summary, {
                          reports: String(row.reports),
                          reason: reportReasonLabel(row.topReason, locale),
                          when: sentAtText(row.since, locale),
                        })}
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
