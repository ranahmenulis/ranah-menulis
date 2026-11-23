"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { EmptyState } from "@/components/ui/states";
import {
  DEFAULT_FILTERS,
  categoryLabel,
  filterProjects,
  parseFilters,
  toQuery,
} from "../project-model";
import { useProjects } from "../use-projects";
import type { Filters, ProjectFixture } from "../types";
import { CatalogHero } from "./catalog-hero";
import { CategoryBar } from "./project-filters";
import { narrowedBy, useFeaturedSplit } from "../hooks/use-featured-split";
import { FeaturedBlock } from "./featured-block";
import { ProjectTile } from "./project-tile";
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
 * can be linked. "Unggulan" (PRD 17.5, marked on the Admin curation screen) leads the page, only
 * while no filter narrows it.
 */
export function ProjectsView({ source }: Props) {
  const t = useT().projectsCatalog;
  const locale = useLocale();
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

  const { featured, rest } = useFeaturedSplit(list, filters);

  if (data.status === "loading") return <ProjectsSkeleton />;

  const description = t.categories[filters.category].description;
  const narrowed = narrowedBy(filters);

  return (
    <div className="mx-auto max-w-260">
      <CatalogHero
        projects={data.projects}
        now={data.now}
        filters={filters}
        description={description}
        onChange={change}
      />
      <CategoryBar filters={filters} onChange={change} />

      {/* The empty state below already says it on screen; this line is for screen readers then. */}
      <p role="status" className={list.length === 0 ? "sr-only" : "mt-5 text-sm text-ink-muted"}>
        {list.length === 0 ? t.view.none : format(t.view.count, { n: String(list.length) })}
      </p>

      {list.length === 0 ? (
        <EmptyState
          action={
            narrowed ? (
              <Button
                variant="secondary"
                onClick={() => change({ ...filters, state: "semua", fee: "semua" })}
              >
                {t.view.clearFilters}
              </Button>
            ) : filters.category !== "semua" ? (
              <Button variant="secondary" onClick={() => change(DEFAULT_FILTERS)}>
                {t.view.seeAll}
              </Button>
            ) : undefined
          }
        >
          {narrowed
            ? t.view.noMatch
            : filters.category !== "semua"
              ? format(t.view.noneInCategory, { category: categoryLabel(filters.category, locale) })
              : t.view.noneOpen}
        </EmptyState>
      ) : (
        <>
          <FeaturedBlock featured={featured} showsRest={rest.length > 0} now={data.now} />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {rest.map((project, i) => (
              <ProjectTile key={project.slug} project={project} now={data.now} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
