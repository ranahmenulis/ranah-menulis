import { progressText } from "../class-text";
import type { Progress } from "../class-model";

/**
 * KLS-02: the share of materials marked done plus assignments the mentor marked Selesai. A line of
 * 4px like the daily target (DESIGN.md 5.3), with the numbers in words beside it.
 */
export function ClassProgress({ progress }: { progress: Progress }) {
  if (progress.total === 0) {
    return <p className="text-sm text-ink-muted">Belum ada materi atau tugas di kelas ini.</p>;
  }
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">Progres belajar</p>
        <p className="text-sm text-ink-muted tabular-nums">
          {progress.percent}% · {progressText(progress.done, progress.total)}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Progres belajar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        className="h-1 bg-line"
      >
        <i className="block h-full bg-ink" style={{ width: `${progress.percent}%` }} />
      </div>
      <p className="text-xs text-ink-muted">
        Dihitung dari materi yang kamu tandai selesai dan tugas yang dinilai selesai oleh mentor.
      </p>
    </div>
  );
}
