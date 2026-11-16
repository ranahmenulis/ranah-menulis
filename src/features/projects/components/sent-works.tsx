import { StatusSubmission } from "@/components/ui/status-submission";
import { formatNumber } from "../project-model";
import { sentAtText } from "../submission-text";
import type { Submission } from "../submission-types";
import { Section } from "./category-blocks";

/**
 * Works this reader already sent to the project. Read-only: the detail of a submission, its
 * history, and withdrawing it belong to "Proyek saya" (6f-4).
 */
export function SentWorks({ works }: { works: Submission[] }) {
  if (works.length === 0) return null;
  return (
    <Section title="Karya yang sudah kamu kirim">
      <ul>
        {works.map((work) => (
          <li
            key={work.id}
            className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3"
          >
            <div className="grid min-w-0 gap-0.5">
              <p className="text-base font-medium wrap-anywhere">{work.title}</p>
              <p className="text-xs wrap-anywhere text-ink-muted">
                {work.docTitle} · {formatNumber(work.versions[0]?.wordCount ?? 0)} kata ·{" "}
                {sentAtText(work.submittedAt)}
              </p>
            </div>
            <StatusSubmission status={work.status} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
