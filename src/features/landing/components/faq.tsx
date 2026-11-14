import { Accordion } from "@/components/ui/accordion";
import { faq } from "../copy";
import { Grid, Section, SectionTop, Wrap } from "./layout";

export function Faq() {
  return (
    <Section id="tanya-jawab" aria-labelledby="faq-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <h2 id="faq-h" className="landing-h2 md:col-span-4">
              Tanya jawab
            </h2>
            <div className="mt-6 md:col-span-8 md:col-start-5 md:mt-0">
              <Accordion
                openFirst
                items={faq.map((f) => ({ question: f.question, answer: <p>{f.answer}</p> }))}
              />
            </div>
          </SectionTop>
        </Grid>
      </Wrap>
    </Section>
  );
}
