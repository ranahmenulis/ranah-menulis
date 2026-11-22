"use client";

import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/states";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";

/** Shape of the catalog, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function ProjectsSkeleton() {
  const t = useT().projectsCatalog;
  return (
    <div
      role="status"
      aria-label={t.screens.loadingProjects}
      className="mx-auto grid max-w-260 animate-[rm-appear_0s_300ms_forwards] gap-3 opacity-0"
    >
      <Skeleton className="h-9 w-40" />
      <div className="flex gap-2 py-3">
        {[20, 24, 16, 28, 20].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-full" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid gap-3">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shape of a project page: title, the right column, then a few sections. */
export function ProjectDetailSkeleton() {
  const t = useT().projectsCatalog;
  return (
    <div
      role="status"
      aria-label={t.screens.loadingProject}
      className="mx-auto grid max-w-260 animate-[rm-appear_0s_300ms_forwards] gap-x-10 gap-y-4 opacity-0 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="grid content-start gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="mt-6 grid gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full max-lg:order-first" />
    </div>
  );
}

/** DESIGN.md 8, "Tidak tersedia": one sentence and a way back. Also used for drafts (PRJ-01). */
export function ProjectGone() {
  const t = useT().projectsCatalog.screens;
  return (
    <div className="mx-auto grid max-w-170 justify-items-start gap-4 py-12">
      <p className="font-serif text-xl leading-7 font-semibold">{t.goneTitle}</p>
      <p className="text-sm text-ink-muted">{t.goneBody}</p>
      <ButtonLink href={PROJECTS_HREF} variant="secondary">
        {t.goneBack}
      </ButtonLink>
    </div>
  );
}
