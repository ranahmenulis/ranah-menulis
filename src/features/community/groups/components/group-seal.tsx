"use client";

import type { CSSProperties } from "react";
import { CountUp } from "@/components/ui/count-up";
import { slugHash, titleInitial } from "@/features/projects/cover-model";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import type { WritingGroup } from "../group-model";

/** Dots drawn around a seal: one per member up to this many. */
export const SEAL_DOTS = 24;

/**
 * A group as a round seal (DESIGN.md 6.7, Grup Penulis): the first letter of its name in serif, a ring of dots
 * with one dot per member, and a tone and tilt that come from the group id, so one group always
 * looks the same. Decorative: the name and member count are always also text.
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
        ink
          ? "bg-ink text-on-ink"
          : "bg-subtle text-ink outline -outline-offset-1 outline-line-strong",
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

/** The anchor of a group page: a dark band with the seal, the name, and the member count. */
export function GroupHero({ group }: { group: WritingGroup }) {
  const t = useT().groups.hero;
  return (
    <header className="theme-dark app-band grid items-center gap-6 p-6 text-ink sm:grid-cols-[auto_minmax(0,1fr)] md:p-8">
      <GroupSeal group={group} size="lg" className="rm-cover-enter" />
      <div className="grid min-w-0 content-start gap-3">
        <p className="text-sm text-ink-muted">
          {group.visibility === "publik" ? t.publicGroup : t.privateGroup}
        </p>
        <h1 className="rm-rise-in font-serif text-3xl leading-tight wrap-anywhere md:text-[40px]">
          {group.name}
        </h1>
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span aria-hidden className="font-serif text-5xl leading-none font-light tabular-nums">
            <CountUp value={group.members.length} />
          </span>
          <span className="text-sm text-ink-soft">
            <span className="sr-only">{group.members.length} </span>
            {t.members}
          </span>
        </p>
        {group.description && (
          <p className="max-w-130 text-sm wrap-anywhere text-ink-soft">{group.description}</p>
        )}
      </div>
    </header>
  );
}
