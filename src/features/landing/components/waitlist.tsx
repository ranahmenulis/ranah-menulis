import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EnterTitle } from "./enter-title";
import { LANDING_IMAGES } from "../assets";
import { Eyebrow, Wrap } from "./layout";
import { Plate } from "./plate";
import { ScrollDrift } from "./scroll-drift";
import { WaitlistForm } from "./waitlist-form";

/**
 * Closing section (client image 1 for the words, the brief's black background). It always uses the
 * dark tokens (`theme-dark`), so the band is black in both themes (user decision, 20 Nov 2026,
 * replacing the inverted band of 16 Nov): the moonlit clouds behind it only work on a dark ground.
 * The painting drifts slowly behind the right side and fades out to the left.
 * The headline runs full width at hero size as the page's closing statement, and is the landing's
 * one arrival moment: it rises like the hero title once it comes into view (DESIGN.md 4.6). Below it, the four
 * pillars are a numbered list (the same 01-04 voice as the Studio legend) and the waitlist form
 * sits on a panel so it reads as one object. The landing is pre-launch, so the form is the way in.
 */
export function Waitlist({ waitlist }: { waitlist: Dictionary["landing"]["waitlist"] }) {
  const moon = LANDING_IMAGES.moonClouds;
  return (
    <section
      id="daftar"
      aria-labelledby="wait-h"
      data-enter
      className="theme-dark relative isolate mt-20 overflow-hidden bg-canvas py-20 text-ink md:mt-40 md:pt-28 md:pb-32"
    >
      <ScrollDrift
        range={50}
        zoom={1.06}
        className="lp-moon top-0 right-0 h-full w-[min(1100px,100%)]"
      >
        <Plate image={moon} className="lp-photo object-[60%_50%]" />
      </ScrollDrift>
      <Wrap>
        <Eyebrow>{waitlist.eyebrow}</Eyebrow>
        <EnterTitle
          as="h2"
          trigger="view"
          id="wait-h"
          text={waitlist.title}
          className="max-w-[14ch] display"
        />
        <div className="mt-12 grid gap-12 border-t border-line pt-10 md:mt-16 md:grid-cols-12 md:gap-x-6 md:pt-12">
          <div className="grid content-start gap-8 md:col-span-5">
            <div className="grid gap-4">
              <p className="text-lg leading-7 text-pretty text-ink-muted md:text-xl md:leading-8">
                {waitlist.intro}
              </p>
              <p className="text-sm text-ink-muted">{waitlist.note}</p>
            </div>
            <ol
              aria-label={waitlist.pillarsLabel}
              className="m-0 list-none p-0 max-md:grid max-md:grid-cols-2 max-md:gap-x-4"
            >
              {waitlist.pillars.map((p, i) => (
                <li
                  key={p}
                  className="flex items-baseline gap-3 border-t border-line py-3 last:border-b md:gap-5 md:py-4 max-md:[&:nth-last-child(2)]:border-b"
                >
                  <span aria-hidden className="w-8 text-sm text-ink-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-6 font-semibold md:text-lg md:leading-7">
                    {p}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {/* A hairline frame over a veil, so the form stays readable on the painting. */}
          <div className="border border-line bg-canvas/70 p-5 backdrop-blur-md md:col-span-6 md:col-start-7 md:p-8">
            <WaitlistForm />
          </div>
        </div>
      </Wrap>
    </section>
  );
}
