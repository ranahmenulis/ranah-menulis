import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BookCover } from "@/components/ui/book-cover";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Eyebrow, Grid, Section, SectionTop, Wrap } from "./layout";

/**
 * Publishing (client image 2): the four Projects paths beside a still life of covers, then a way
 * in. Names and sentences are the client's.
 */
export function Publishing({ copy }: { copy: Dictionary["landing"]["publishing"] }) {
  const [left, middle, right] = copy.coverTitles;
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
            className="m-0 mt-10 flex items-end justify-center gap-2.5 bg-subtle px-4 pt-12 pb-10 md:col-span-6 md:mt-16 md:gap-5 md:pt-20 md:pb-16"
          >
            <BookCover title={left} width={80} className="md:hidden" />
            <BookCover title={left} width={128} className="max-md:hidden" />
            <BookCover title={middle} width={116} className="-translate-y-4 md:hidden" />
            <BookCover title={middle} width={184} className="-translate-y-6 max-md:hidden" />
            <BookCover title={right} width={80} className="md:hidden" />
            <BookCover title={right} width={128} className="max-md:hidden" />
          </figure>
          <div className="mt-8 md:col-span-5 md:col-start-8 md:mt-16">
            <h3 className="mb-4 text-xl leading-7 font-semibold text-balance">{copy.pathsTitle}</h3>
            <ul className="m-0 list-none border-t border-line-strong p-0">
              {copy.paths.map((p) => (
                <li key={p.name} className="border-b border-line py-5">
                  <h4 className="text-lg leading-7 font-semibold">{p.name}</h4>
                  <p className="mt-1 text-base leading-6 text-ink-muted">{p.text}</p>
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
