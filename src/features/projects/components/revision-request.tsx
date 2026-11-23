"use client";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatProjectDate } from "../project-model";
import { reviseHref } from "../submission-href";
import {
  latestFeedback,
  MAX_REVISIONS,
  reviseBlock,
  reviseMessageText,
  revisionDueAt,
  revisionsSent,
} from "../submission-status";
import type { Submission } from "../submission-types";
import type { Project } from "../types";
import { Section } from "@/components/ui/section-card";

/**
 * A work the editor asked to revise: the note, the deadline, and the one way on. The button is the
 * only filled one on the screen. When the deadline passed or the rounds are used up it says so
 * instead of offering a revision that would be refused.
 */
export function RevisionRequest({
  project,
  work,
  now,
}: {
  project: Project;
  work: Submission;
  now: number;
}) {
  const t = useT().projectsFlow.revise.request;
  const locale = useLocale();
  const feedback = latestFeedback(work);
  const due = revisionDueAt(work);
  const block = reviseBlock(work, now);
  const round = Math.min(revisionsSent(work) + 1, MAX_REVISIONS);
  return (
    <Section title={t.section}>
      {feedback ? (
        <p className="font-serif text-base leading-7 wrap-anywhere">{feedback}</p>
      ) : (
        <p className="text-sm text-ink-muted">{t.none}</p>
      )}
      {due !== null && (
        <p className="text-sm text-ink-muted">
          {fill(t.due, {
            date: formatProjectDate(due, project.timeZone, locale),
            zone: project.timeZone,
            n: String(round),
            max: String(MAX_REVISIONS),
          })}
        </p>
      )}
      {block ? (
        <Notice>{reviseMessageText(block, locale)}</Notice>
      ) : (
        <ButtonLink href={reviseHref(work.slug, work.id)} className="justify-self-start">
          {t.send}
        </ButtonLink>
      )}
    </Section>
  );
}

/** The editor's note on a decision (Diterima or Ditolak), shown where the reader will look for it. */
export function DecisionNote({ work }: { work: Submission }) {
  const t = useT().projectsFlow.revise.request;
  const feedback = latestFeedback(work);
  if (!feedback) return null;
  return (
    <Section title={t.section}>
      <p className="font-serif text-base leading-7 wrap-anywhere">{feedback}</p>
    </Section>
  );
}
