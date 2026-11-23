"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";
import { categoryLabel, projectHref } from "../project-model";
import type { ProjectCategory } from "../types";
import { ProjectCover } from "./project-cover";

type Props = {
  project: { slug: string; category: ProjectCategory; title: string };
  /**
   * `h1` when the strip is the screen's only title (a screen that says why it cannot open), so the
   * project's name is not printed twice. Otherwise the screen keeps its own heading under it.
   */
  titleAs?: "h1" | "p";
  /** Link the title to the project, for screens whose way back leads elsewhere. */
  linked?: boolean;
  className?: string;
};

/**
 * The small head of a step inside a project (DESIGN.md 7.7): which project you are in, told by its
 * cover, its category and its name. The detail page before and the milestone after carry the large
 * cover; the steps between carry this one.
 */
export function ProjectStrip({ project, titleAs = "p", linked = false, className }: Props) {
  const Title = titleAs;
  const locale = useLocale();
  return (
    <div
      className={cn(
        "rm-cover-host rm-rise-in grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-4",
        className,
      )}
      style={{ animationDelay: "0ms" }}
    >
      <ProjectCover project={project} className="w-12" />
      <div className="grid min-w-0 justify-items-start gap-1">
        <p>
          <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[11px] font-semibold text-accent-ink">
            {categoryLabel(project.category, locale)}
          </span>
        </p>
        <Title
          className={cn(
            "wrap-anywhere",
            titleAs === "h1" ? "heading-lg" : "text-base font-semibold",
          )}
        >
          {linked ? (
            <Link
              href={projectHref(project.slug)}
              className="text-ink no-underline hover:underline"
            >
              {project.title}
            </Link>
          ) : (
            project.title
          )}
        </Title>
      </div>
    </div>
  );
}
