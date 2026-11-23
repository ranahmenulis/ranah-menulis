"use client";

import type { CSSProperties } from "react";
import { LetterQuill } from "@/components/illustrations/letter-art";
import { heroCardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import type { AuthArtName } from "../auth-art";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * From lg: a hero card beside the form holding the letter and quill, and one serif line under it.
 * Decorative: the form says what the screen is for.
 */
export function AuthPlatePanel({ art }: { art: AuthArtName }) {
  const { plate } = useT().account;
  return (
    <aside
      aria-hidden
      data-auth-art={art}
      className={cn(
        heroCardClass,
        "sticky top-[calc(5rem+var(--safe-top))] hidden h-[calc(100dvh-7rem-var(--safe-top))] content-center justify-items-center gap-8 self-start px-12 lg:grid",
      )}
    >
      <LetterQuill className="h-auto w-full max-w-[30rem]" />
      <p
        className="rm-rise-in max-w-[24rem] text-center font-serif text-[22px] leading-8 text-balance text-ink-soft italic"
        style={step(1)}
      >
        {plate[art].line}
      </p>
    </aside>
  );
}

/** Below lg: a band of the same art across the top of the form card, without the line. */
export function AuthPlateStrip({ art }: { art: AuthArtName }) {
  return (
    <div
      aria-hidden
      data-auth-art={art}
      className="-mx-5 -mt-5 mb-6 h-32 overflow-hidden rounded-t-2xl bg-linear-to-br from-surface from-40% to-accent-subtle md:-mx-6 md:-mt-6 lg:hidden"
    >
      <LetterQuill className="mx-auto h-full w-auto" />
    </div>
  );
}
