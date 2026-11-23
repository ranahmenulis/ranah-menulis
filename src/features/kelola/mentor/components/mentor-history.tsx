import { useLocale, useT } from "@/lib/i18n/provider";
import { sentAtText } from "@/features/projects/submission-text";
import type { AssignmentChange, AssignmentSubmission } from "@/features/projects/kelas/types";

function lineOf(
  change: AssignmentChange,
  index: number,
  t: ReturnType<typeof useT>["kelolaMentor"]["history"],
): string {
  if (change.by === "mentor") return change.status === "selesai" ? t.done : t.repairAsked;
  return index === 0 ? t.handedIn : t.handedRepair;
}

/** Every change of status, newest last, as the mentor reads it. */
export function MentorHistory({ work }: { work: AssignmentSubmission }) {
  const t = useT().kelolaMentor.history;
  const locale = useLocale();
  return (
    <section aria-labelledby="riwayat-title" className="grid gap-3 border-t border-line pt-6">
      <h2 id="riwayat-title" className="heading-md">
        {t.title}
      </h2>
      <ol className="grid gap-3 text-sm">
        {work.statusLog.map((change, i) => (
          <li key={`${change.status}-${change.at}`} className="grid gap-0.5">
            <span>{lineOf(change, i, t)}</span>
            <span className="text-xs text-ink-muted">{sentAtText(change.at, locale)}</span>
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
