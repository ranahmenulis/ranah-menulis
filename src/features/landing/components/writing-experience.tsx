import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LANDING_IMAGES } from "../assets";
import { Eyebrow, Grid, Section, SectionTop, Wrap } from "./layout";
import { Plate } from "./plate";
import { PreviewFrame } from "./previews/preview-frame";
import { Reveal } from "./reveal";
import { StudioLegend } from "./studio-legend";
import { StudioMockup } from "./studio-mockup";

/**
 * Ranah Studio (client image 3) as an annotated product shot: numbered pins on the mockup point
 * to an editorial legend underneath (01-06, hairlines only, no boxes), so each feature is named
 * next to the part of the screen that shows it. Hovering an entry with a pin lights that pin and
 * dims the others (globals.css, "Studio legend"). A small Holbein plate sits above the lead. Then
 * one centred way in.
 */
export function WritingExperience({
  copy,
  images,
}: {
  copy: Dictionary["landing"]["studio"];
  images: Dictionary["landing"]["images"];
}) {
  const plate = LANDING_IMAGES.holbeinHand;
  return (
    <Section id="studio" aria-labelledby="studio-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="studio-h" className="landing-h2 md:col-span-7">
              {copy.title}
            </h2>
            <div className="mt-4 grid content-start gap-5 md:col-span-4 md:col-start-9 md:mt-2">
              <Reveal kind="plate" className="w-28">
                <Plate
                  image={plate}
                  width={112}
                  height={150}
                  alt={images.holbein}
                  className="lp-photo h-[150px] w-28 object-cover object-[50%_30%]"
                />
              </Reveal>
              <p className="text-lg leading-7 text-pretty text-ink-muted">{copy.lead}</p>
            </div>
          </SectionTop>
          <PreviewFrame label={copy.mockup} className="mt-10 md:col-span-12 md:mt-16">
            <StudioMockup />
          </PreviewFrame>
          <StudioLegend copy={copy} />
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
