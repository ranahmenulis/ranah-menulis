import type { Icon } from "@phosphor-icons/react";
import {
  ArrowRight,
  BookOpenText,
  Books,
  ChalkboardTeacher,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { SectionIcon } from "@/components/ui/section-card";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { CoverStack } from "./cover-stack";
import { Section, SectionHead, Wrap } from "./layout";

// Anthology, solo book, class, contest: the four Projects paths in the client's order.
const ICONS: Icon[] = [Books, BookOpenText, ChalkboardTeacher, Trophy];

/**
 * Publishing (client image 2; client, 24 Nov 2026): two columns. On the left the title, one
 * sentence, the four Projects paths each with one line of what it gives, and one way in; on the
 * right the four paths as the app draws them, project covers from the Projects catalog on the
 * app's hero-card ground (the bookshelf behind them was removed: it competed with the covers).
 */
export function Publishing({ copy }: { copy: Dictionary["landing"]["publishing"] }) {
  return (
    <Section id="penerbitan" aria-labelledby="pub-h">
      <Wrap className="grid items-center gap-12 md:grid-cols-12 md:gap-6">
        <div className="grid content-start gap-10 md:col-span-5 md:gap-12">
          <SectionHead id="pub-h" title={copy.title} lead={copy.lead} align="start" />
          <ul className="m-0 grid list-none gap-5 p-0 md:gap-6">
            {copy.paths.map(({ name, benefit }, i) => (
              <li key={name} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4">
                <SectionIcon icon={ICONS[i]} />
                <div className="grid gap-0.5">
                  <span className="text-lg leading-7 font-semibold md:text-xl">{name}</span>
                  <span className="text-base leading-6 text-pretty text-ink-muted">{benefit}</span>
                </div>
              </li>
            ))}
          </ul>
          <ButtonLink
            href="#daftar"
            size="hero"
            className="lp-btn w-full sm:w-auto sm:justify-self-start"
          >
            {copy.cta}
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
        </div>
        <figure
          role="img"
          aria-label={copy.covers}
          className="relative isolate m-0 flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface bg-linear-to-br from-surface from-30% to-accent-subtle px-5 py-10 shadow-card md:col-span-7 md:min-h-[560px] md:px-10 md:py-14"
        >
          <CoverStack />
        </figure>
      </Wrap>
    </Section>
  );
}
