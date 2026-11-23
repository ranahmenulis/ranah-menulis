"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  AdminArt,
  EditorArt,
  JudgeArt,
  MentorArt,
  OrganizerArt,
} from "@/components/illustrations/role-art";
import { heroCardClass } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { fill } from "@/features/studio/copy/fill";
import type { Area } from "../access";
import type { BandWork } from "../role-band";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** One painted object per role (DESIGN.md 7.8, 7.10). */
const ROLE_ART: Record<Area, (props: { className?: string }) => ReactNode> = {
  editor: EditorArt,
  juri: JudgeArt,
  mentor: MentorArt,
  organizer: OrganizerArt,
  admin: AdminArt,
};

function RoleArt({ area, className }: { area: Area; className: string }) {
  const Art = ROLE_ART[area];
  return (
    <span aria-hidden data-mark={area} className={cn("absolute -z-10", className)}>
      <Art className="size-full" />
    </span>
  );
}

/** The number of work, or a dash while it loads. Hidden when the data cannot be read: the screen
 * under the band already says so. */
function WorkNumber({ work, unit, compact }: { work: BandWork; unit: string; compact?: boolean }) {
  const t = useT().kelolaShared.band;
  if (work.status === "error") return null;
  // Inside the overview link only phrasing content is allowed.
  const Wrap = compact ? "span" : "p";
  return (
    <Wrap
      className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", compact && "max-w-[62%]")}
      aria-busy={work.status === "loading"}
    >
      <span
        className={cn(
          "leading-[0.95] font-bold tracking-tight tabular-nums",
          compact ? "text-[40px]" : "text-[56px] md:text-[72px]",
        )}
      >
        {work.status === "ready" ? <CountUp value={work.count} duration={1000} /> : "—"}
      </span>
      <span className="text-sm text-ink-soft">
        {unit}
        {work.status === "loading" && <span className="sr-only">{t.loading}</span>}
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
  className?: string;
};

/**
 * The hero card that opens a management area (DESIGN.md 7.8): the role, the screen title, one
 * number of work that rolls in, the way into that work, and the role's illustration at the right.
 * The way in is a quiet pill: the one filled button of the screen stays on the page.
 */
export function RoleBand({ area, title, titleId, description, work, className }: Props) {
  const t = useT().kelolaShared.band;
  const copy = t.roles[area];
  const Title = titleId ? "h1" : "p";
  return (
    <section
      aria-label={titleId ? undefined : fill(t.sectionLabel, { role: copy.role })}
      aria-labelledby={titleId}
      data-band={area}
      className={cn(heroCardClass, "grid gap-4 md:gap-5", className)}
    >
      <RoleArt
        area={area}
        className="right-0 bottom-0 h-[78%] w-[62%] max-md:top-3 max-md:bottom-auto max-md:h-[34%] max-md:w-[44%] max-md:opacity-60"
      />
      <div className="grid max-w-xl content-start gap-2">
        <p className="rm-rise-in text-sm font-medium text-ink-muted" style={step(-3)}>
          {fill(t.eyebrow, { role: copy.role })}
        </p>
        <Title
          id={titleId}
          className="rm-rise-in text-[28px] leading-9 font-bold tracking-[-0.02em] text-balance md:text-[36px] md:leading-[44px]"
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
      <div className="grid content-end justify-items-start gap-3">
        <WorkNumber work={work} unit={copy.unit} />
        {work.status === "ready" && work.entry && (
          <Link
            href={work.entry.href}
            className="group inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-3.5 py-1.5 text-sm font-medium text-accent-ink no-underline transition-colors hover:bg-accent-subtle/70"
          >
            {work.entry.label}
            <ArrowRight
              size={14}
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </section>
  );
}

/** The card of one area on /kelola: the whole card is the link into the area. */
export function RoleBandLink({
  area,
  label,
  summary,
  href,
  work,
  index = 0,
}: {
  area: Area;
  label: string;
  summary: string;
  href: string;
  work: BandWork;
  index?: number;
}) {
  const copy = useT().kelolaShared.band.roles[area];
  return (
    <Link
      href={href}
      data-band={area}
      className={cn(
        heroCardClass,
        "rm-row-in group hover:shadow-lg grid content-between gap-4 no-underline transition-[translate,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 md:p-6",
      )}
      style={step(index)}
    >
      <RoleArt area={area} className="right-0 bottom-0 h-[58%] w-[46%] opacity-90" />
      <span className="grid max-w-[70%] gap-1.5">
        <span className="text-sm font-medium text-ink-muted">{copy.role}</span>
        <span className="text-[22px] leading-7 font-bold tracking-[-0.01em] group-hover:underline">
          {label}
        </span>
        <span className="text-sm text-ink-soft">{summary}</span>
      </span>
      <WorkNumber work={work} unit={copy.unit} compact />
    </Link>
  );
}
