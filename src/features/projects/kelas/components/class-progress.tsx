"use client";

import { CountUp } from "@/components/ui/count-up";
import { useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { fill } from "@/features/studio/copy/fill";
import { BandFigure } from "../../components/dashboard-band";
import { progressText } from "../class-text";
import type { Progress } from "../class-model";

/**
 * KLS-02, inside the dashboard band: the share of materials marked done plus assignments the
 * mentor marked Selesai. The percent rolls to its value, with a 4px line under it (DESIGN.md 5.3).
 */
export function ClassProgress({ progress, mentor }: { progress: Progress; mentor: string | null }) {
  const t = useT().projectsClass.progress;
  const { locale } = useFormat();
  const by = mentor ? fill(t.mentor, { name: mentor }) : null;
  if (progress.total === 0) {
    return (
      <>
        <p className="text-sm text-ink-soft">{t.empty}</p>
        {by && <p className="text-sm wrap-anywhere text-ink-soft">{by}</p>}
      </>
    );
  }
  return (
    <>
      <BandFigure
        figure={
          <>
            <CountUp value={progress.percent} />%
          </>
        }
        caption={fill(t.caption, {
          progress: progressText(progress.done, progress.total, locale),
        })}
      />
      <div
        role="progressbar"
        aria-label={t.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        className="h-2 max-w-80 overflow-hidden rounded-full bg-accent-subtle"
      >
        <i
          className="block h-full rounded-full bg-accent transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {by && <p className="pt-1 text-sm wrap-anywhere text-ink-soft">{by}</p>}
    </>
  );
}

/** Where the percent comes from, kept on the page under the band. */
export function ProgressNote({ progress }: { progress: Progress }) {
  const t = useT().projectsClass.progress;
  if (progress.total === 0) return null;
  return <p className="text-xs text-ink-muted">{t.note}</p>;
}
