"use client";

import type { CSSProperties } from "react";
import { useT } from "@/lib/i18n/provider";
import { AUTH_ART, type AuthArtName } from "../auth-art";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * From lg: a dark panel beside the form holding the endpaper, which develops in like the empty-state
 * plates, and one serif line under it. The line sits under the paper, never on it, so it reads in
 * both themes. Decorative, like EmptyPlate: the form says what the screen is for.
 */
export function AuthPlatePanel({ art }: { art: AuthArtName }) {
  const { plate } = useT().account;
  const image = AUTH_ART[art];
  return (
    <aside
      aria-hidden
      data-auth-art={art}
      className="theme-dark app-band sticky top-[calc(3.5rem+var(--safe-top))] hidden h-[calc(100dvh-3.5rem-var(--safe-top))] content-center justify-items-center gap-8 self-start overflow-hidden px-12 py-12 text-ink lg:grid"
    >
      <span className="rm-plate block w-full max-w-[30rem] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- a static plate, like EmptyPlate */}
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt=""
          decoding="async"
          className="rm-plate-img block aspect-square h-auto max-h-[62dvh] w-full object-cover"
        />
      </span>
      <p
        className="rm-rise-in max-w-[24rem] text-center font-serif text-[22px] leading-8 text-balance text-ink-soft italic"
        style={step(1)}
      >
        {plate[art].line}
      </p>
    </aside>
  );
}

/** Below lg: a short strip of the same paper above the form, without the line. */
export function AuthPlateStrip({ art }: { art: AuthArtName }) {
  const image = AUTH_ART[art];
  return (
    <span
      aria-hidden
      data-auth-art={art}
      className="rm-plate block h-[140px] overflow-hidden lg:hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a static plate, like EmptyPlate */}
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt=""
        decoding="async"
        className="rm-plate-img block h-full w-full object-cover"
      />
    </span>
  );
}
