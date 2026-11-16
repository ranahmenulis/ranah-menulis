import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { MY_PROJECTS_HREF } from "../submission-href";

/** Where the way out leads: "Proyek saya", the catalog, or any page named by href and label. */
export type Back = "saya" | "katalog" | { href: string; label: string };

function backOf(back: Back): { href: string; label: string } {
  if (back === "saya") return { href: MY_PROJECTS_HREF, label: "Proyek saya" };
  if (back === "katalog") return { href: PROJECTS_HREF, label: "Semua Projects" };
  return back;
}

/** One column with the way out always on top. */
export function MyShell({ back, children }: { back: Back; children: ReactNode }) {
  const { href, label } = backOf(back);
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
export function MySkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
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
  return (
    <MyShell back={back}>
      <Notice>Masuk untuk melihat proyek dan kirimanmu.</Notice>
      <ButtonLink href={PROJECTS_HREF} variant="secondary" className="justify-self-start">
        Lihat Projects
      </ButtonLink>
    </MyShell>
  );
}
