"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { submissionStore } from "@/features/projects/storage/store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { useCatalog } from "@/features/projects/use-catalog";
import { useSubmissions } from "@/features/projects/use-submissions";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { useStaffAssignments } from "../../staff-assignments";
import { EDITOR_HREF } from "../area-hrefs";
import {
  QUEUE_FILTERS,
  applyFilter,
  countByFilter,
  emptyText,
  parseQueueFilter,
  queueQuery,
  queueRows,
  type QueueFilter,
} from "../queue-model";
import { QueueTable } from "./queue-table";

function QueueSkeleton() {
  return (
    <div role="status" aria-label="Memuat antrean" className="grid gap-3">
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
export function QueueView({ store = submissionStore }: { store?: SubmissionStore }) {
  const submissions = useSubmissions(store);
  const roles = useEffectiveRoles();
  const catalog = useCatalog();
  const assigned = useStaffAssignments();

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

  const all = useMemo(
    () => queueRows(submissions.submissions, roles, catalog, assigned),
    [submissions.submissions, roles, catalog, assigned],
  );
  const counts = useMemo(() => countByFilter(all), [all]);
  const shown = useMemo(() => applyFilter(all, filter), [all, filter]);
  const label = QUEUE_FILTERS.find((f) => f.id === filter)?.label ?? "";

  return (
    <section aria-labelledby="antrean-title" className="grid gap-5">
      <div className="grid gap-1">
        <h1 id="antrean-title" className="heading-lg">
          Antrean submission
        </h1>
        <p className="text-sm text-ink-muted">Karya yang ditugaskan kepadamu untuk ditinjau.</p>
      </div>

      {submissions.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={submissions.reload} />}>
          Antrean belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      ) : submissions.status === "loading" ? (
        <QueueSkeleton />
      ) : (
        <>
          <div role="group" aria-label="Saring antrean" className="flex flex-wrap gap-2">
            {QUEUE_FILTERS.map((f) => (
              <Chip key={f.id} pressed={f.id === filter} onClick={() => change(f.id)}>
                {f.label} <span className="ml-1.5 tabular-nums">{counts[f.id]}</span>
              </Chip>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState
              action={
                filter !== "semua" && all.length > 0 ? (
                  <Button variant="text" onClick={() => change("semua")}>
                    Lihat semua karya
                  </Button>
                ) : undefined
              }
            >
              {emptyText[filter]}
            </EmptyState>
          ) : (
            <QueueTable rows={shown} label={label} />
          )}
        </>
      )}
    </section>
  );
}
