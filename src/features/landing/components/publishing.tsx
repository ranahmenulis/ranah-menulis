import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LANDING_IMAGES } from "../assets";
import { CoverStack } from "./cover-stack";
import { Eyebrow, Grid, Section, SectionTop, Wrap } from "./layout";
import { Plate } from "./plate";
import { ScrollDrift } from "./scroll-drift";

/**
 * Publishing (client image 2): the four Projects paths beside a still life of covers set in front
 * of a 1914 printing room that drifts slowly as it passes, then a way in. Names and sentences are
 * the client's. On a phone the four paths sit in two columns.
 */
export function Publishing({ copy }: { copy: Dictionary["landing"]["publishing"] }) {
  const room = LANDING_IMAGES.printRoom;
  return (
    <Section id="penerbitan" aria-labelledby="pub-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="pub-h" className="landing-h2 md:col-span-7">
              {copy.title}
            </h2>
            <p className="mt-4 text-lg leading-7 text-pretty text-ink-muted md:col-span-4 md:col-start-9 md:mt-2">
              {copy.lead}
            </p>
          </SectionTop>
          <figure
            role="img"
            aria-label={copy.covers}
            className="relative isolate m-0 mt-10 flex min-h-[420px] items-end justify-center overflow-hidden bg-subtle px-4 pt-12 pb-10 md:col-span-6 md:mt-16 md:self-start md:pt-20 md:pb-16"
          >
            <ScrollDrift range={40} zoom={[1.14, 1.06]} className="inset-0">
              <Plate image={room} className="lp-photo" />
            </ScrollDrift>
            <span aria-hidden className="lp-press-shade" />
            <CoverStack titles={copy.coverTitles} />
          </figure>
          <div className="mt-8 md:col-span-5 md:col-start-8 md:mt-16">
            <h3 className="mb-4 text-xl leading-7 font-semibold text-balance">{copy.pathsTitle}</h3>
            <ul className="m-0 list-none border-t border-line-strong p-0 max-md:grid max-md:grid-cols-2 max-md:gap-x-4">
              {copy.paths.map((p) => (
                <li key={p.name} className="border-b border-line py-4 md:py-5">
                  <h4 className="text-base leading-6 font-semibold md:text-lg md:leading-7">
                    {p.name}
                  </h4>
                  <p className="mt-1 text-sm leading-5 text-ink-muted md:text-base md:leading-6">
                    {p.text}
                  </p>
                </li>
              ))}
            </ul>
            <ButtonLink href="#daftar" size="hero" className="lp-btn mt-8 w-full sm:w-auto">
              {copy.cta}
              <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          </div>
        </Grid>
      </Wrap>
    </Section>
  );
}
