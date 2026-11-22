"use client";

import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { useT } from "@/lib/i18n/provider";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { MY_PROJECTS_HREF } from "../submission-href";

/** Where the way out leads: "Proyek saya", the catalog, or any page named by href and label. */
export type Back = "saya" | "katalog" | { href: string; label: string };

function backOf(
  back: Back,
  labels: { saya: string; katalog: string },
): { href: string; label: string } {
  if (back === "saya") return { href: MY_PROJECTS_HREF, label: labels.saya };
  if (back === "katalog") return { href: PROJECTS_HREF, label: labels.katalog };
  return back;
}

/** One column with the way out always on top. */
export function MyShell({ back, children }: { back: Back; children: ReactNode }) {
  const t = useT().projectsFlow.my;
  const { href, label } = backOf(back, t.back);
  return (
    <div className="mx-auto grid max-w-170 gap-6">
      <TextLink
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <span aria-hidden>←</span>
        {label}
      </TextLink>
      {children}
    </div>
  );
}

/** Shape of the page, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function MySkeleton({
  label,
  kind,
}: {
  /** An already translated label, for screens outside this flow. */
  label?: string;
  /** A label from the participant-flow copy, for the server routes that cannot read it. */
  kind?: "mine" | "submission" | "revise";
}) {
  const t = useT().projectsFlow;
  const text = kind
    ? { mine: t.my.loading, submission: t.detail.loading, revise: t.revise.loading }[kind]
    : label;
  return (
    <div
      role="status"
      aria-label={text}
      className="mx-auto grid max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-4 opacity-0"
    >
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-2/3" />
      {[0, 1].map((i) => (
        <div key={i} className="mt-4 grid gap-2 border-t border-line pt-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

/** The submissions could not be read. Not an empty list: nothing is assumed about what was sent. */
export function MyError({
  back,
  onRetry,
  children,
}: {
  back: Back;
  onRetry: () => void;
  children: ReactNode;
}) {
  return (
    <MyShell back={back}>
      <ErrorBanner action={<RetryButton onClick={onRetry} />}>{children}</ErrorBanner>
    </MyShell>
  );
}

/** A guest has no registrations or works: they live on this device and belong to the reader. */
export function MyGuest({ back }: { back: Back }) {
  const t = useT().projectsFlow.my;
  return (
    <MyShell back={back}>
      <Notice>{t.guest}</Notice>
      <ButtonLink href={PROJECTS_HREF} variant="secondary" className="justify-self-start">
        {t.viewProjects}
      </ButtonLink>
    </MyShell>
  );
}
