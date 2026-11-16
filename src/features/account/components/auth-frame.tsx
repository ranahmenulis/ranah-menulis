"use client";

import type { ReactNode } from "react";
import { DisplayControls } from "@/components/ui/display-controls";
import { Wordmark } from "@/components/ui/logo";
import { useT } from "@/lib/i18n/provider";

/**
 * Frame of the screens that come before the app: sign in, sign up, reset, verify, onboarding. Only a
 * bar with the logo (back to the landing page) and the display controls, then one narrow column.
 * There is no navigation because there is no account yet.
 */
export function AuthFrame({ children }: { children: ReactNode }) {
  const { brand } = useT().account;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-[calc(3.25rem+var(--safe-top))] items-center gap-4 border-b border-line bg-canvas pt-(--safe-top) pr-2 pl-4 md:h-[calc(3.5rem+var(--safe-top))] md:px-6">
        <Wordmark href="/" label={brand} height={28} />
        <span className="flex-1" />
        <DisplayControls />
      </header>
      <main className="mx-auto w-full max-w-[26rem] min-w-0 flex-1 px-4 py-10 md:py-16">
        {children}
      </main>
    </div>
  );
}

/** Title, one line under it, then the screen's content. The h1 is the only heading. */
export function AuthPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="heading-lg [overflow-wrap:anywhere]">{title}</h1>
        {subtitle && (
          <p className="text-base [overflow-wrap:anywhere] text-ink-muted">{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  );
}
