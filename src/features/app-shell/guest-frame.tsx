"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { BackButton } from "./top-bar";

const SOON = "Masuk tersedia setelah akun dibuka";

/**
 * Frame for someone who is not signed in: only a top bar, no navigation (DESIGN.md 6.9). Masuk and
 * Daftar have no destination until accounts exist (R1), so they are shown but inactive.
 */
export function GuestFrame({ children, back }: { children: ReactNode; back: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-13 items-center gap-2 border-b border-line bg-canvas pr-2 pl-4 md:h-14 md:gap-4 md:px-6">
        {back && <BackButton className="md:hidden" />}
        {!back && <Monogram href="/" label="RanahMenulis" height={24} className="md:hidden" />}
        <Wordmark href="/" label="RanahMenulis" height={28} className="max-md:hidden" />
        <span className="flex-1" />
        <div
          aria-disabled="true"
          title="Pencarian belum tersedia"
          className="mr-2 flex h-9 w-60 items-center gap-2 rounded-full bg-subtle px-3.5 text-sm text-ink-muted max-md:hidden"
        >
          <MagnifyingGlass size={20} aria-hidden />
          Cari penulis dan karya
        </div>
        <Button variant="text" disabled title={SOON} className="text-ink!">
          Masuk
        </Button>
        <Button variant="secondary" size="sm" disabled title={SOON}>
          Daftar
        </Button>
      </header>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-12 md:py-10">{children}</main>
    </div>
  );
}
