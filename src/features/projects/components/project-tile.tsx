"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { revealDelay, useRevealOnce } from "@/lib/use-reveal-once";
import { categoryLabel, feeLabel, projectHref, projectState } from "../project-model";
import { deadlineText, quotaText, stateLabel } from "../project-text";
import type { Project } from "../types";
import { ProjectCover } from "./project-cover";

type Props = { project: Project; now: number; index: number };

/**
 * One project in the catalog (DESIGN.md 6.7): its cover, then the facts under it, like a book on a
 * shop table. The title is a stretched link so the whole tile opens the project. The tile rises in
 * once and its cover draws itself; pointing at it lifts the cover and moves its pattern. The state
 * is plain text, not a pill, so it is never mistaken for a submission status (7.4).
 */
export function ProjectTile({ project, now, index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const seen = useRevealOnce(ref);
  const state = projectState(project, now);
  const quota = quotaText(project);

  return (
    <article
      ref={ref}
      data-rise
      data-cover-reveal
      data-seen={seen ? "" : undefined}
      style={{ "--delay": `${revealDelay(index)}ms` } as CSSProperties}
      className="rm-cover-host relative grid min-w-0 content-start gap-3"
    >
      <ProjectCover project={project} />
      <div className="grid min-w-0 gap-1">
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
          <span className="font-medium text-ink">{categoryLabel(project.category)}</span>
          <span aria-hidden>·</span>
          <span className={cn(state === "segera-tutup" && "font-semibold text-ink")}>
            {stateLabel[state]}
          </span>
        </p>
        <h2 className="font-serif text-[17px] leading-6 font-semibold wrap-anywhere md:text-lg">
          <Link
            href={projectHref(project.slug)}
            className="text-ink no-underline after:absolute after:inset-0 hover:underline"
          >
            {project.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm wrap-anywhere text-ink-soft max-sm:hidden">
          {project.summary}
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
          <span className="font-medium text-ink tabular-nums">{feeLabel(project)}</span>
          {quota && <span>{quota}</span>}
          <span>{deadlineText(project, state)}</span>
        </p>
      </div>
    </article>
  );
}
