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

const statFigure = "text-[22px] leading-7 font-bold tabular-nums md:text-[28px] md:leading-[34px]";
const statBox = "grid min-w-0 content-start gap-1 rounded-xl px-3 py-2";

function Stat({ stat }: { stat: HeroStat }) {
  const body = (
    <>
      <span className={statFigure}>{stat.value}</span>
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
 * The top of a Community section, after the Streak and catalog heroes (client reference): a title,
 * one sentence, one large number, up to three small figures (links when they lead somewhere), and
 * the section's illustration at the right, placed like the Streak landscape (`heroSceneClass`).
 * On a phone the illustration becomes a band above the title so it never covers the figures.
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
    <section aria-labelledby={titleId} className={cn(heroCardClass, "grid gap-5 md:gap-6")}>
      <Art className={cn(heroSceneClass, "max-md:hidden")} />
      <HeroBanner art={Art} className="md:hidden" />
      <div className="grid max-w-xl gap-2">
        <h1
          id={titleId}
          className="text-[28px] leading-9 font-bold tracking-[-0.02em] md:text-[40px] md:leading-[48px]"
        >
          {title}
        </h1>
        <p className="text-sm text-ink-soft md:text-base">{body}</p>
      </div>
      {figure && (
        <p className="grid gap-1">
          <span className="text-[56px] leading-[0.95] font-bold tracking-tight tabular-nums md:text-[72px]">
            {figure.value === null ? "—" : <CountUp value={figure.value} />}
          </span>
          <span className="text-sm text-ink-soft">{figure.label}</span>
        </p>
      )}
      {stats.length > 0 && (
        <div className="grid max-w-xl grid-cols-3 divide-x divide-line border-t border-line pt-3 [&>*]:mx-1.5 [&>*:first-child]:ml-0">
          {stats.map((stat) => (
            <Stat key={stat.label} stat={stat} />
          ))}
        </div>
      )}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}
