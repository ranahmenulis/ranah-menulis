import { sentAtText } from "@/features/projects/submission-text";
import type { AssignmentChange, AssignmentSubmission } from "@/features/projects/kelas/types";

function lineOf(change: AssignmentChange, index: number): string {
  if (change.by === "mentor") {
    return change.status === "selesai" ? "Ditandai selesai." : "Perbaikan diminta.";
  }
  return index === 0 ? "Peserta mengumpulkan tugas." : "Peserta mengumpulkan perbaikan.";
}

/** Every change of status, newest last, as the mentor reads it. */
export function MentorHistory({ work }: { work: AssignmentSubmission }) {
  return (
    <section aria-labelledby="riwayat-title" className="grid gap-3 border-t border-line pt-6">
      <h2 id="riwayat-title" className="heading-md">
        Riwayat
      </h2>
      <ol className="grid gap-3 text-sm">
        {work.statusLog.map((change, i) => (
          <li key={`${change.status}-${change.at}`} className="grid gap-0.5">
            <span>{lineOf(change, i)}</span>
            <span className="text-xs text-ink-muted">{sentAtText(change.at)}</span>
            {change.reason && change.by === "mentor" && (
              <span className="text-sm wrap-anywhere whitespace-pre-line text-ink-muted">
                {change.reason}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
