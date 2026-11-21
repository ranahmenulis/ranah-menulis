"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/cn";
import type { Area } from "../access";
import { BAND_COPY, type BandWork } from "../role-band";
import { RoleMark } from "./role-mark";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** The number of work, or a dash while it loads. Hidden when the data cannot be read: the screen
 * under the band already says so. */
function WorkNumber({ work, unit, compact }: { work: BandWork; unit: string; compact?: boolean }) {
  if (work.status === "error") return null;
  // Inside the overview link only phrasing content is allowed.
  const Wrap = compact ? "span" : "p";
  return (
    <Wrap
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
      aria-busy={work.status === "loading"}
    >
      <span
        className={cn(
          "font-serif leading-[0.9] font-light tabular-nums",
          compact ? "text-[44px]" : "text-[56px] md:text-[88px]",
        )}
      >
        {work.status === "ready" ? <CountUp value={work.count} duration={1000} /> : "—"}
      </span>
      <span className="text-sm text-ink-soft">
        {unit}
        {work.status === "loading" && <span className="sr-only"> (memuat)</span>}
      </span>
    </Wrap>
  );
}

type Props = {
  area: Area;
  /** The screen's title. With `titleId` it is the page's h1; without, a plain line (Admin, whose
   * tabs carry their own h1). */
  title: string;
  titleId?: string;
  description?: string;
  work: BandWork;
  people?: readonly ("full" | "ring")[];
  className?: string;
};

/**
 * The band that opens a management area (DESIGN.md 7.8): a dark surface with the role, the screen
 * title, one number of work that rolls in, the way into that work, and the role's mark. The way in
 * is a text link: the one filled button of the screen stays on the page surface.
 */
export function RoleBand({ area, title, titleId, description, work, people, className }: Props) {
  const copy = BAND_COPY[area];
  const Title = titleId ? "h1" : "p";
  return (
    <section
      aria-label={titleId ? undefined : `Ruang kerja ${copy.role}`}
      aria-labelledby={titleId}
      data-band={area}
      className={cn(
        "theme-dark app-band grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 gap-y-5 p-5 text-ink md:p-8",
        className,
      )}
    >
      <div className="grid min-w-0 content-start gap-3">
        <p
          className="rm-rise-in text-xs font-medium tracking-wide text-ink-muted uppercase"
          style={step(-3)}
        >
          Ruang kerja · {copy.role}
        </p>
        <Title
          id={titleId}
          className="rm-rise-in font-serif text-[28px] leading-9 font-semibold text-balance md:text-[36px] md:leading-[44px]"
          style={step(-2)}
        >
          {title}
        </Title>
        {description && (
          <p className="rm-rise-in text-sm text-ink-soft" style={step(-1)}>
            {description}
          </p>
        )}
      </div>
      <RoleMark area={area} people={people} className="size-16 md:row-span-2 md:size-36" />
      <div className="col-span-2 grid content-end justify-items-start gap-3 md:col-span-1">
        <WorkNumber work={work} unit={copy.unit} />
        {work.status === "ready" && work.entry && (
          <Link
            href={work.entry.href}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline"
          >
            {work.entry.label}
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

/** The short band of one area on /kelola: the whole band is the link into the area. */
export function RoleBandLink({
  area,
  label,
  summary,
  href,
  work,
  people,
  index = 0,
}: {
  area: Area;
  label: string;
  summary: string;
  href: string;
  work: BandWork;
  people?: readonly ("full" | "ring")[];
  index?: number;
}) {
  const copy = BAND_COPY[area];
  return (
    <Link
      href={href}
      data-band={area}
      className="rm-row-in theme-dark app-band group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 p-5 text-ink no-underline transition-transform duration-200 hover:-translate-y-0.5 md:p-6"
      style={step(index)}
    >
      <span className="grid min-w-0 gap-2">
        <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">
          {copy.role}
        </span>
        <span className="font-serif text-[22px] leading-7 font-semibold group-hover:underline">
          {label}
        </span>
        <span className="text-sm text-ink-soft">{summary}</span>
        <WorkNumber work={work} unit={copy.unit} compact />
      </span>
      <RoleMark area={area} people={people} className="size-16 md:size-24" />
    </Link>
  );
}
