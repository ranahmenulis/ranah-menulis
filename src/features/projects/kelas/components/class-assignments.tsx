import { TextLink } from "@/components/ui/text-link";
import { Section } from "../../components/category-blocks";
import type { TimeZoneName } from "../../types";
import { assignmentHref, type AssignmentRow } from "../class-model";
import { dueText, stateHint } from "../class-text";
import { StatusTugas } from "./status-tugas";

/** The assignments of the class, one per module, each a way into its own page (KLS-03). */
export function ClassAssignments({
  slug,
  rows,
  zone,
}: {
  slug: string;
  rows: AssignmentRow[];
  zone: TimeZoneName;
}) {
  return (
    <Section title="Tugas">
      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada tugas di kelas ini.</p>
      ) : (
        <ul className="grid">
          {rows.map(({ assignment, submission, state }) => (
            <li
              key={assignment.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5 border-b border-line py-3"
            >
              <div className="grid min-w-0 gap-0.5">
                <TextLink
                  href={assignmentHref(slug, assignment.id)}
                  className="text-base font-medium wrap-anywhere"
                >
                  {assignment.title}
                </TextLink>
                <p className="text-xs wrap-anywhere text-ink-muted">
                  {assignment.module} · {dueText(assignment.dueAt, zone)}
                </p>
                <p className="text-xs text-ink-muted">
                  {submission?.late && state !== "selesai" ? "Dikumpulkan terlambat. " : ""}
                  {stateHint[state]}
                </p>
              </div>
              <StatusTugas state={state} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
