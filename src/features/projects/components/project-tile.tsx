"use client";

import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/provider";
import { revealDelay, useRevealOnce } from "@/lib/use-reveal-once";
import { categoryLabel, feeLabel, projectHref, projectState } from "../project-model";
import { deadlineText, quotaText, stateLabelOf } from "../project-text";
import type { Project } from "../types";
import { ProjectCover } from "./project-cover";

type Props = { project: Project; now: number; index: number };

/**
 * One project in the catalog (DESIGN.md 6.7, 7.10): a card with its painted cover, then the facts
 * under it, and the taken share of the quota as a thin accent bar. The title is a stretched link so the whole tile opens the project. The tile rises in
 * once and its cover draws itself; pointing at it lifts the cover and moves its pattern. The state
 * is plain text, not a pill, so it is never mistaken for a submission status (7.4).
 */
export function ProjectTile({ project, now, index }: Props) {
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const seen = useRevealOnce(ref);
  const state = projectState(project, now);
  const quota = quotaText(project, locale);

  const quotaShare =
    project.quota && project.quota.total > 0
      ? Math.min(1, project.quota.taken / project.quota.total)
      : null;

  return (
    <article
      ref={ref}
      data-rise
      data-cover-reveal
      data-seen={seen ? "" : undefined}
      style={{ "--delay": `${revealDelay(index)}ms` } as CSSProperties}
      className="rm-cover-host hover:shadow-lg relative grid min-w-0 content-start gap-3 rounded-2xl border border-line bg-surface p-2 shadow-card transition-[translate,box-shadow] duration-200 ease-(--ease-out) hover:-translate-y-0.5 sm:p-2.5"
    >
      <ProjectCover project={project} />
      <div className="grid min-w-0 gap-1 px-1 pb-1.5">
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
          <span className="font-medium text-ink">{categoryLabel(project.category, locale)}</span>
          <span aria-hidden>·</span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              state === "segera-tutup" && "font-semibold text-accent-ink",
            )}
          >
            {state === "segera-tutup" && (
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            )}
            {stateLabelOf(state, locale)}
          </span>
        </p>
        <h2 className="font-serif text-[17px] leading-6 font-semibold wrap-anywhere md:text-lg">
          <Link
            href={projectHref(project.slug)}
            className="text-ink no-underline after:absolute after:inset-0 after:rounded-2xl hover:underline"
          >
            {project.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm wrap-anywhere text-ink-soft max-sm:hidden">
          {project.summary}
        </p>
        <p className="mt-1.5 text-sm font-semibold text-ink tabular-nums">
          {feeLabel(project, locale)}
        </p>
        {quotaShare !== null && (
          <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-accent-subtle">
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${quotaShare * 100}%` }}
            />
          </span>
        )}
        <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
          {quota && <span>{quota}</span>}
          <span className="inline-flex items-center gap-1">
            <CalendarBlank size={12} aria-hidden />
            {deadlineText(project, state, locale)}
          </span>
        </p>
      </div>
    </article>
  );
}
