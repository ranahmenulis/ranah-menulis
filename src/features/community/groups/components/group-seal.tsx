"use client";

import type { CSSProperties } from "react";
import { Campfire } from "@/components/illustrations/community-art";
import { heroCardClass } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { slugHash, titleInitial } from "@/features/projects/cover-model";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { HeroBanner } from "../../components/community-hero";
import type { WritingGroup } from "../group-model";

/** Dots drawn around a seal: one per member up to this many. */
export const SEAL_DOTS = 24;

/**
 * A group as a round seal (DESIGN.md 6.7, Grup Penulis): the first letter of its name in serif, a ring of dots
 * with one dot per member, and one of two accent tones and a tilt that come from the group id, so one
 * group always looks the same. Decorative: the name and member count are always also text.
 */
export function GroupSeal({
  group,
  size = "sm",
  className,
}: {
  group: Pick<WritingGroup, "id" | "name" | "members">;
  size?: "sm" | "lg";
  className?: string;
}) {
  const hash = slugHash(group.id);
  const ink = hash % 2 === 0;
  const dots = Math.min(SEAL_DOTS, group.members.length);
  const tilt = (hash >>> 3) % 360;
  return (
    <span
      aria-hidden
      data-seal={ink ? "ink" : "paper"}
      className={cn(
        "rm-seal relative grid shrink-0 place-items-center rounded-full",
        ink ? "bg-accent text-on-accent" : "bg-accent-subtle text-accent-ink",
        size === "lg" ? "size-32 md:size-36" : "size-12",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="rm-seal-ring absolute inset-0" fill="none">
        <circle cx={50} cy={50} r={42} stroke="currentColor" strokeWidth={0.6} opacity={0.5} />
        {Array.from({ length: dots }, (_, i) => {
          const angle = ((tilt + (i * 360) / SEAL_DOTS) * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={50 + 42 * Math.cos(angle)}
              cy={50 + 42 * Math.sin(angle)}
              r={size === "lg" ? 2.2 : 3.4}
              fill="currentColor"
              className="rm-pop"
              style={{ "--i": i * 3 } as CSSProperties}
            />
          );
        })}
      </svg>
      <span
        className={cn(
          "font-serif leading-none",
          size === "lg" ? "text-[56px] md:text-[64px]" : "text-xl",
        )}
      >
        {titleInitial(group.name)}
      </span>
    </span>
  );
}

/**
 * The anchor of a group page: a hero card with the campfire as a band on top (DESIGN.md 7.10), the
 * seal, the name, the visibility as a pill and the member count as the one large number.
 */
export function GroupHero({ group }: { group: WritingGroup }) {
  const t = useT().groups.hero;
  return (
    <header
      className={cn(heroCardClass, "grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]")}
    >
      <HeroBanner art={Campfire} className="sm:col-span-2" />
      <GroupSeal group={group} size="lg" className="rm-cover-enter" />
      <div className="grid min-w-0 content-start gap-3">
        <span className="inline-flex h-6 w-fit items-center rounded-full bg-accent-subtle px-2.5 text-xs font-medium text-accent-ink">
          {group.visibility === "publik" ? t.publicGroup : t.privateGroup}
        </span>
        <h1 className="rm-rise-in text-[28px] leading-9 font-bold tracking-[-0.02em] wrap-anywhere md:text-[40px] md:leading-[48px]">
          {group.name}
        </h1>
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span
            aria-hidden
            className="text-[56px] leading-[0.95] font-bold tracking-tight tabular-nums md:text-[64px]"
          >
            <CountUp value={group.members.length} />
          </span>
          <span className="text-sm text-ink-soft">
            <span className="sr-only">{group.members.length} </span>
            {t.members}
          </span>
        </p>
        {group.description && (
          <p className="max-w-130 text-sm wrap-anywhere text-ink-soft md:text-base">
            {group.description}
          </p>
        )}
      </div>
    </header>
  );
}
