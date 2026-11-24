import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LANDING_IMAGES } from "../assets";
import { EnterTitle } from "./enter-title";
import { Eyebrow, Section, Wrap } from "./layout";
import { Plate } from "./plate";
import { ScrollDrift } from "./scroll-drift";
import { WaitlistForm } from "./waitlist-form";

/**
 * Closing card (client image 1 for the words, tahap H for the shape). The section always uses the
 * dark tokens (`theme-dark`), and the card is the dark slate ground with Baade's moonlit clouds
 * drifting slowly behind its right side: the painting only works on a dark ground. The headline is
 * the page's closing statement and its arrival moment: it rises like the hero title once it comes
 * into view (DESIGN.md 4.6). Under it one sentence and the four pillars as a checked list on the left, the
 * waitlist form on its own panel on the right. The landing is pre-launch, so the form is the way in.
 */
export function Waitlist({ waitlist }: { waitlist: Dictionary["landing"]["waitlist"] }) {
  const moon = LANDING_IMAGES.moonClouds;
  return (
    <Section id="daftar" aria-labelledby="wait-h" data-enter className="theme-dark">
      <Wrap>
        <div className="relative isolate overflow-hidden rounded-2xl bg-canvas bg-linear-to-br from-accent-subtle to-canvas to-60% px-5 py-14 text-ink md:px-14 md:py-24">
          <ScrollDrift
            range={50}
            zoom={1.06}
            className="lp-moon top-0 right-0 h-full w-[min(1100px,100%)]"
          >
            <Plate image={moon} className="lp-photo object-[60%_50%]" />
          </ScrollDrift>
          <Eyebrow>{waitlist.eyebrow}</Eyebrow>
          <EnterTitle
            as="h2"
            trigger="view"
            id="wait-h"
            text={waitlist.title}
            className="max-w-[14ch] display"
          />
          <div className="mt-12 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-x-6">
            <div className="grid content-start gap-8 md:col-span-5">
              <p className="text-lg leading-7 text-pretty text-ink-muted md:text-xl md:leading-8">
                {waitlist.intro}
              </p>
              <ul
                aria-label={waitlist.pillarsLabel}
                className="m-0 grid list-none gap-4 border-t border-line p-0 pt-8"
              >
                {waitlist.pillars.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-base leading-6 font-semibold">
                    <CheckCircle
                      size={20}
                      weight="fill"
                      aria-hidden
                      className="mt-0.5 shrink-0 text-accent-ink"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-surface/80 p-5 backdrop-blur-md md:col-span-6 md:col-start-7 md:p-8">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
