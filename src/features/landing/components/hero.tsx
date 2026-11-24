import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EnterTitle } from "./enter-title";
import { HeroBand } from "./hero-band";
import { Wrap } from "./layout";

// Per line: the middle one is the serif italic in the accent ink.
const LINE_CLASSES = ["", "lp-hero-serif text-accent-ink", ""];

/**
 * Hero (tahap H, 24 Nov 2026): centred and quiet, after the Novlr reference the user sent. One
 * pill (the eyebrow and the two countries), the client's three-line title, one sentence, one
 * filled button and one text link. Then the stage (`HeroBand`): the Studio editor on a tinted
 * engraving, the only place the landing shows Studio. A soft accent sky sits behind the top and
 * reaches up under the top bar, which stays clear until the page scrolls.
 */
export function Hero({ copy, studio }: { copy: Dictionary["landing"]["hero"]; studio: Studio }) {
  return (
    <section aria-labelledby="hero-h" data-enter className="relative isolate">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-24 -z-10 h-[min(880px,100vh)] bg-linear-to-b from-accent-subtle to-transparent"
      />
      <Wrap className="grid justify-items-center pt-14 text-center md:pt-24">
        <p className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 text-xs font-medium text-ink-muted shadow-card backdrop-blur">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          {copy.eyebrow}
          <span aria-hidden>·</span>
          {copy.colophon}
        </p>
        <EnterTitle
          id="hero-h"
          lines={copy.titleLines}
          lineClasses={LINE_CLASSES}
          className="lp-hero-title mt-8 md:mt-10"
        />
        <p
          data-enter-item
          style={{ "--i": 0 } as CSSProperties}
          className="mt-8 max-w-[40ch] text-[17px] leading-[1.6] text-pretty text-ink-muted md:mt-10 md:text-xl md:leading-[1.55]"
        >
          {copy.lead}
        </p>
        <div
          data-enter-item
          style={{ "--i": 1 } as CSSProperties}
          className="mt-9 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-7 md:mt-11"
        >
          <ButtonLink id="hero-cta" href="#daftar" size="hero" className="lp-btn w-full sm:w-auto">
            {copy.cta}
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <ButtonLink
            href="#ekosistem"
            variant="text"
            size="hero"
            className="text-ink! underline underline-offset-6"
          >
            {copy.secondary}
          </ButtonLink>
        </div>
      </Wrap>
      <HeroBand studio={studio} />
    </section>
  );
}

type Studio = Dictionary["landing"]["studio"];
