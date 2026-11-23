"use client";

import {
  AnthologyCover,
  ClassCover,
  ContestCover,
  SoloCover,
} from "@/components/illustrations/cover-art";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/provider";
import { coverOf } from "../cover-model";
import type { ProjectCategory, ProjectPoster } from "../types";
import { PosterCover } from "./poster-cover";

type Props = {
  project: { slug: string; category: ProjectCategory; title: string; poster?: ProjectPoster };
  /** Print the title on the generated cover (header and featured band); tiles show it under it. */
  showTitle?: boolean;
  /** The project header only: read an uploaded poster's alt text aloud instead of hiding it. */
  describe?: boolean;
  className?: string;
};

/** The painted cover per category (DESIGN.md 7.10). */
const ART = {
  antologi: AnthologyCover,
  solo: SoloCover,
  kelas: ClassCover,
  lomba: ContestCover,
} as const;

/**
 * A project's cover (DESIGN.md 7.6, 7.10): the poster an Organizer uploaded, or else the painted
 * cover of its category with the category printed as a small label (and the title on large
 * covers). It follows the theme through the illustration tokens. Decorative: the title is always
 * also text.
 */
export function ProjectCover({ project, showTitle = false, describe, className }: Props) {
  const generated = (
    <GeneratedCover project={project} showTitle={showTitle} className={className} />
  );
  if (!project.poster) return generated;
  return (
    <PosterCover
      poster={project.poster}
      describe={describe}
      className={className}
      fallback={generated}
    />
  );
}

function GeneratedCover({ project, showTitle = false, className }: Props) {
  const cover = coverOf(project, useLocale());
  const Art = ART[cover.pattern];
  return (
    <span
      aria-hidden
      data-cover={cover.pattern}
      className={cn(
        "rm-cover block overflow-hidden rounded-[10%/8%] border border-line bg-subtle",
        className,
      )}
    >
      <span className="@container relative block aspect-[4/5]">
        <Art className="absolute inset-0 size-full" />
        <span className="absolute top-[7%] left-[9%] rounded-full bg-surface/80 px-[4cqw] py-[1.5cqw] font-sans text-[6cqw] leading-none font-medium text-ink-soft">
          {cover.mark}
        </span>
        {showTitle && (
          <span className="absolute top-[18%] right-[9%] left-[9%] line-clamp-3 font-serif text-[9cqw] leading-[1.1] font-semibold text-balance text-ink">
            {project.title}
          </span>
        )}
      </span>
    </span>
  );
}
