"use client";

import type { Icon } from "@phosphor-icons/react";
import { ChartLineUp, Clock, Hash, Target, TextAa, Timer } from "@phosphor-icons/react/dist/ssr";
import { useRef, type CSSProperties } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useT } from "@/lib/i18n/provider";
import { useReveal } from "../motion/use-reveal";

/**
 * Six Studio features under the editor, named exactly as the app names them (user, 24 Nov 2026):
 * the labels come from the Studio dictionaries, so the landing never says a word the app does not.
 * Writing templates are not in the app yet, so the sprint timer takes their place. They pop in one
 * after another when the stage comes into view (globals.css, "Landing reveals"); without landing
 * motion they simply stand.
 */
export function StudioFeatures({ copy }: { copy: Dictionary["landing"]["studio"] }) {
  const { studioLayout, studioEditor, studioDocuments } = useT();
  const features: [string, Icon][] = [
    [studioLayout.toolbar.label, TextAa],
    [studioEditor.counter.label, Hash],
    [studioEditor.counter.readingTime, Clock],
    [studioEditor.target.label, Target],
    [studioEditor.sprint.title, Timer],
    [studioDocuments.tabs.statistics, ChartLineUp],
  ];
  const ref = useRef<HTMLUListElement>(null);
  useReveal(ref);
  return (
    <ul
      ref={ref}
      data-reveal="chips"
      aria-label={copy.featuresLabel}
      className="lp-chips m-0 mt-8 flex list-none flex-wrap justify-center gap-2 p-0 md:mx-auto md:mt-10 md:grid md:w-max md:grid-cols-3 md:gap-2.5"
    >
      {features.map(([name, Glyph], i) => (
        <li
          key={name}
          style={{ "--i": i } as CSSProperties}
          className="lp-chip inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink shadow-card lg:h-10 lg:px-3.5 lg:text-sm"
        >
          <Glyph size={16} weight="bold" aria-hidden className="text-accent-ink" />
          {name}
        </li>
      ))}
    </ul>
  );
}
