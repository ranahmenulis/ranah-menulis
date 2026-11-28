"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { HERO_PLATE } from "../assets";
import { heroDrift, heroProgress, registerDrift, setVars } from "../motion/scroll-drift";
import { Wrap } from "./layout";
import { StudioFeatures } from "./studio-features";
import { StudioStage } from "./studio-stage";

/**
 * The hero's stage: from md one wide card with the London Institution engraving filling it
 * (assets.ts; slate-tinted in light mode, as printed in dark mode; user, 28 Nov 2026) and the
 * real Studio editor lifted on it; on a phone no card and no engraving, the editor alone from
 * edge to edge, nearly a screen tall (user, 24 Nov 2026). One caption under it, then the Studio
 * feature names. As the stage scrolls into place the editor lifts and the engraving drifts the
 * other way (`--lift`, `--par`, globals.css "Landing stage"); without landing motion both stand
 * at rest. `#studio` is the top bar's Studio link and the Studio card's way in.
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
    <Wrap className="mt-14 md:mt-20">
      <div
        ref={ref}
        id="studio"
        aria-label={studio.eyebrow}
        role="region"
        className="lp-band relative isolate md:overflow-hidden md:rounded-2xl md:border md:border-line md:bg-surface md:bg-linear-to-b md:from-accent-subtle md:to-surface md:px-6 md:pt-16 md:pb-12 md:shadow-card lg:px-10"
      >
        <div
          aria-hidden
          className="lp-plate absolute inset-0 -z-10 hidden overflow-hidden md:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- a resized WebP styled with CSS blends; the optimizer adds nothing */}
          <img
            src={HERO_PLATE.src}
            width={HERO_PLATE.width}
            height={HERO_PLATE.height}
            alt=""
            decoding="async"
            className="size-full object-cover object-[50%_30%]"
          />
        </div>
        <figure
          role="img"
          aria-label={studio.mockup}
          className="lp-device m-0 flex h-[min(600px,calc(100svh-6rem))] flex-col overflow-hidden border-y border-line bg-surface max-md:-mx-4 md:mx-auto md:h-auto md:max-w-270 md:rounded-2xl md:border md:shadow-float"
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
