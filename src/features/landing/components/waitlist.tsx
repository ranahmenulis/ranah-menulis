import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EnterTitle } from "./enter-title";
import { Eyebrow, Wrap } from "./layout";
import { WaitlistForm } from "./waitlist-form";

/**
 * Closing section (client image 1 for the words, the brief's black background). It uses the
 * opposite theme's tokens, so it is black in light mode and white in dark mode and always stands
 * apart from the page (user decision 16 Nov 2026).
 * The headline runs full width at hero size as the page's closing statement, and is the landing's
 * one arrival moment: it rises like the hero title once it comes into view (DESIGN.md 4.6). Below it, the four
 * pillars are a numbered list (the same 01-04 voice as the Studio legend) and the waitlist form
 * sits on a panel so it reads as one object. The landing is pre-launch, so the form is the way in.
 */
export function Waitlist({ waitlist }: { waitlist: Dictionary["landing"]["waitlist"] }) {
  return (
    <section
      id="daftar"
      aria-labelledby="wait-h"
      data-enter
      className="theme-invert mt-20 bg-canvas py-20 text-ink md:mt-40 md:py-28"
    >
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
            <ol aria-label={waitlist.pillarsLabel} className="m-0 list-none p-0">
              {waitlist.pillars.map((p, i) => (
                <li
                  key={p}
                  className="flex items-baseline gap-5 border-t border-line py-4 last:border-b"
                >
                  <span aria-hidden className="w-8 text-sm text-ink-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg leading-7 font-semibold">{p}</span>
                </li>
              ))}
            </ol>
          </div>
          {/* A hairline frame, not a fill: the interest chips are already bg-subtle. */}
          <div className="border border-line p-5 md:col-span-6 md:col-start-7 md:p-8">
            <WaitlistForm />
          </div>
        </div>
      </Wrap>
    </section>
  );
}
