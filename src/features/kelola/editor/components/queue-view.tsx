"use client";

import { tableCardClass } from "../../components/list-card";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useLocale, useT } from "@/lib/i18n/provider";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { RoleBand } from "../../components/role-band";
import { editorWork, type BandWork } from "../../role-band";
import { EDITOR_HREF } from "../area-hrefs";
import {
  QUEUE_FILTERS,
  applyFilter,
  parseQueueFilter,
  queueQuery,
  type QueueFilter,
} from "../queue-model";
import { useEditorQueue } from "../use-editor-queue";
import { QueueTable } from "./queue-table";

function QueueSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-3">
      <Skeleton className="h-8 w-2/3" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}

/**
 * The Editor's queue (PRJ-04): work sent to the projects assigned to the viewer, by status. The
 * filter lives in the address so a view can be linked; it opens on "Perlu tindakan". Reads the
 * submissions kept on this device (sliced with dummy data), so it also lists the dummy user's own.
 */
export function QueueView({ store }: { store?: SubmissionStore }) {
  const t = useT().kelolaEditor.queue;
  const locale = useLocale();
  const { submissions, all, counts } = useEditorQueue(store);

  // The address is the source of truth (see ProjectsView): Next keeps the previous page mounted.
  const search = useSearchParams()?.get("status") ?? null;
  const [filter, setFilter] = useState(() => parseQueueFilter(search));
  const [seen, setSeen] = useState(search);
  if (seen !== search) {
    setSeen(search);
    setFilter(parseQueueFilter(search));
  }
  function change(next: QueueFilter) {
    setFilter(next);
    window.history.replaceState(null, "", `${EDITOR_HREF}${queueQuery(next)}`);
  }

  const shown = useMemo(() => applyFilter(all, filter), [all, filter]);
  const label = t.filters[filter];
  const work: BandWork =
    submissions.status === "ready" ? editorWork(counts, locale) : { status: submissions.status };

  return (
    <section aria-labelledby="antrean-title" className="grid gap-5">
      <RoleBand
        area="editor"
        title={t.title}
        titleId="antrean-title"
        description={t.description}
        work={work}
      />

      {submissions.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={submissions.reload} />}>
          {t.loadError}
        </ErrorBanner>
      ) : submissions.status === "loading" ? (
        <QueueSkeleton label={t.loading} />
      ) : (
        <>
          <div role="group" aria-label={t.filterGroup} className="flex flex-wrap gap-2">
            {QUEUE_FILTERS.map((f) => (
              <Chip key={f.id} pressed={f.id === filter} onClick={() => change(f.id)}>
                {t.filters[f.id]} <span className="ml-1.5 tabular-nums">{counts[f.id]}</span>
              </Chip>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState
              action={
                filter !== "semua" && all.length > 0 ? (
                  <Button variant="text" onClick={() => change("semua")}>
                    {t.seeAll}
                  </Button>
                ) : undefined
              }
            >
              {t.empty[filter]}
            </EmptyState>
          ) : (
            <div className={tableCardClass}>
              <QueueTable rows={shown} label={label} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
