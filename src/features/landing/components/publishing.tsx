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
import { LANDING_IMAGES } from "../assets";
import { CoverStack } from "./cover-stack";
import { Section, SectionHead, Wrap } from "./layout";
import { Plate } from "./plate";
import { ScrollDrift } from "./scroll-drift";

// Anthology, solo book, class, contest: the four Projects paths in the client's order.
const ICONS: Icon[] = [Books, BookOpenText, ChalkboardTeacher, Trophy];

/**
 * Publishing (client image 2, tahap H): two columns. On the left the title, one sentence, the four
 * Projects paths as names only, and one way in; on the right a still life of three covers in front
 * of a 1914 printing room that drifts slowly as it passes, set in a card. The room is a slate
 * duotone (`lp-duo`: its light and dark over the accent ground), like the hero's engraving.
 */
export function Publishing({ copy }: { copy: Dictionary["landing"]["publishing"] }) {
  const room = LANDING_IMAGES.printRoom;
  return (
    <Section id="penerbitan" aria-labelledby="pub-h">
      <Wrap className="grid items-center gap-12 md:grid-cols-12 md:gap-6">
        <div className="grid content-start gap-10 md:col-span-5 md:gap-12">
          <SectionHead id="pub-h" title={copy.title} lead={copy.lead} align="start" />
          <ul className="m-0 grid list-none gap-4 p-0 md:gap-5">
            {copy.paths.map((name, i) => (
              <li
                key={name}
                className="flex items-center gap-4 text-lg leading-7 font-semibold md:text-xl"
              >
                <SectionIcon icon={ICONS[i]} />
                {name}
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
          className="relative isolate m-0 flex min-h-[420px] items-end justify-center overflow-hidden rounded-2xl border border-line bg-accent px-4 pt-14 pb-12 shadow-card md:col-span-7 md:min-h-[560px] md:pb-20"
        >
          <ScrollDrift range={40} zoom={[1.14, 1.06]} className="lp-duo inset-0">
            <Plate image={room} className="lp-photo" />
          </ScrollDrift>
          <span aria-hidden className="lp-press-shade" />
          <CoverStack titles={copy.coverTitles} />
        </figure>
      </Wrap>
    </Section>
  );
}
