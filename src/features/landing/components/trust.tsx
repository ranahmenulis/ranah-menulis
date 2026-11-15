import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Grid, Section, SectionTop, Wrap } from "./layout";
import { PromiseStatement } from "./promise-statement";

/** The three promises as one statement (the page's moment), each explained in one short line. */
export function Trust({ trust }: { trust: Dictionary["landing"]["trust"] }) {
  const statement = trust.map((t) => t.title).join(" ");
  return (
    <Section aria-labelledby="trust-h">
      <Wrap>
        <Grid>
          <SectionTop>
            <PromiseStatement id="trust-h" text={statement} />
            <dl className="mt-12 grid gap-8 md:mt-20 md:grid-cols-3 md:gap-6">
              {trust.map((t) => (
                <div key={t.label} className="grid content-start gap-2 border-t border-line pt-5">
                  <dt className="text-sm font-medium text-ink">{t.label}</dt>
                  <dd className="m-0 text-base leading-6 text-ink-muted">{t.text}</dd>
                </div>
              ))}
            </dl>
          </SectionTop>
        </Grid>
      </Wrap>
    </Section>
  );
}
