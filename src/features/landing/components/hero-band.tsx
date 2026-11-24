"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LANDING_IMAGES } from "../assets";
import { heroDrift, heroProgress, registerDrift, setVars } from "../motion/scroll-drift";
import { Wrap } from "./layout";
import { Plate } from "./plate";
import { StudioFeatures } from "./studio-features";
import { StudioMockup } from "./studio-mockup";

/**
 * The hero's stage (tahap H): one wide card on the accent-subtle ground, with the London Institution
 * engraving tinted slate behind it (`lp-tint`), the Studio editor lifted over it and the six feature
 * names under it. As the stage scrolls into place the engraving settles (a little upward, a little
 * smaller) while the editor lifts the other way; `--par`, `--sc` and `--lift` carry that to the
 * transforms in globals.css ("Landing plates"). Without landing motion both stand at rest.
 * `#studio` is the top bar's Studio link.
 */
export function HeroBand({ studio }: { studio: Dictionary["landing"]["studio"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const image = LANDING_IMAGES.londonLibrary;

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
        className="lp-band relative isolate overflow-hidden rounded-2xl border border-line bg-accent-subtle px-3 pt-8 pb-8 shadow-card md:px-10 md:pt-16 md:pb-12"
      >
        <div aria-hidden className="lp-relief absolute inset-0 -z-10 overflow-hidden">
          <Plate
            image={image}
            className="lp-photo lp-tint h-[118%] w-full object-cover object-[50%_62%]"
          />
        </div>
        <figure
          role="img"
          aria-label={studio.mockup}
          className="lp-device m-0 mx-auto max-w-[920px] overflow-hidden rounded-2xl border border-line bg-canvas shadow-float"
        >
          <StudioMockup />
        </figure>
        <StudioFeatures copy={studio} />
      </div>
    </Wrap>
  );
}
