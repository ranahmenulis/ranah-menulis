"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Bookshelf } from "@/components/illustrations/projects-art";
import { CountUp } from "@/components/ui/count-up";
import { heroArtClass, heroCardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { isFree, projectState } from "../project-model";
import { liveRegistration } from "../payment-model";
import { useRegistrations } from "../registration-store";
import { MY_PROJECTS_HREF } from "../submission-href";
import type { Filters, Project } from "../types";

type Props = {
  projects: Project[];
  now: number;
  filters: Filters;
  description: string;
  onChange: (next: Filters) => void;
};

/** The catalog's counts, over every published project regardless of the current filter. */
export function catalogCounts(projects: Project[], now: number) {
  const live = projects.filter((p) => p.publication === "terbit");
  const open = live.filter((p) => {
    const state = projectState(p, now);
    return state === "buka" || state === "segera-tutup";
  });
  return {
    open: open.length,
    closing: open.filter((p) => projectState(p, now) === "segera-tutup").length,
    free: open.filter(isFree).length,
  };
}

const figure = "text-[22px] leading-7 font-bold tabular-nums md:text-[28px] md:leading-[34px]";

/**
 * The top of the catalog, after the Streak and Statistik heroes (client reference, 23 November
 * 2026): the bookshelf at the right, how many programmes are open as the one large number, and
 * three small figures that are also shortcuts (closing soon and free set the filter; the projects
 * you joined open Proyek saya).
 */
export function CatalogHero({ projects, now, filters, description, onChange }: Props) {
  const t = useT().projectsCatalog.view;
  const counts = catalogCounts(projects, now);
  const registrations = useRegistrations();
  const mine = Object.values(registrations).filter((r) => liveRegistration(r, now)).length;
  const shortcut =
    "group grid min-w-0 content-start gap-1 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent-subtle/70 aria-pressed:bg-accent-subtle";

  return (
    <section aria-labelledby="projects-title" className={cn(heroCardClass, "grid gap-6")}>
      {/* On a phone the shelf stands beside the large number, clear of the three shortcuts. */}
      <Bookshelf
        className={cn(
          heroArtClass,
          "max-md:top-[30%] max-md:bottom-auto max-md:h-[30%] max-md:max-w-[50%]",
        )}
      />
      <div className="grid max-w-xl gap-2">
        <h1
          id="projects-title"
          className="text-[28px] leading-9 font-bold tracking-[-0.02em] md:text-[40px] md:leading-[48px]"
        >
          {t.title}
        </h1>
        <p className="text-sm text-ink-soft md:text-base">{description}</p>
      </div>
      <p className="grid gap-1">
        <span className="text-[56px] leading-[0.95] font-bold tracking-tight tabular-nums md:text-[72px]">
          <CountUp value={counts.open} />
        </span>
        <span className="text-sm text-ink-soft">{t.hero.open}</span>
      </p>
      <div className="grid max-w-xl grid-cols-3 divide-x divide-line border-t border-line pt-3 [&>*]:mx-1.5 [&>*:first-child]:ml-0">
        <button
          type="button"
          aria-pressed={filters.state === "segera-tutup"}
          onClick={() =>
            onChange({
              ...filters,
              state: filters.state === "segera-tutup" ? "semua" : "segera-tutup",
            })
          }
          className={shortcut}
        >
          <span className={figure}>{counts.closing}</span>
          <span className="text-xs text-ink-muted">{t.hero.closing}</span>
        </button>
        <button
          type="button"
          aria-pressed={filters.fee === "gratis"}
          onClick={() =>
            onChange(
              filters.fee === "gratis"
                ? {
                    ...filters,
                    fee: "semua",
                    state: filters.state === "buka" ? "semua" : filters.state,
                  }
                : { ...filters, fee: "gratis", state: "buka" },
            )
          }
          className={shortcut}
        >
          <span className={figure}>{counts.free}</span>
          <span className="text-xs text-ink-muted">{t.hero.free}</span>
        </button>
        <Link
          href={MY_PROJECTS_HREF}
          aria-label={`${t.mine}, ${mine} ${t.hero.mine}`}
          className={cn(shortcut, "no-underline")}
        >
          <span className={figure}>{mine}</span>
          <span className="inline-flex items-center gap-1 text-xs text-ink-muted group-hover:text-ink">
            {t.hero.mine}
            <ArrowRight
              size={12}
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      </div>
    </section>
  );
}
