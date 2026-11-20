import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EnterTitle } from "./enter-title";
import { HeroBand } from "./hero-band";
import { Wrap } from "./layout";

// Per line: the middle one is the serif italic, indented from md up.
const LINE_CLASSES = ["", "lp-hero-serif md:pl-[1.05em]", ""];

/**
 * Hero C2 (user decision, 20 Nov 2026): an editorial opening instead of the centred pill, title and
 * two buttons. A mono colophon line, a three-line title set flush left, the four pillars on the
 * left and the pitch with one filled button and one text link on the right, then the picture
 * (`HeroBand`). The words are the client's; only the setting changed.
 */
export function Hero({
  copy,
  pillars,
  pillarsLabel,
}: {
  copy: Dictionary["landing"]["hero"];
  pillars: readonly string[];
  pillarsLabel: string;
}) {
  return (
    <section aria-labelledby="hero-h" data-enter>
      <Wrap className="pt-4 pb-10 md:pt-12 md:pb-[clamp(40px,6vw,72px)]">
        <div className="flex justify-between gap-4 border-t border-ink pt-2.5 font-mono text-[10.5px] leading-normal tracking-[0.02em] text-ink-muted md:pt-3 md:text-[11.5px]">
          <span>{copy.eyebrow}</span>
          <span>{copy.colophon}</span>
        </div>
        <EnterTitle
          id="hero-h"
          lines={copy.titleLines}
          lineClasses={LINE_CLASSES}
          className="lp-hero-title mt-10 md:mt-12"
        />
        <div className="mt-7 grid items-end gap-6 md:mt-14 md:grid-cols-12">
          <ol
            aria-label={pillarsLabel}
            className="m-0 hidden list-none gap-1.5 p-0 md:col-span-4 md:grid"
          >
            {pillars.map((pillar, i) => (
              <li key={pillar} className="flex gap-3 text-sm text-ink-muted">
                <b
                  aria-hidden
                  className="min-w-[22px] pt-0.5 font-mono text-[11.5px] font-medium text-ink"
                >
                  {String(i + 1).padStart(2, "0")}
                </b>
                {pillar}
              </li>
            ))}
          </ol>
          <div
            data-enter-item
            style={{ "--i": 0 } as CSSProperties}
            className="grid gap-6 md:col-span-6 md:col-start-7 md:gap-6"
          >
            <p className="max-w-[34ch] text-[17px] leading-[1.55] text-pretty text-ink-muted max-md:max-w-none md:text-[21px] md:leading-[1.5] md:text-ink">
              {copy.lead}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
              <ButtonLink
                id="hero-cta"
                href="#daftar"
                size="hero"
                className="lp-btn h-13! sm:w-auto"
              >
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
          </div>
        </div>
      </Wrap>
      <HeroBand label={copy.ariaLabel} />
    </section>
  );
}
