import { trust } from "../copy";
import { Grid, Section, SectionTop, Wrap } from "./layout";

export function Trust() {
  return (
    <Section aria-label="Janji kepada penulis">
      <Wrap>
        <Grid>
          <SectionTop>
            {trust.map((t) => (
              <div
                key={t.title}
                className="border-b border-line py-8 first:pt-0 last:border-b-0 md:grid md:grid-cols-12 md:gap-x-6 md:py-12 md:first:pt-0"
              >
                <h3 className="landing-h2 md:col-span-7">{t.title}</h3>
                <p className="mt-3 text-base leading-6 text-ink-muted md:col-span-4 md:col-start-9 md:mt-2">
                  {t.text}
                </p>
              </div>
            ))}
          </SectionTop>
        </Grid>
      </Wrap>
    </Section>
  );
}
