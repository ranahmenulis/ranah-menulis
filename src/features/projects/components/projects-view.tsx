"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
  categoryLabel,
  filterProjects,
  parseFilters,
  toQuery,
} from "../project-model";
import { useProjects } from "../use-projects";
import type { Filters, ProjectFixture } from "../types";
import { CategoryBar, ProjectFilters } from "./project-filters";
import { ProjectRow } from "./project-row";
import { ProjectsSkeleton } from "./projects-states";

const fromSearch = (search: string) =>
  parseFilters(Object.fromEntries(new URLSearchParams(search)));

type Props = {
  /** Replaces the dummy catalog in tests. */
  source?: ProjectFixture[];
};

/**
 * Pusat Projects and the per-category lists (PRJ-01, PRD 17.5) as one page: category chips, then
 * status and fee filters. The filters live in the address (`?kategori=&status=&biaya=`) so a view
 * can be linked. "Proyek
 * unggulan" is Administrator curation and comes with the admin screens (6g).
 */
export function ProjectsView({ source }: Props) {
  const data = useProjects(source);

  // The address is the source of truth. Next keeps the previous page mounted (cacheComponents),
  // so when the address changes under us (nav entry, back link) the filters follow it instead of
  // showing a stale choice next to a different URL. Adjusting state during render is the React
  // way to derive state from a changing value.
  const search = useSearchParams()?.toString() ?? "";
  const [filters, setFilters] = useState(() => fromSearch(search));
  const [seen, setSeen] = useState(search);
  if (seen !== search) {
    setSeen(search);
    setFilters(fromSearch(search));
  }

  function change(next: Filters) {
    setFilters(next);
    window.history.replaceState(null, "", `${window.location.pathname}${toQuery(next)}`);
  }

  const list = useMemo(
    () => (data.status === "ready" ? filterProjects(data.projects, filters, data.now) : []),
    [data, filters],
  );

  if (data.status === "loading") return <ProjectsSkeleton />;

  const description = CATEGORIES.find((c) => c.id === filters.category)?.description;
  const narrowed = filters.state !== "semua" || filters.fee !== "semua";

  return (
    <div className="mx-auto max-w-260">
      <h1 className="text-[22px] leading-[30px] font-semibold md:text-[28px] md:leading-9">
        Projects
      </h1>

      <CategoryBar filters={filters} onChange={change} />
      <p className="mt-3 text-sm text-ink-muted md:mt-4">{description}</p>
      <ProjectFilters filters={filters} onChange={change} />

      {/* The empty state below already says it on screen; this line is for screen readers then. */}
      <p role="status" className={list.length === 0 ? "sr-only" : "mt-5 text-sm text-ink-muted"}>
        {list.length === 0 ? "Tidak ada proyek" : `${list.length} proyek`}
      </p>

      {list.length === 0 ? (
        <EmptyState
          action={
            narrowed ? (
              <Button
                variant="secondary"
                onClick={() => change({ ...filters, state: "semua", fee: "semua" })}
              >
                Hapus penyaring
              </Button>
            ) : filters.category !== "semua" ? (
              <Button variant="secondary" onClick={() => change(DEFAULT_FILTERS)}>
                Lihat semua Projects
              </Button>
            ) : undefined
          }
        >
          {narrowed
            ? "Tidak ada proyek yang cocok dengan penyaring ini."
            : filters.category !== "semua"
              ? `Belum ada proyek ${categoryLabel(filters.category)} yang dibuka.`
              : "Belum ada proyek yang dibuka."}
        </EmptyState>
      ) : (
        <div className="grid gap-x-10 lg:grid-cols-2">
          {list.map((project) => (
            <ProjectRow key={project.slug} project={project} now={data.now} />
          ))}
        </div>
      )}
    </div>
  );
}
