"use client";

import { SentEnvelopes } from "@/components/illustrations/envelope-art";
import { CountUp } from "@/components/ui/count-up";
import { heroArtClass, heroCardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import type { MyProject } from "../my-projects";

/** Counts for the top of Proyek saya: projects joined, works still counting, things to act on. */
export function myCounts(rows: MyProject[]) {
  const sent = rows.reduce(
    (sum, row) => sum + row.works.filter((work) => work.status !== "ditarik").length,
    0,
  );
  const action = rows.reduce(
    (sum, row) =>
      sum + row.needsRevision.length + (row.registration.status === "menunggu-pembayaran" ? 1 : 0),
    0,
  );
  return { joined: rows.length, sent, action };
}

const figure = "text-[22px] leading-7 font-bold tabular-nums md:text-[28px] md:leading-[34px]";

/**
 * The top of Proyek saya, after the Streak and Statistik heroes: envelopes on their way at the
 * right, the projects you joined as the large number, then works sent and what waits for you.
 */
export function MyHero({ rows }: { rows: MyProject[] }) {
  const t = useT().projectsFlow.my;
  const counts = myCounts(rows);
  return (
    <section aria-labelledby="saya-title" className={cn(heroCardClass, "grid gap-5")}>
      <SentEnvelopes
        className={cn(
          heroArtClass,
          "max-md:top-4 max-md:bottom-auto max-md:h-[38%] max-md:max-w-[46%] max-md:opacity-60",
        )}
      />
      <h1 id="saya-title" className="heading-lg">
        {t.title}
      </h1>
      <p className="grid gap-1">
        <span className="text-[56px] leading-[0.95] font-bold tracking-tight tabular-nums md:text-[72px]">
          <CountUp value={counts.joined} />
        </span>
        <span className="text-sm text-ink-soft">{t.hero.joined}</span>
      </p>
      <dl className="grid max-w-md grid-cols-2 divide-x divide-line border-t border-line pt-4 [&>div]:px-3 [&>div:first-child]:pl-0">
        <div className="flex flex-col-reverse justify-end gap-1">
          <dt className="text-xs text-ink-muted">{t.hero.sent}</dt>
          <dd className={figure}>{counts.sent}</dd>
        </div>
        <div className="flex flex-col-reverse justify-end gap-1">
          <dt className="text-xs text-ink-muted">{t.hero.action}</dt>
          <dd className={cn(figure, counts.action > 0 && "text-accent-ink")}>{counts.action}</dd>
        </div>
      </dl>
    </section>
  );
}
