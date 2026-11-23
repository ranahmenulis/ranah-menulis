"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { DisplayControls } from "@/components/ui/display-controls";
import { Wordmark } from "@/components/ui/logo";
import { useT } from "@/lib/i18n/provider";
import { artFor } from "../auth-art";
import { AuthAsideSlot, AuthSceneBand, AuthScenePanel, CornerEngraving } from "./auth-scene";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Frame of the screens that come before the app: sign in, sign up, reset, verify, onboarding
 * (DESIGN.md 6, layar akun; tahap J). From lg the screen is split: the form on the canvas at left,
 * a painting filling the right half with an engraving crossing the seam. Below lg the painting is a
 * band under the bar and the form is a sheet overlapping it.
 * There is no navigation because there is no account yet.
 */
export function AuthFrame({ children }: { children: ReactNode }) {
  const { brand } = useT().account;
  const art = artFor(usePathname() ?? "");
  return (
    <AuthAsideSlot>
      {(onSlot) => (
        <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-2">
          <div className="relative flex min-h-dvh flex-col max-lg:min-h-0">
            <header className="flex h-[calc(3.25rem+var(--safe-top))] items-center gap-4 pt-(--safe-top) pr-2 pl-4 md:h-[calc(3.5rem+var(--safe-top))] md:px-6 lg:h-[calc(4.5rem+var(--safe-top))] lg:px-10">
              <Wordmark href="/" label={brand} height={28} />
              <span className="flex-1" />
              <div className="lg:hidden">
                <DisplayControls />
              </div>
            </header>
            <AuthSceneBand art={art} />
            {/* Clip, not hide: the celebration rings may spread past the column without a scrollbar. */}
            <div className="relative grid flex-1 overflow-x-clip max-lg:-mt-6 max-lg:rounded-t-[1.5rem] max-lg:bg-canvas lg:content-center">
              {/* No engraving below lg (user): the band and the sheet are enough on a phone. */}
              <main className="relative z-10 mx-auto w-full max-w-[26rem] min-w-0 px-5 pt-10 pb-12 md:px-6 lg:py-12">
                {children}
              </main>
              <CornerEngraving />
            </div>
          </div>
          <AuthScenePanel art={art} onSlot={onSlot} />
        </div>
      )}
    </AuthAsideSlot>
  );
}

/**
 * Title, one line under it, then the screen's content, rising in one after another. The h1 is the
 * only heading; `accent` is a second title line set in the serif italic, as on the landing.
 * `eyebrow` is a small line above it (the sign-up step). `celebrate` spreads ink rings from the
 * title once (a rare moment: email verified).
 */
export function AuthPage({
  title,
  accent,
  eyebrow,
  subtitle,
  celebrate = false,
  titleId,
  children,
}: {
  title: string;
  accent?: string;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  celebrate?: boolean;
  titleId?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-8">
      <header className="relative isolate grid gap-3">
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
        {eyebrow && (
          <p className="rm-rise-in text-sm font-medium text-accent-ink" style={step(-4)}>
            {eyebrow}
          </p>
        )}
        <h1
          id={titleId}
          tabIndex={titleId ? -1 : undefined}
          className="rm-rise-in text-[32px] leading-[1.1] font-bold tracking-tight [overflow-wrap:anywhere] outline-none md:text-[40px]"
          style={step(-3)}
        >
          {title}
          {accent && (
            <>
              {" "}
              <span className="block font-serif font-normal tracking-normal italic">{accent}</span>
            </>
          )}
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
