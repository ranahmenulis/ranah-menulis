"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { atRowEnd, cardAtEdge, useAutoAdvance } from "../motion/use-auto-advance";
import { Tag } from "./previews/preview-frame";
import { MARKERS } from "./studio-markers";

// Writing templates are Phase 2 (STD-05), so that entry says so (0-based place in the copy).
const LATER = new Set([3]);
// Legend entries with a pin on the mockup (1-based), so hovering them can light that pin.
const MARKED = new Set<number>(Object.values(MARKERS));
const PHONE = "(max-width: 47.99rem)";

const pad = (n: number) => String(n).padStart(2, "0");

const onPhone = () => window.matchMedia?.(PHONE).matches ?? false;

/**
 * The editorial legend 01-06 under the Studio mockup (hairlines only, no boxes). From md up it is
 * a 2- or 3-column grid; on a phone it is one row that swipes sideways (client request: "biar ga
 * makan tempat"), with a "01 / 06 · Geser →" line under it that follows the scroll. Hovering an
 * entry with a pin lights that pin (globals.css, "Studio legend"). On a phone the row also moves
 * on by itself every 3 s while in view, until the reader touches it (`useAutoAdvance`).
 */
export function StudioLegend({ copy }: { copy: Dictionary["landing"]["studio"] }) {
  const list = useRef<HTMLOListElement>(null);
  // The current position and the one it left, so the number can roll from one to the other.
  const [pos, setPos] = useState({ at: 1, prev: 1 });
  const total = copy.features.length;
  useAutoAdvance(list, onPhone);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const phone = window.matchMedia?.(PHONE);
    // A scrolling region has to be reachable by keyboard; on md the list does not scroll.
    const syncFocus = () =>
      phone?.matches ? el.setAttribute("tabindex", "0") : el.removeAttribute("tabindex");
    const onScroll = () => {
      const at = atRowEnd(el) ? total : cardAtEdge(el) + 1;
      setPos((p) => (p.at === at ? p : { at, prev: p.at }));
    };
    syncFocus();
    phone?.addEventListener("change", syncFocus);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      phone?.removeEventListener("change", syncFocus);
      el.removeEventListener("scroll", onScroll);
    };
  }, [total]);

  return (
    <>
      <ol
        ref={list}
        aria-label={copy.featuresLabel}
        className="m-0 mt-10 flex snap-x snap-mandatory [scrollbar-width:none] list-none gap-4 overflow-x-auto overscroll-x-contain p-0 pb-1 max-md:-mx-4 max-md:scroll-px-4 max-md:px-4 md:col-span-12 md:mt-14 md:grid md:snap-none md:grid-cols-2 md:gap-x-6 md:overflow-visible lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
      >
        {copy.features.map((f, i) => (
          <li
            key={f.name}
            data-marker-for={MARKED.has(i + 1) ? i + 1 : undefined}
            className="grid flex-[0_0_68%] snap-start content-start gap-1 border-t border-line pt-4 md:gap-2 md:pt-5 md:pb-8"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="text-2xl leading-none font-semibold tracking-[-0.03em] tabular-nums md:text-[32px]"
              >
                {pad(i + 1)}
              </span>
              {LATER.has(i) && <Tag>{copy.soon}</Tag>}
            </div>
            <h3 className="mt-1 text-base leading-6 font-semibold md:mt-2 md:text-lg">{f.name}</h3>
            <p className="max-w-[36ch] text-[13px] leading-5 text-ink-muted md:text-sm md:leading-[22px]">
              {f.text}
            </p>
          </li>
        ))}
      </ol>
      <p
        aria-hidden
        className="mt-3 flex justify-between font-mono text-[11px] font-medium text-ink-muted md:hidden"
      >
        <span className="tabular-nums">
          <span className="inline-grid overflow-hidden align-top">
            {pos.prev !== pos.at && (
              <span
                key={`out-${pos.prev}-${pos.at}`}
                className="lp-roll-out col-start-1 row-start-1"
              >
                {pad(pos.prev)}
              </span>
            )}
            <span
              key={`in-${pos.at}`}
              data-legend-at
              className="lp-roll-in col-start-1 row-start-1"
            >
              {pad(pos.at)}
            </span>
          </span>{" "}
          / {pad(total)}
        </span>
        <span>{copy.swipe} →</span>
      </p>
    </>
  );
}
