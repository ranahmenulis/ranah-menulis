"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DisplayControls } from "@/components/ui/display-controls";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { useT } from "@/lib/i18n/provider";
import { BackButton } from "./top-bar";

/**
 * Frame for someone who is not signed in: only a top bar, no navigation (DESIGN.md 6.9). Masuk and
 * Daftar have no destination until accounts exist (R1), so they are shown but inactive.
 */
export function GuestFrame({ children, back }: { children: ReactNode; back: boolean }) {
  const { guest, topBar } = useT().shell;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-[calc(3.25rem+var(--safe-top))] items-center gap-2 border-b border-line bg-canvas pt-(--safe-top) pr-2 pl-4 md:h-[calc(3.5rem+var(--safe-top))] md:gap-4 md:px-6">
        {back && <BackButton className="md:hidden" />}
        {!back && <Monogram href="/" label={guest.brand} height={24} className="md:hidden" />}
        <Wordmark href="/" label={guest.brand} height={28} className="max-md:hidden" />
        <span className="flex-1" />
        <div
          aria-disabled="true"
          title={topBar.searchSoon}
          className="mr-2 flex h-9 w-60 items-center gap-2 rounded-full bg-subtle px-3.5 text-sm text-ink-muted max-md:hidden"
        >
          <MagnifyingGlass size={20} aria-hidden />
          {topBar.searchPlaceholder}
        </div>
        <DisplayControls />
        <Button variant="text" disabled title={guest.soon} className="text-ink!">
          {guest.signIn}
        </Button>
        <Button variant="secondary" size="sm" disabled title={guest.soon}>
          {guest.signUp}
        </Button>
      </header>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-12 md:py-10">{children}</main>
    </div>
  );
}
