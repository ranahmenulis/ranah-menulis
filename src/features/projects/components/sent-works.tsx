import { StatusSubmission } from "@/components/ui/status-submission";
import { versionSizeText } from "../submission-text";
import { TextLink } from "@/components/ui/text-link";
import { submissionHref } from "../submission-href";
import { sentAtText } from "../submission-text";
import type { Submission } from "../submission-types";
import { Section } from "./category-blocks";

/**
 * Works this reader already sent to the project. Each title opens its page (status, history of
 * versions, revising, withdrawing).
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
              <TextLink
                href={submissionHref(work.slug, work.id)}
                className="text-base font-medium wrap-anywhere"
              >
                {work.title}
              </TextLink>
              <p className="text-xs wrap-anywhere text-ink-muted">
                {work.docTitle} · {versionSizeText(work.versions.at(-1))} ·{" "}
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
