"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { heroDrift, heroProgress, registerDrift, setVars } from "../motion/scroll-drift";
import { Wrap } from "./layout";
import { StudioFeatures } from "./studio-features";
import { StudioStage } from "./studio-stage";

/**
 * The hero's stage: one wide card with the app's hero-card ground (surface into accent-subtle),
 * the real Studio editor lifted on it (client, 24 Nov 2026: the landing shows the app itself), one
 * caption under it, then the Studio feature names. As the stage scrolls into place the editor
 * lifts a little (`--lift`, globals.css "Landing plates"); without landing motion it stands at
 * rest. `#studio` is the top bar's Studio link and the Studio card's way in.
 */
export function HeroBand({ studio }: { studio: Dictionary["landing"]["studio"] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = ref.current;
    if (!band) return;
    return registerDrift(() => {
      const { top } = band.getBoundingClientRect();
      setVars(band, heroDrift(heroProgress(top, window.innerHeight)));
    });
  }, []);

  return (
    <Wrap className="mt-16 md:mt-24">
      <div
        ref={ref}
        id="studio"
        aria-label={studio.eyebrow}
        role="region"
        className="lp-band relative isolate overflow-hidden rounded-2xl border border-line bg-surface bg-linear-to-b from-accent-subtle to-surface px-3 pt-8 pb-8 shadow-card md:px-6 md:pt-16 md:pb-12 lg:px-10"
      >
        <figure
          role="img"
          aria-label={studio.mockup}
          className="lp-device m-0 mx-auto max-w-270 overflow-hidden rounded-2xl border border-line bg-surface shadow-float"
        >
          <StudioStage />
        </figure>
        <p className="mx-auto mt-6 max-w-[46ch] text-center text-base leading-6 text-pretty text-ink-muted md:mt-8 md:text-lg md:leading-7">
          {studio.caption}
        </p>
        <StudioFeatures copy={studio} />
      </div>
    </Wrap>
  );
}
