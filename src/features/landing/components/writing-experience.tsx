import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Eyebrow, Grid, Section, SectionTop, Wrap } from "./layout";
import { PreviewFrame, Tag } from "./previews/preview-frame";
import { MARKERS } from "./studio-markers";
import { StudioMockup } from "./studio-mockup";

// Writing templates are Phase 2 (STD-05), so that entry says so (0-based place in the copy).
const LATER = new Set([3]);
// Legend entries with a pin on the mockup (1-based), so hovering them can light that pin.
const MARKED = new Set<number>(Object.values(MARKERS));

/**
 * Ranah Studio (client image 3) as an annotated product shot: numbered pins on the mockup point
 * to an editorial legend underneath (01-06, hairlines only, no boxes), so each feature is named
 * next to the part of the screen that shows it. Hovering an entry with a pin lights that pin and
 * dims the others (globals.css, "Studio legend"). Then one centred way in.
 */
export function WritingExperience({ copy }: { copy: Dictionary["landing"]["studio"] }) {
  return (
    <Section id="studio" aria-labelledby="studio-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="studio-h" className="landing-h2 md:col-span-7">
              {copy.title}
            </h2>
            <p className="mt-4 text-lg leading-7 text-pretty text-ink-muted md:col-span-4 md:col-start-9 md:mt-2">
              {copy.lead}
            </p>
          </SectionTop>
          <PreviewFrame label={copy.mockup} className="mt-10 md:col-span-12 md:mt-16">
            <StudioMockup />
          </PreviewFrame>
          <ol className="m-0 mt-10 grid list-none grid-cols-1 gap-x-6 p-0 sm:grid-cols-2 md:col-span-12 md:mt-14 lg:grid-cols-3">
            {copy.features.map((f, i) => (
              <li
                key={f.name}
                data-marker-for={MARKED.has(i + 1) ? i + 1 : undefined}
                className="grid content-start gap-2 border-t border-line pt-5 pb-8"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="text-[32px] leading-none font-semibold tracking-[-0.03em] tabular-nums"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {LATER.has(i) && <Tag>{copy.soon}</Tag>}
                </div>
                <h3 className="mt-2 text-lg leading-6 font-semibold">{f.name}</h3>
                <p className="max-w-[36ch] text-sm leading-[22px] text-ink-muted">{f.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex justify-center md:col-span-12 md:mt-6">
            <ButtonLink href="/daftar" size="hero" className="lp-btn w-full sm:w-auto">
              {copy.cta}
              <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          </div>
        </Grid>
      </Wrap>
    </Section>
  );
}
