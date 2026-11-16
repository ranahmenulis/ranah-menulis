import Link from "next/link";
import { cn } from "@/lib/cn";
import { categoryLabel, feeLabel, projectHref, projectState } from "../project-model";
import { deadlineText, quotaText, stateLabel } from "../project-text";
import type { Project } from "../types";

/**
 * One project in the catalog: a hairline row, not a card (DESIGN.md 9). The title is a stretched
 * link so the whole row opens the project. The state is plain text, not a pill, so it is never
 * mistaken for a submission status (7.4); only "Segera tutup" is weighted.
 */
export function ProjectRow({ project, now }: { project: Project; now: number }) {
  const state = projectState(project, now);
  const quota = quotaText(project);

  return (
    <article className="relative grid min-w-0 gap-1.5 border-b border-line py-5">
      <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
        <span className="font-medium text-ink">{categoryLabel(project.category)}</span>
        <span aria-hidden>·</span>
        <span className={cn(state === "segera-tutup" && "font-semibold text-ink")}>
          {stateLabel[state]}
        </span>
      </p>
      <h2 className="feed-title wrap-anywhere">
        <Link
          href={projectHref(project.slug)}
          className="text-ink no-underline after:absolute after:inset-0 hover:underline"
        >
          {project.title}
        </Link>
      </h2>
      <p className="feed-excerpt wrap-anywhere">{project.summary}</p>
      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span>{feeLabel(project)}</span>
        {quota && <span>{quota}</span>}
        <span>{deadlineText(project, state)}</span>
      </p>
    </article>
  );
}
