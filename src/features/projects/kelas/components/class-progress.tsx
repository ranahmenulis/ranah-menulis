import { CountUp } from "@/components/ui/count-up";
import { BandFigure } from "../../components/dashboard-band";
import { progressText } from "../class-text";
import type { Progress } from "../class-model";

/**
 * KLS-02, inside the dashboard band: the share of materials marked done plus assignments the
 * mentor marked Selesai. The percent rolls to its value, with a 4px line under it (DESIGN.md 5.3).
 */
export function ClassProgress({ progress, mentor }: { progress: Progress; mentor: string | null }) {
  const by = mentor ? `Mentor: ${mentor}` : null;
  if (progress.total === 0) {
    return (
      <>
        <p className="text-sm text-ink-soft">Belum ada materi atau tugas di kelas ini.</p>
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
        caption={`Progres belajar · ${progressText(progress.done, progress.total)}`}
      />
      <div
        role="progressbar"
        aria-label="Progres belajar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        className="h-1 max-w-80 bg-line"
      >
        <i
          className="block h-full bg-ink transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {by && <p className="pt-1 text-sm wrap-anywhere text-ink-soft">{by}</p>}
    </>
  );
}

/** Where the percent comes from, kept on the page under the band. */
export function ProgressNote({ progress }: { progress: Progress }) {
  if (progress.total === 0) return null;
  return (
    <p className="text-xs text-ink-muted">
      Progres dihitung dari materi yang kamu tandai selesai dan tugas yang dinilai selesai oleh
      mentor.
    </p>
  );
}
