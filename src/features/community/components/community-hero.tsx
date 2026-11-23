"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { heroCardClass, heroSceneClass } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/cn";

type Art = (props: { className?: string }) => ReactNode;

/**
 * The illustration as a band across the top of a hero card, fading out at the bottom: used on
 * phones (where a landscape behind the text would cover the figures) and on detail heroes, whose
 * text runs the full width of the card.
 */
export function HeroBanner({ art: Art, className }: { art: Art; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "-mx-5 -mt-5 h-28 overflow-hidden rounded-t-2xl [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] md:-mx-8 md:-mt-8 md:h-40",
        className,
      )}
    >
      <Art className="size-full" />
    </div>
  );
}

export type HeroStat = { label: string; value: number; href?: string };

const statBox = "flex min-w-0 items-baseline gap-1.5 rounded-lg px-2.5 py-1";

function Stat({ stat }: { stat: HeroStat }) {
  const body = (
    <>
      <span className="text-lg leading-6 font-bold tabular-nums">{stat.value}</span>
      <span className="inline-flex items-center gap-1 text-xs text-ink-muted group-hover:text-ink">
        {stat.label}
        {stat.href && (
          <ArrowRight
            size={12}
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          />
        )}
      </span>
    </>
  );
  if (!stat.href) return <p className={statBox}>{body}</p>;
  return (
    <Link
      href={stat.href}
      aria-label={`${stat.label}: ${stat.value}`}
      className={cn(statBox, "group no-underline transition-colors hover:bg-accent-subtle/70")}
    >
      {body}
    </Link>
  );
}

/**
 * The top of a Community list tab: a slim hero strip (DESIGN.md 6.8) so the content starts on the
 * first screen. A title, one sentence, the one figure and up to three small figures on a single
 * row (links when they lead somewhere), and the section's illustration at the right, placed like
 * the Streak landscape (`heroSceneClass`). On a phone the illustration is a thin band on top so it
 * never covers the figures.
 */
export function CommunityHero({
  titleId,
  title,
  body,
  art: Art,
  figure,
  stats = [],
  actions,
}: {
  titleId: string;
  title: string;
  body: string;
  art: Art;
  figure?: { value: number | null; label: string };
  stats?: HeroStat[];
  actions?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={cn(heroCardClass, "grid gap-3 md:gap-4 md:px-8 md:py-6")}
    >
      <Art className={cn(heroSceneClass, "max-md:hidden")} />
      <HeroBanner art={Art} className="h-16 md:hidden" />
      <div className="grid max-w-xl gap-1">
        <h1
          id={titleId}
          className="text-[26px] leading-8 font-bold tracking-[-0.02em] md:text-[32px] md:leading-10"
        >
          {title}
        </h1>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
      {(figure || stats.length > 0) && (
        <div className="flex max-w-xl flex-wrap items-center gap-x-4 gap-y-1 md:gap-x-5">
          {figure && (
            <p className="flex items-baseline gap-2">
              <span className="text-[32px] leading-9 font-bold tracking-tight tabular-nums md:text-[40px] md:leading-11">
                {figure.value === null ? "—" : <CountUp value={figure.value} />}
              </span>
              <span className="text-sm text-ink-soft">{figure.label}</span>
            </p>
          )}
          {stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 border-line md:border-l md:pl-4">
              {stats.map((stat) => (
                <Stat key={stat.label} stat={stat} />
              ))}
            </div>
          )}
        </div>
      )}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}
