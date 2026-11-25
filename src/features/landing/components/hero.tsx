import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EnterTitle } from "./enter-title";
import { HeroBand } from "./hero-band";
import { Wrap } from "./layout";

/**
 * Hero (25 Nov 2026, Fahmi and Wafiy: the tahap H hero read as a template). Plain, after the Notion
 * and Novlr references: no pill, no tinted sky, no serif accent line. The client's title in two
 * lines of one face and one ink, one short sentence, a filled button and a grey pill. Then the
 * stage (`HeroBand`): the Studio editor, the only place the landing shows Studio.
 */
export function Hero({ copy, studio }: { copy: Dictionary["landing"]["hero"]; studio: Studio }) {
  return (
    <section aria-labelledby="hero-h" data-enter className="relative isolate">
      <Wrap className="grid justify-items-center pt-16 text-center md:pt-28">
        <EnterTitle id="hero-h" lines={copy.titleLines} className="lp-hero-title text-ink" />
        <p
          data-enter-item
          style={{ "--i": 0 } as CSSProperties}
          className="mt-6 max-w-3xl text-[17px] leading-[1.6] text-pretty text-ink-muted md:mt-7 md:text-xl md:leading-[1.5]"
        >
          {copy.lead}
        </p>
        <div
          data-enter-item
          style={{ "--i": 1 } as CSSProperties}
          className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row md:mt-9"
        >
          <ButtonLink id="hero-cta" href="#daftar" size="hero" className="lp-btn w-full sm:w-auto">
            {copy.cta}
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <ButtonLink
            href="#ekosistem"
            variant="text"
            size="hero"
            className="w-full bg-subtle px-7! text-ink! hover:bg-line active:no-underline sm:w-auto"
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
