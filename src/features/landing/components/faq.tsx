import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LANDING_IMAGES } from "../assets";
import { Grid, Section, SectionTop, Wrap } from "./layout";
import { Plate } from "./plate";

/**
 * Every answer open, no accordion (design-taste-frontend: FAQs show every answer; nothing
 * animates height). The short v2 copy keeps the list at four questions. A caladium engraving
 * fills the empty left column under the title; on a phone it sits beside the title instead.
 */
export function Faq({
  title,
  items,
  images,
}: {
  title: string;
  items: Dictionary["landing"]["faq"];
  images: Dictionary["landing"]["images"];
}) {
  const leaf = LANDING_IMAGES.keladi;
  return (
    <Section id="tanya-jawab" aria-labelledby="faq-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <div className="grid grid-cols-[minmax(0,1fr)_7rem] items-end gap-4 md:col-span-4 md:grid-cols-1 md:content-start md:gap-7">
              <h2 id="faq-h" className="landing-h2">
                {title}
              </h2>
              <Plate
                image={leaf}
                alt={images.keladi}
                className="lp-photo lp-plate h-auto w-full md:max-w-[300px]"
              />
            </div>
            <dl className="mt-6 border-t border-line md:col-span-7 md:col-start-6 md:mt-0">
              {items.map((f) => (
                <div key={f.question} className="border-b border-line py-5 md:py-6">
                  <dt className="text-lg leading-7 font-semibold text-ink md:text-xl">
                    {f.question}
                  </dt>
                  <dd className="m-0 mt-2 max-w-[680px] text-base leading-[26px] text-ink-muted">
                    {f.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </SectionTop>
        </Grid>
      </Wrap>
    </Section>
  );
}
