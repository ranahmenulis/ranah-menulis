import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Section, SectionHead, Wrap } from "./layout";

/**
 * Four short questions as cards in two columns (tahap H), every answer open: no accordion
 * (design-taste-frontend: FAQs show every answer; nothing animates height).
 */
export function Faq({ title, items }: { title: string; items: Dictionary["landing"]["faq"] }) {
  return (
    <Section id="tanya-jawab" aria-labelledby="faq-h">
      <Wrap>
        <SectionHead id="faq-h" title={title} />
        <dl className="m-0 mt-12 grid gap-4 md:mt-16 md:grid-cols-2 md:gap-6">
          {items.map((f) => (
            <div
              key={f.question}
              className="rounded-2xl border border-line bg-surface p-6 shadow-card md:p-8"
            >
              <dt className="text-lg leading-7 font-semibold text-ink">{f.question}</dt>
              <dd className="m-0 mt-3 text-base leading-[26px] text-ink-muted">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </Wrap>
    </Section>
  );
}
