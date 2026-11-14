import { ButtonLink } from "@/components/ui/button";
import { heroLead, heroTitle } from "../copy";
import { HeroStage } from "./hero-stage";
import { Grid, Wrap } from "./layout";

export function Hero() {
  return (
    <section aria-labelledby="hero-h" className="pt-10 md:pt-24">
      <Wrap>
        <Grid>
          <h1 id="hero-h" className="display md:col-span-9">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-[560px] font-serif text-xl leading-7 text-pretty text-ink-muted md:col-span-6 md:mt-8 md:text-[22px] md:leading-8">
            {heroLead}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 md:col-span-12 md:mt-10">
            <ButtonLink id="hero-cta" href="#daftar" size="hero" className="w-full md:w-auto">
              Gabung daftar tunggu
            </ButtonLink>
            <ButtonLink href="#cara-kerja" variant="text">
              Lihat cara kerjanya
            </ButtonLink>
          </div>
          <HeroStage />
        </Grid>
      </Wrap>
    </section>
  );
}
