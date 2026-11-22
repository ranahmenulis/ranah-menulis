"use client";

import Link from "next/link";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import { ARCHIVE_HREF } from "../document-archive";
import type { LoadState } from "../hooks/use-studio-document";

export function EditorUnavailable({
  load,
  onRetry,
  backHref,
}: {
  load: LoadState;
  onRetry: () => void;
  backHref: string;
}) {
  if (load === "error") return <EditorError onRetry={onRetry} backHref={backHref} />;
  if (load === "missing") return <EditorMissing backHref={backHref} />;
  if (load === "archived") return <EditorArchived />;
  return <EditorLoading />;
}

/** Shown only when loading takes longer than 300ms (DESIGN.md 8); CSS keeps it invisible until then. */
export function EditorLoading() {
  const t = useT().studioEditor;
  return (
    <div
      role="status"
      aria-label={t.states.loading}
      className="mx-auto grid w-full max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-3.5 opacity-0"
    >
      <Skeleton className="mb-6 h-10 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[96%]" />
      <Skeleton className="h-4 w-[88%]" />
      <Skeleton className="mb-4 h-4 w-3/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[92%]" />
      <Skeleton className="h-4 w-7/10" />
    </div>
  );
}

export function EditorError({ onRetry, backHref }: { onRetry: () => void; backHref: string }) {
  const t = useT().studioEditor;
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4">
      <ErrorBanner className="w-full" action={<RetryButton onClick={onRetry} />}>
        {t.states.loadError}
      </ErrorBanner>
      <ButtonLink href={backHref} variant="text" className="px-0">
        {t.states.backToStudio}
      </ButtonLink>
    </div>
  );
}

/** "Tidak tersedia": a single column with one sentence and a way back (DESIGN.md 8). */
export function EditorMissing({ backHref }: { backHref: string }) {
  const t = useT().studioEditor;
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4 py-8">
      <p className="font-serif text-xl leading-7 font-semibold">{t.states.missingTitle}</p>
      <p className="text-sm text-ink-muted">
        {t.states.missingBody}{" "}
        <Link href={backHref} className="text-ink underline underline-offset-3">
          {t.states.backToStudio}
        </Link>
      </p>
    </div>
  );
}

export function EditorArchived() {
  const t = useT().studioEditor;
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4 py-8">
      <p className="font-serif text-xl leading-7 font-semibold">{t.states.archivedTitle}</p>
      <p className="text-sm text-ink-muted">{t.states.archivedBody}</p>
      <ButtonLink href={ARCHIVE_HREF} variant="secondary">
        {t.states.openArchive}
      </ButtonLink>
    </div>
  );
}
