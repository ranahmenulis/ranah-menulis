"use client";

import {
  ListBullets,
  ListNumbers,
  Quotes,
  TextB,
  TextH,
  TextItalic,
} from "@phosphor-icons/react/dist/ssr";
import { Monogram } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { textStats } from "@/lib/text-stats";
import { MARKERS } from "./studio-markers";

const TODAY_WORDS = 320;

// Only the formats STD-01 allows: bold, italic, subheading, quote, bullet and numbered lists.
const tools = [TextB, TextItalic, TextH, Quotes, ListBullets, ListNumbers];

/** Numbered pin tying a part of the mockup to its line in the legend below. */
function Marker({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      data-marker={n}
      className="lp-marker inline-grid size-5 shrink-0 place-items-center rounded-full bg-ink text-[11px] leading-none font-semibold text-on-ink tabular-nums"
    >
      {n}
    </span>
  );
}

/** A still, large Ranah Studio editor for the writing-experience section. */
export function StudioMockup() {
  const { doc, hero, studio } = useT().landing;
  const stats = textStats(doc.page);
  const numberLocale = useLocale() === "en" ? "en-US" : "id-ID";
  const n = (value: number) => value.toLocaleString(numberLocale);

  return (
    <>
      <div className="flex h-14 items-center gap-3 border-b border-line px-4 md:gap-4 md:px-6">
        <Monogram height={20} />
        <span className="hidden max-w-[320px] truncate text-sm font-medium md:inline">
          {doc.title}
        </span>
        <VisibilityTag visibility="pribadi" />
        <span className="text-xs text-ink-muted">{hero.saved}</span>
      </div>
      <div className="flex items-center justify-center gap-3 border-b border-line px-4 py-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1">
          {tools.map((Icon, i) => (
            <span key={i} className="grid size-8 place-items-center text-ink-muted">
              <Icon size={18} aria-hidden />
            </span>
          ))}
        </span>
        <Marker n={MARKERS.format} />
      </div>
      <div className="mx-auto max-w-170 px-5 py-8 md:px-6 md:py-14">
        <p className="mb-4 read-title md:mb-6">{doc.title}</p>
        {doc.page.map((p, i) => (
          // One paragraph on a phone: the page is a sample, and the legend below does the telling.
          <p key={p} className={cn("mb-[1.4em] read-body text-ink-read", i > 0 && "max-md:hidden")}>
            {p}
          </p>
        ))}
      </div>
      <div className="grid gap-4 border-t border-line px-4 py-4 text-xs text-ink-muted md:grid-cols-[minmax(0,1fr)_280px] md:items-center md:px-6">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
          <span>
            {n(stats.words)} {hero.words} · {n(stats.characters)} {studio.characters}
          </span>
          <Marker n={MARKERS.counter} />
          <span aria-hidden>·</span>
          <span>{format(studio.readingTime, { count: String(stats.minutes) })}</span>
          <Marker n={MARKERS.reading} />
        </span>
        <div className="grid gap-2">
          <span className="flex items-center gap-2 text-ink tabular-nums">
            {format(studio.today, { count: String(TODAY_WORDS) })}
            <Marker n={MARKERS.target} />
          </span>
          <span className="block h-1 bg-line">
            <i
              className="lp-target block h-full origin-left bg-ink"
              style={{ transform: `scaleX(${TODAY_WORDS / 500})` }}
            />
          </span>
        </div>
      </div>
    </>
  );
}
