"use client";

import { Button } from "@/components/ui/button";
import { format, useT } from "@/lib/i18n/provider";
import type { FeaturedProject } from "@/features/projects/featured-store";
import type { ProjectFixture } from "@/features/projects/types";
import type { AdminResult } from "../admin-actions";
import { setFeatured } from "./curation-actions";
import { featuredRows } from "./curation-model";

/** "Proyek unggulan" (PRD 17.5): which published projects lead the Projects page. [usulan] */
export function FeaturedSection({
  catalog,
  featured,
  report,
}: {
  catalog: readonly ProjectFixture[];
  featured: readonly FeaturedProject[];
  report: (result: AdminResult) => void;
}) {
  const t = useT().kelolaAdmin.curation.featured;
  const rows = featuredRows(catalog, featured);
  return (
    <section aria-labelledby="featured-title" className="grid gap-4">
      <div className="grid gap-1">
        <h2 id="featured-title" className="heading-md">
          {t.title}
        </h2>
        <p className="text-sm text-ink-muted">{t.intro}</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.none}</p>
      ) : (
        <ul className="grid">
          {rows.map((row) => (
            <li
              key={row.slug}
              className="flex min-w-0 items-center gap-3 border-b border-line py-3"
            >
              <p className="min-w-0 flex-1 font-medium wrap-anywhere text-ink">{row.title}</p>
              <Button
                variant={row.featured ? "text" : "secondary"}
                size="sm"
                aria-pressed={row.featured}
                aria-label={format(row.featured ? t.releaseAria : t.markAria, { title: row.title })}
                onClick={() => report(setFeatured(row.slug, !row.featured, catalog))}
              >
                {row.featured ? t.release : t.mark}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
