import { Section } from "../../components/category-blocks";
import { formatNumber } from "../../project-model";
import { sentAtText } from "../../submission-text";
import type { AssignmentChange, AssignmentSubmission } from "../types";

function lineOf(change: AssignmentChange, index: number): string {
  if (change.by === "mentor") {
    return change.status === "selesai"
      ? "Mentor menandai tugas selesai."
      : "Mentor meminta perbaikan.";
  }
  return index === 0 ? "Kamu mengumpulkan tugas." : "Kamu mengumpulkan perbaikan.";
}

/** Every change of status and every frozen version, newest last. The old versions stay (BR-STD-03). */
export function AssignmentHistory({ work }: { work: AssignmentSubmission }) {
  return (
    <>
      <Section title="Riwayat">
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
      </Section>
      <Section title="Versi">
        <ul className="grid gap-1 text-sm">
          {work.versions.map((v) => (
            <li key={v.version} className="text-ink-muted">
              <span className="text-ink">Versi {v.version}</span> · {formatNumber(v.wordCount)} kata
              · {sentAtText(v.frozenAt)}
            </li>
          ))}
        </ul>
        <p className="text-xs wrap-anywhere text-ink-muted">
          {work.source === "teks" ? "Diketik langsung." : `Dari dokumen ${work.docTitle}.`}
        </p>
      </Section>
    </>
  );
}
