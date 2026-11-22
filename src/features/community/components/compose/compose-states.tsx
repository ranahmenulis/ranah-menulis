"use client";

import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Skeleton } from "@/components/ui/states";
import { DISCOVER_HREF, NEW_POST_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";

/** Shown only if opening a draft takes more than 300ms (DESIGN.md 8). */
export function ComposeLoading() {
  const t = useT().compose.states;
  return (
    <main className="px-4 pt-24">
      <div
        role="status"
        aria-label={t.opening}
        className="mx-auto grid w-full max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-3.5 opacity-0"
      >
        <Skeleton className="mb-4 h-9 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[94%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
    </main>
  );
}

/** A draft link that no longer leads anywhere, or a store that would not open. */
export function ComposeMissing({ failed }: { failed: boolean }) {
  const t = useT().compose.states;
  return (
    <main className="px-4 pt-24">
      <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4">
        {failed ? (
          <ErrorBanner className="w-full">{t.failed}</ErrorBanner>
        ) : (
          <>
            <p className="font-serif text-xl leading-7 font-semibold">{t.missingTitle}</p>
            <p className="text-sm text-ink-muted">{t.missingBody}</p>
          </>
        )}
        <div className="flex items-center gap-2">
          <ButtonLink href={NEW_POST_HREF} variant="secondary">
            {t.writeNew}
          </ButtonLink>
          <ButtonLink href={DISCOVER_HREF} variant="text">
            {t.backToCommunity}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
