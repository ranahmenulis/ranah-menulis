"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { SignInButton, SignUpButton } from "@/features/account/components/auth-buttons";
import { DISCOVER_HREF } from "@/features/app-shell/nav";
import { format, useT } from "@/lib/i18n/provider";

/** Shape of a post, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function PostSkeleton() {
  const t = useT().post;
  return (
    <div
      role="status"
      aria-label={t.loading}
      className="mx-auto grid w-full max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-3.5 opacity-0"
    >
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-10 w-[86%]" />
      <Skeleton className="mb-3 h-10 w-1/2" />
      <div className="mb-4 flex items-center gap-3 border-y border-line py-5">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-3.5 w-50" />
      </div>
      {[100, 96, 90, 64].map((w) => (
        <Skeleton key={w} className="h-4" style={{ width: `${w}%` }} />
      ))}
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="h-4 w-[94%]" />
      <Skeleton className="h-4 w-[72%]" />
    </div>
  );
}

export function PostError({ onRetry }: { onRetry: () => void }) {
  const t = useT().post;
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4 py-12">
      <ErrorBanner className="w-full" action={<RetryButton onClick={onRetry} />}>
        {t.loadError}
      </ErrorBanner>
      <ButtonLink href={DISCOVER_HREF} variant="text" className="px-0">
        {t.backToCommunity}
      </ButtonLink>
    </div>
  );
}

/** Withdrawn, missing, or inaccessible posts share a message so a private post is not disclosed. */
export function PostGone() {
  const t = useT().post;
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4 py-12">
      <p className="font-serif text-xl leading-7 font-semibold">{t.goneTitle}</p>
      <p className="max-w-130 text-sm text-ink-muted">{t.goneBody}</p>
      <ButtonLink href={DISCOVER_HREF} variant="secondary">
        {t.backToCommunity}
      </ButtonLink>
    </div>
  );
}

/** Right column for a signed-out reader at lg and up (DESIGN.md 6.9 #6). */
export function GuestAside({ authorName }: { authorName: string }) {
  const t = useT().post.guest;
  return (
    <aside
      aria-label={t.label}
      className="sticky top-[calc(6rem+var(--safe-top))] hidden w-80 shrink-0 content-start gap-6 self-start lg:grid"
    >
      <div
        aria-disabled="true"
        title={t.searchSoon}
        className="flex h-9 items-center gap-2 rounded-full bg-subtle px-3.5 text-sm text-ink-muted"
      >
        <MagnifyingGlass size={20} aria-hidden />
        {t.search}
      </div>
      <div className="grid gap-3 border-t border-line pt-6">
        <h2 className="text-lg leading-[26px] font-semibold">{t.title}</h2>
        <p className="text-sm leading-[22px] text-ink-muted">
          {format(t.body, { name: authorName })}
        </p>
        <div className="flex items-center gap-2">
          <SignUpButton variant="secondary">{t.signUp}</SignUpButton>
          <SignInButton variant="text" className="text-ink!">
            {t.signIn}
          </SignInButton>
        </div>
      </div>
    </aside>
  );
}
