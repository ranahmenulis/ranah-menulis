"use client";

import { useEffect, useRef } from "react";
import { LANDING_IMAGES } from "../assets";
import { heroDrift, heroProgress, registerDrift, setVars } from "../motion/scroll-drift";
import { HeroVideo } from "./hero-video";
import { Plate } from "./plate";

/**
 * The hero's picture (DESIGN.md 4.6, hero C2): an engraving of the London Institution library
 * rises from the bottom of the page with the editor video set over it. As the band scrolls into
 * place the engraving settles (a little upward, a little smaller) while the editor lifts the other
 * way; `--par`, `--sc` and `--lift` carry that to the transforms in globals.css ("Landing plates").
 * Without landing motion the variables are never set and both stand at rest.
 */
export function HeroBand({ label }: { label: string }) {
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
    // `isolate`: the editor's z-10 only lifts it over the engraving inside this band. Without it the
    // editor (later in the DOM) painted over the sticky top bar's z-10 and the phone menu sheets
    // that live inside it.
    <div ref={ref} className="lp-band relative isolate pb-14 md:pb-[clamp(56px,9vw,120px)]">
      <div className="lp-relief absolute inset-x-0 top-[26%] bottom-0 overflow-hidden md:top-[22%]">
        <Plate image={image} className="lp-photo h-[118%] w-full object-cover object-[50%_62%]" />
      </div>
      <HeroVideo
        label={label}
        className="lp-device z-10 mx-auto w-[min(400px,82%)] md:w-[min(1000px,92%)]"
        figureClassName="lp-device-frame"
      />
    </div>
  );
}
