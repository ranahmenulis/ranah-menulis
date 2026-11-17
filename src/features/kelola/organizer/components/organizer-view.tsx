"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { categoryLabel } from "@/features/projects/project-model";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import {
  LIST_FILTERS,
  NEW_PROJECT_HREF,
  ORGANIZER_HREF,
  listQuery,
  manageHref,
  parseListFilter,
  type ListFilter,
} from "../area-hrefs";
import { countByList, listEmptyText, matchesList } from "../list-model";
import { statusLabel } from "../project-status";
import { useOrganizerList, type OrganizerRow } from "../use-organizer-data";

function ListSkeleton() {
  return (
    <div role="status" aria-label="Memuat proyek" className="grid gap-3">
      <Skeleton className="h-8 w-2/3" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function ProjectRow({ row }: { row: OrganizerRow }) {
  const { project } = row;
  return (
    <li className="border-b border-line">
      <Link
        href={manageHref(project.slug)}
        className="grid gap-1 py-4 no-underline hover:bg-subtle"
      >
        <span className="heading-sm wrap-anywhere">{project.title}</span>
        <span className="text-sm text-ink-muted">
          {categoryLabel(project.category)} · {statusLabel[row.status]} · {row.registrants} peserta
          di perangkat ini · {row.submissions} kiriman
          {!row.editable && " · Proyek contoh"}
        </span>
      </Link>
    </li>
  );
}

/**
 * The projects the viewer manages (PRJ-03). The filter lives in the address and opens on
 * "Aktif"; the one filled button is "Buat proyek".
 */
export function OrganizerView({ store }: { store?: SubmissionStore }) {
  const data = useOrganizerList({ store });
  const search = useSearchParams()?.get("status") ?? null;
  const [filter, setFilter] = useState(() => parseListFilter(search));
  const [seen, setSeen] = useState(search);
  if (seen !== search) {
    setSeen(search);
    setFilter(parseListFilter(search));
  }
  function change(next: ListFilter) {
    setFilter(next);
    window.history.replaceState(null, "", `${ORGANIZER_HREF}${listQuery(next)}`);
  }

  const rows = useMemo(() => (data.status === "ready" ? data.rows : []), [data]);
  const counts = useMemo(() => countByList(rows), [rows]);
  const shown = useMemo(() => rows.filter((r) => matchesList(r, filter)), [rows, filter]);

  return (
    <section aria-labelledby="proyek-title" className="grid max-w-170 gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 id="proyek-title" className="heading-lg">
            Proyek
          </h1>
          <p className="text-sm text-ink-muted">Proyek yang kamu kelola.</p>
        </div>
        <ButtonLink href={NEW_PROJECT_HREF}>Buat proyek</ButtonLink>
      </div>

      {data.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Proyek belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      ) : data.status === "loading" ? (
        <ListSkeleton />
      ) : (
        <>
          <div role="group" aria-label="Saring proyek" className="flex flex-wrap gap-2">
            {LIST_FILTERS.map((f) => (
              <Chip key={f.id} pressed={f.id === filter} onClick={() => change(f.id)}>
                {f.label} <span className="ml-1.5 tabular-nums">{counts[f.id]}</span>
              </Chip>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState
              action={
                filter !== "aktif" && counts.aktif > 0 ? (
                  <Button variant="text" onClick={() => change("aktif")}>
                    Lihat proyek aktif
                  </Button>
                ) : undefined
              }
            >
              {listEmptyText[filter]}
            </EmptyState>
          ) : (
            <ul aria-label="Daftar proyek" className="border-t border-line">
              {shown.map((row) => (
                <ProjectRow key={row.project.slug} row={row} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
