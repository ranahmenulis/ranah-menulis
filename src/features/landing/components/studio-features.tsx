"use client";

import type { Icon } from "@phosphor-icons/react";
import { ChartLineUp, Clock, Files, Hash, Target, TextAa } from "@phosphor-icons/react/dist/ssr";
import { useRef, type CSSProperties } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useReveal } from "../motion/use-reveal";

// One icon per feature, in the order of `studio.features` (client image 3).
const ICONS: Icon[] = [TextAa, ChartLineUp, Target, Files, Hash, Clock];
// Writing templates come in Phase 2 (STD-05).
const SOON = 3;

/**
 * The six Studio features as names only (tahap H: the sentences under them were cut). They sit
 * under the editor as pills and pop in one after another when the stage comes into view
 * (globals.css, "Landing reveals"); without landing motion they simply stand.
 */
export function StudioFeatures({ copy }: { copy: Dictionary["landing"]["studio"] }) {
  const ref = useRef<HTMLUListElement>(null);
  useReveal(ref);
  return (
    <ul
      ref={ref}
      data-reveal="chips"
      aria-label={copy.featuresLabel}
      className="lp-chips m-0 mt-8 flex list-none flex-wrap justify-center gap-2 p-0 md:mt-12 lg:gap-2.5"
    >
      {copy.features.map((name, i) => {
        const Glyph = ICONS[i];
        return (
          <li
            key={name}
            style={{ "--i": i } as CSSProperties}
            className="lp-chip inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink shadow-card lg:h-10 lg:px-3.5 lg:text-sm"
          >
            <Glyph size={16} weight="bold" aria-hidden className="text-accent-ink" />
            {name}
            {i === SOON && (
              <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                {copy.soon}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
