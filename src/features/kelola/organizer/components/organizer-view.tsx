"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useFormat } from "@/lib/i18n/use-format";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
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
import { countByList, matchesList } from "../list-model";
import { RoleBand } from "../../components/role-band";
import { organizerWork, type BandWork } from "../../role-band";
import { useOrganizerList, type OrganizerRow } from "../use-organizer-data";
import { listCardClass } from "../../components/list-card";

function ListSkeleton() {
  const t = useT().kelolaOrganizer;
  return (
    <div role="status" aria-label={t.list.loading} className="grid gap-3">
      <Skeleton className="h-8 w-2/3" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function ProjectRow({ row }: { row: OrganizerRow }) {
  const t = useT().kelolaOrganizer;
  const f = useFormat();
  const { project } = row;
  return (
    <li className="border-b border-line">
      <Link
        href={manageHref(project.slug)}
        className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 py-4 no-underline"
      >
        <span className="heading-sm wrap-anywhere group-hover:underline">{project.title}</span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
            row.status === "terbit"
              ? "bg-accent-subtle text-accent-ink"
              : "bg-subtle text-ink-soft",
          )}
        >
          {t.status[row.status]}
        </span>
        <span className="col-span-2 text-sm text-ink-muted">
          {format(t.list.row, {
            category: categoryLabel(project.category, f.locale),
            registrants: f.number(row.registrants),
            submissions: f.number(row.submissions),
          })}
          {!row.editable && t.list.sampleSuffix}
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
  const t = useT().kelolaOrganizer;
  const locale = useLocale();
  const f = useFormat();
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
  const work: BandWork =
    data.status === "ready" ? organizerWork(counts.aktif, locale) : { status: data.status };

  return (
    <section aria-labelledby="proyek-title" className="grid max-w-170 gap-5">
      <RoleBand
        area="organizer"
        title={t.list.title}
        titleId="proyek-title"
        description={t.list.description}
        work={work}
      />
      <div>
        <ButtonLink href={NEW_PROJECT_HREF}>{t.list.create}</ButtonLink>
      </div>

      {data.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>{t.list.loadError}</ErrorBanner>
      ) : data.status === "loading" ? (
        <ListSkeleton />
      ) : (
        <>
          <div role="group" aria-label={t.list.filterLabel} className="flex flex-wrap gap-2">
            {LIST_FILTERS.map((flt) => (
              <Chip key={flt.id} pressed={flt.id === filter} onClick={() => change(flt.id)}>
                {t.list.filters[flt.id]}{" "}
                <span className="ml-1.5 tabular-nums">{f.number(counts[flt.id])}</span>
              </Chip>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState
              action={
                filter !== "aktif" && counts.aktif > 0 ? (
                  <Button variant="text" onClick={() => change("aktif")}>
                    {t.list.showActive}
                  </Button>
                ) : undefined
              }
            >
              {t.list.empty[filter]}
            </EmptyState>
          ) : (
            <ul aria-label={t.list.listLabel} className={listCardClass}>
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
