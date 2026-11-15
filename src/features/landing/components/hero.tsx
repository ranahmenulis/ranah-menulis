import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EnterTitle } from "./enter-title";
import { HeroVideo } from "./hero-video";
import { Eyebrow, Grid, Wrap } from "./layout";

export function Hero({ copy }: { copy: Dictionary["landing"]["hero"] }) {
  return (
    <section aria-labelledby="hero-h" data-enter className="pt-8 md:pt-20">
      <Wrap>
        <Grid>
          <Eyebrow className="md:mb-8!">{copy.eyebrow}</Eyebrow>
          <EnterTitle id="hero-h" text={copy.title} className="display md:col-span-10" />
          <p
            data-enter-item
            style={{ "--i": 0 } as CSSProperties}
            className="mt-5 max-w-[600px] text-lg leading-7 text-pretty text-ink-muted md:col-span-7 md:mt-8 md:text-xl md:leading-8"
          >
            {copy.lead}
          </p>
          <div
            data-enter-item
            style={{ "--i": 1 } as CSSProperties}
            className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center md:col-span-12 md:mt-10"
          >
            <ButtonLink id="hero-cta" href="#daftar" size="hero" className="lp-btn">
              {copy.cta}
            </ButtonLink>
            <ButtonLink href="#ekosistem" variant="secondary" size="hero" className="lp-press">
              {copy.secondary}
            </ButtonLink>
          </div>
          <HeroVideo label={copy.ariaLabel} />
        </Grid>
      </Wrap>
    </section>
  );
}
