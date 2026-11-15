import { Wordmark } from "@/components/ui/logo";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Grid, Wrap } from "./layout";
import { WaitlistForm } from "./waitlist-form";

/** Bagian daftar tunggu: dibalik (memakai set token tema lawan) agar menjadi penutup yang tegas. */
export function Waitlist({ waitlist }: { waitlist: Dictionary["landing"]["waitlist"] }) {
  return (
    <section
      id="daftar"
      aria-labelledby="wait-h"
      className="theme-invert mt-20 bg-canvas py-20 text-ink md:mt-40 md:py-40"
    >
      <Wrap>
        <Grid>
          <div className="grid content-start gap-6 md:col-span-5">
            <Wordmark height={40} />
            <h2 id="wait-h" className="landing-h2">
              {waitlist.title}
            </h2>
            <p className="font-serif text-xl leading-7 text-ink-muted md:text-[22px] md:leading-8">
              {waitlist.intro}
            </p>
          </div>
          <WaitlistForm />
        </Grid>
      </Wrap>
    </section>
  );
}
