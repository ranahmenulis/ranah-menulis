"use client";

import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { useLocale, useT } from "@/lib/i18n/provider";
import { projectHref } from "../project-model";
import { registerHref } from "../registration-model";
import type { SubmitBlock } from "../submission-model";
import { blockMessage } from "../submission-text";
import type { Project } from "../types";
import { ProjectStrip } from "./project-strip";

/** One column of 680 with the way back to the project always on top (every wide screen needs an exit). */
export function SubmitShell({ slug, children }: { slug: string; children: ReactNode }) {
  const t = useT().projectsFlow.common;
  return (
    <div className="mx-auto grid max-w-170 gap-6">
      <TextLink
        href={projectHref(slug)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <span aria-hidden>←</span>
        {t.backToProject}
      </TextLink>
      {children}
    </div>
  );
}

/** Shape of the page, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function SubmitSkeleton() {
  const t = useT().projectsFlow.submit;
  return (
    <div
      role="status"
      aria-label={t.loading}
      className="mx-auto grid max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-4 opacity-0"
    >
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-10 w-3/4" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="mt-4 grid gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
    </div>
  );
}

/** The submissions or the documents could not be read. Not an empty list: nothing is assumed. */
export function SubmitError({ slug, onRetry }: { slug: string; onRetry: () => void }) {
  const t = useT().projectsFlow.submit;
  return (
    <SubmitShell slug={slug}>
      <ErrorBanner action={<RetryButton onClick={onRetry} />}>{t.loadError}</ErrorBanner>
    </SubmitShell>
  );
}

/** Why the form is not offered. The way back stays; being unregistered offers the way forward. */
export function SubmitBlocked({
  project,
  block,
  children,
}: {
  project: Project;
  block: SubmitBlock;
  /** Works already sent, when there are some. */
  children?: ReactNode;
}) {
  const t = useT().projectsFlow;
  const locale = useLocale();
  return (
    <SubmitShell slug={project.slug}>
      <ProjectStrip project={project} titleAs="h1" />
      <Notice>{blockMessage(block, project.submission, locale)}</Notice>
      {block === "belum-terdaftar" ? (
        <ButtonLink href={registerHref(project.slug)} className="justify-self-start">
          {t.submit.register}
        </ButtonLink>
      ) : (
        <ButtonLink
          href={projectHref(project.slug)}
          variant="secondary"
          className="justify-self-start"
        >
          {t.common.viewProject}
        </ButtonLink>
      )}
      {children}
    </SubmitShell>
  );
}
