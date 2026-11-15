import { faq } from "../copy";
import { Grid, Section, SectionTop, Wrap } from "./layout";

/**
 * Every answer open, no accordion (design-taste-frontend: FAQs show every answer; nothing
 * animates height). The short v2 copy keeps the list at four questions.
 */
export function Faq() {
  return (
    <Section id="tanya-jawab" aria-labelledby="faq-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <h2 id="faq-h" className="landing-h2 md:col-span-4">
              Tanya jawab
            </h2>
            <dl className="mt-6 border-t border-line md:col-span-8 md:col-start-5 md:mt-0">
              {faq.map((f) => (
                <div key={f.question} className="border-b border-line py-5 md:py-6">
                  <dt className="font-serif text-xl leading-7 text-ink md:text-[22px] md:leading-8">
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
