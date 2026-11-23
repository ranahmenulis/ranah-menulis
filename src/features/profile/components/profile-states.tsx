"use client";

import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";

/** Shape of a profile, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function ProfileSkeleton() {
  const t = useT().profile;
  return (
    <div
      role="status"
      aria-label={t.loading}
      className="mx-auto grid max-w-320 animate-[rm-appear_0s_300ms_forwards] gap-6 opacity-0 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <Skeleton className="h-56 rounded-2xl" />
      <div className="grid content-start gap-3 rounded-2xl border border-line bg-surface p-5 lg:col-start-1">
        <Skeleton className="h-5 w-64" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid gap-3 border-b border-line py-6 last:border-b-0">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl max-lg:hidden lg:col-start-2 lg:row-start-2" />
    </div>
  );
}

export function ProfileError({ onRetry }: { onRetry: () => void }) {
  const t = useT().profile;
  return (
    <div className="mx-auto max-w-182 py-8">
      <ErrorBanner action={<RetryButton onClick={onRetry} />}>{t.loadError}</ErrorBanner>
    </div>
  );
}

/** DESIGN.md 8, "Tidak tersedia": one sentence and a way back. */
export function ProfileGone() {
  const t = useT().profile;
  return (
    <div className="mx-auto grid max-w-182 justify-items-start gap-4 py-12">
      <p className="font-serif text-xl leading-7 font-semibold">{t.goneTitle}</p>
      <p className="text-sm text-ink-muted">{t.goneBody}</p>
      <ButtonLink href="/beranda" variant="secondary">
        {t.backHome}
      </ButtonLink>
    </div>
  );
}
