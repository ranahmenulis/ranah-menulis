"use client";

import { useRef } from "react";
import {
  ArrowLeft,
  ListBullets,
  ListNumbers,
  Quotes,
  TextAlignLeft,
  TextB,
  TextItalic,
} from "@phosphor-icons/react/dist/ssr";
import { Monogram } from "@/components/ui/logo";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/i18n/format";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { textStats } from "@/lib/text-stats";
import { useReveal } from "../motion/use-reveal";

const TODAY_WORDS = 320;

// The editor's format pill (tahap I), the first one shown as active.
const tools = [TextB, TextItalic, TextAlignLeft, Quotes, ListBullets, ListNumbers];

/**
 * A still Ranah Studio editor for the hero stage, drawn like the real one after tahap I: the bar on
 * the canvas, the format pill floating over it, and the text on a sheet of paper. A caret blinks
 * after the last word (only with landing motion), and today's target bar fills once the editor
 * comes into view (globals.css, "Landing reveals").
 */
export function StudioMockup() {
  const { doc, hero, studio } = useT().landing;
  const stats = textStats(doc.page);
  const locale = useLocale();
  const n = (value: number) => formatNumber(value, locale);
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <div ref={ref} data-reveal="studio" className="lp-studio">
      <div className="flex h-12 items-center gap-3 border-b border-line bg-surface px-3 md:h-14 md:gap-4 md:px-5">
        <ArrowLeft size={18} aria-hidden className="text-ink-muted" />
        <Monogram height={18} />
        <span className="hidden max-w-[300px] truncate text-sm font-medium md:inline">
          {doc.title}
        </span>
        <VisibilityTag visibility="pribadi" />
        <span className="ml-auto text-xs text-ink-muted">{hero.saved}</span>
      </div>
      <div className="bg-canvas px-3 pt-4 md:px-8 md:pt-6">
        <div className="mx-auto flex w-max max-w-full items-center gap-0.5 rounded-full border border-line bg-surface p-1 shadow-card">
          {tools.map((Icon, i) => (
            <span
              key={i}
              className={cn(
                "grid size-7 place-items-center rounded-full md:size-8",
                i === 0 ? "bg-accent-subtle text-accent-ink" : "text-ink-muted",
              )}
            >
              <Icon size={16} weight={i === 0 ? "bold" : "regular"} aria-hidden />
            </span>
          ))}
        </div>
        <div className="mx-auto mt-4 max-w-[540px] rounded-t-md border border-b-0 border-line bg-surface px-6 pt-7 pb-5 shadow-card md:mt-6 md:px-11 md:pt-10 md:pb-8">
          <p className="mb-3 font-serif text-[21px] leading-[1.25] font-bold tracking-[-0.01em] text-ink md:mb-5 md:text-[26px]">
            {doc.title}
          </p>
          {doc.page.map((p, i) => (
            // One paragraph on a phone: the page is a sample.
            <p
              key={p}
              className={cn(
                "mb-[1em] font-serif text-[14px] leading-[1.75] text-ink-read md:text-[15px]",
                i > 0 && "max-md:hidden",
              )}
            >
              {p}
              {i === doc.page.length - 1 && <span aria-hidden className="lp-caret" />}
            </p>
          ))}
        </div>
      </div>
      <div className="grid gap-3 border-t border-line bg-surface px-4 py-3.5 text-xs text-ink-muted md:grid-cols-[minmax(0,1fr)_260px] md:items-center md:px-6">
        <span className="tabular-nums">
          {n(stats.words)} {hero.words} · {n(stats.characters)} {studio.characters} ·{" "}
          {format(studio.readingTime, { count: String(stats.minutes) })}
        </span>
        <div className="grid gap-1.5">
          <span className="text-ink tabular-nums">
            {format(studio.today, { count: String(TODAY_WORDS) })}
          </span>
          <span className="block h-1.5 overflow-hidden rounded-full bg-subtle">
            <i
              className="lp-target block h-full origin-left rounded-full bg-accent"
              style={{ transform: `scaleX(${TODAY_WORDS / 500})` }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
