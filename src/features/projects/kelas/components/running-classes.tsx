"use client";

import { ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { fill } from "@/features/studio/copy/fill";
import { useT } from "@/lib/i18n/provider";
import { dashboardHref } from "../class-model";
import type { ContinueTarget, RunningClass } from "../continue-model";

type RunningCopy = ReturnType<typeof useT>["projectsClass"]["running"];

function nextText(next: ContinueTarget, t: RunningCopy): string {
  if (next.kind === "materi") return fill(t.nextMaterial, { title: next.title });
  if (next.kind === "tugas") return fill(t.nextTask, { title: next.title });
  return t.allSent;
}

/**
 * Classes in progress, each with where you stand and a Lanjutkan button to the next material or
 * assignment (KLS-05). The caller draws the heading and leaves the section out when the list is
 * empty, so a reader with no running class never sees it. `rail` is the Beranda side column, where
 * the button is a quiet text button because the page already has its one filled button.
 */
export function RunningClassList({
  rows,
  variant,
}: {
  rows: RunningClass[];
  variant: "rail" | "page";
}) {
  const t = useT().projectsClass.running;
  return (
    <ul className="grid">
      {rows.map(({ project, progress, next }) => (
        <li
          key={project.slug}
          className="grid gap-1 border-t border-line py-3 first:border-t-0 first:pt-0"
        >
          <TextLink
            href={dashboardHref(project.slug)}
            className="w-fit text-sm font-medium wrap-anywhere"
          >
            {project.title}
          </TextLink>
          <p className="text-xs wrap-anywhere text-ink-muted">
            {fill(t.line, { percent: String(progress.percent), next: nextText(next, t) })}
          </p>
          <ButtonLink
            href={next.href}
            variant={variant === "rail" ? "text" : "secondary"}
            size="sm"
            aria-label={fill(t.continueAria, { title: project.title })}
            className={
              variant === "rail" ? "justify-self-start px-0 text-ink" : "justify-self-start"
            }
          >
            {t.continue}
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}
