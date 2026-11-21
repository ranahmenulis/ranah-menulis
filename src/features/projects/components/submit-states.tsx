import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { projectHref } from "../project-model";
import { registerHref } from "../registration-model";
import type { SubmitBlock } from "../submission-model";
import { blockMessage } from "../submission-text";
import type { Project } from "../types";
import { ProjectStrip } from "./project-strip";

/** One column of 680 with the way back to the project always on top (every wide screen needs an exit). */
export function SubmitShell({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-170 gap-6">
      <TextLink
        href={projectHref(slug)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <span aria-hidden>←</span>
        Kembali ke proyek
      </TextLink>
      {children}
    </div>
  );
}

/** Shape of the page, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function SubmitSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat halaman kirim karya"
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
  return (
    <SubmitShell slug={slug}>
      <ErrorBanner action={<RetryButton onClick={onRetry} />}>
        Halaman kirim karya belum bisa dibuka. Data di perangkat ini tidak terbaca.
      </ErrorBanner>
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
  return (
    <SubmitShell slug={project.slug}>
      <ProjectStrip project={project} titleAs="h1" />
      <Notice>{blockMessage(block, project.submission)}</Notice>
      {block === "belum-terdaftar" ? (
        <ButtonLink href={registerHref(project.slug)} className="justify-self-start">
          Daftar
        </ButtonLink>
      ) : (
        <ButtonLink
          href={projectHref(project.slug)}
          variant="secondary"
          className="justify-self-start"
        >
          Lihat proyek
        </ButtonLink>
      )}
      {children}
    </SubmitShell>
  );
}
