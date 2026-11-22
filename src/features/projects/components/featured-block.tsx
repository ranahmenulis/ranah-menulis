"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/provider";
import { useRevealOnce } from "@/lib/use-reveal-once";
import { categoryLabel, feeLabel, projectHref, projectState } from "../project-model";
import { deadlineText, stateLabelOf } from "../project-text";
import type { Project } from "../types";
import { ProjectCover } from "./project-cover";

function FeaturedBand({ project, now, wide }: { project: Project; now: number; wide: boolean }) {
  const t = useT().projectsCatalog.featured;
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const seen = useRevealOnce(ref);
  const state = projectState(project, now);
  return (
    <article
      ref={ref}
      data-rise
      data-cover-reveal
      data-seen={seen ? "" : undefined}
      className={cn(
        "rm-cover-host theme-dark app-band relative grid items-center gap-6 overflow-hidden p-6 text-ink sm:grid-cols-[minmax(0,1fr)_auto] md:p-8",
        wide && "lg:gap-12 lg:p-12",
      )}
    >
      <div className="grid min-w-0 gap-3">
        <p className="text-xs text-ink-muted">
          <span className="font-medium text-ink">{t.label}</span> ·{" "}
          {categoryLabel(project.category, locale)} · {stateLabelOf(state, locale)}
        </p>
        <h3
          className={cn(
            "font-serif font-semibold text-balance wrap-anywhere",
            wide ? "text-[26px] leading-8 md:text-[34px] md:leading-[42px]" : "text-2xl leading-8",
          )}
        >
          <Link
            href={projectHref(project.slug)}
            className="text-ink no-underline after:absolute after:inset-0"
          >
            {project.title}
          </Link>
        </h3>
        <p className="max-w-prose text-base wrap-anywhere text-ink-soft">{project.summary}</p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span className="font-medium text-ink tabular-nums">{feeLabel(project, locale)}</span>
          <span>{deadlineText(project, state, locale)}</span>
          <span className="inline-flex items-center gap-1 font-medium text-ink">
            {t.view}
            <ArrowRight
              size={14}
              aria-hidden
              className="transition-transform duration-200 ease-(--ease-out) [.rm-cover-host:hover_&]:translate-x-1"
            />
          </span>
        </p>
      </div>
      <ProjectCover
        project={project}
        showTitle
        className={cn("w-36 max-sm:-order-1", wide && "md:w-48 lg:w-56")}
      />
    </article>
  );
}

/** "Unggulan" (PRD 17.5): the projects an Administrator marked, as dark bands above the rest. */
export function FeaturedBlock({
  featured,
  showsRest,
  now,
}: {
  featured: Project[];
  showsRest: boolean;
  now: number;
}) {
  const t = useT().projectsCatalog.featured;
  if (featured.length === 0) return null;
  return (
    <section aria-labelledby="unggulan-title" className="mt-6">
      <h2 id="unggulan-title" className="sr-only">
        {t.label}
      </h2>
      <div className={cn("grid gap-4", featured.length > 1 && "lg:grid-cols-2")}>
        {featured.map((project) => (
          <FeaturedBand
            key={project.slug}
            project={project}
            now={now}
            wide={featured.length === 1}
          />
        ))}
      </div>
      {showsRest && <h2 className="mt-12 heading-md">{t.all}</h2>}
    </section>
  );
}
