"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { DisplayControls } from "@/components/ui/display-controls";
import { Wordmark } from "@/components/ui/logo";
import { useT } from "@/lib/i18n/provider";
import { artFor } from "../auth-art";
import { AuthPlatePanel, AuthPlateStrip } from "./auth-plate";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Frame of the screens that come before the app: sign in, sign up, reset, verify, onboarding. Only a
 * bar with the logo (back to the landing page) and the display controls, then one narrow column and
 * the endpaper (DESIGN.md 6, layar akun): a panel beside the form from lg, a strip above it below.
 * There is no navigation because there is no account yet.
 */
export function AuthFrame({ children }: { children: ReactNode }) {
  const { brand } = useT().account;
  const art = artFor(usePathname() ?? "");
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-[calc(3.25rem+var(--safe-top))] items-center gap-4 border-b border-line bg-canvas pt-(--safe-top) pr-2 pl-4 md:h-[calc(3.5rem+var(--safe-top))] md:px-6">
        <Wordmark href="/" label={brand} height={28} />
        <span className="flex-1" />
        <DisplayControls />
      </header>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Clip, not hide: the celebration rings may spread past the column without a scrollbar. */}
        <div className="min-w-0 overflow-x-clip">
          <AuthPlateStrip art={art} />
          <main className="mx-auto w-full max-w-[26rem] min-w-0 px-4 py-10 md:py-16 lg:py-20">
            {children}
          </main>
        </div>
        <AuthPlatePanel art={art} />
      </div>
    </div>
  );
}

/**
 * Title, one line under it, then the screen's content, rising in one after another. The h1 is the
 * only heading. `celebrate` spreads ink rings from the title once (a rare moment: email verified).
 */
export function AuthPage({
  title,
  subtitle,
  celebrate = false,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  celebrate?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-8">
      <header className="relative isolate grid gap-2">
        {celebrate && (
          <span
            aria-hidden
            data-celebrate
            className="rm-burst pointer-events-none absolute -z-10"
            style={{ top: "1.25rem", left: "2rem" }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={step(i)} />
            ))}
          </span>
        )}
        <h1 className="rm-rise-in heading-lg [overflow-wrap:anywhere]" style={step(-3)}>
          {title}
        </h1>
        {subtitle && (
          <p
            className="rm-rise-in text-base [overflow-wrap:anywhere] text-ink-muted"
            style={step(-2)}
          >
            {subtitle}
          </p>
        )}
      </header>
      <div className="rm-rise-in grid gap-8" style={step(-1)}>
        {children}
      </div>
    </div>
  );
}
