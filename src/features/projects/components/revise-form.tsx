"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Textarea } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { formatNumber } from "@/lib/i18n/format";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { useReviseForm } from "../hooks/use-revise-form";
import { formatProjectDate } from "../project-model";
import type { ReviseResult } from "../revise-flow";
import { wordsOf } from "../submission-model";
import { MAX_REVISIONS, latestFeedback, revisionDueAt, revisionsSent } from "../submission-status";
import { wordRuleText } from "../submission-text";
import { NOTE_LIMIT, type Submission, type VersionFile } from "../submission-types";
import type { Project } from "../types";
import { Section } from "./category-blocks";
import { ManuscriptUpload } from "./manuscript-upload";
import { SubmitDocumentPicker } from "./submit-document-picker";
import { ProjectStrip } from "./project-strip";

type Props = {
  project: Project;
  work: Submission;
  /** Every submission on this device: the other works of this project cannot be sent again. */
  all: Submission[];
  /** Documents that can be picked: everything outside Sampah, newest first. */
  docs: StudioDocument[];
  now: number;
  onSend: (docId: string | null, note: string, upload: VersionFile | null) => Promise<ReviseResult>;
};

function ErrorLine({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-danger">
      <WarningCircle size={20} className="shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Heading of the form: which round, the deadline, the rules, and what the editor wrote. */
function Heading({ project, work }: { project: Project; work: Submission }) {
  const t = useT().projectsFlow.revise.form;
  const locale = useLocale();
  const rules = project.submission;
  const due = revisionDueAt(work);
  const feedback = latestFeedback(work);
  if (!rules) return null;
  return (
    <header className="grid gap-2">
      <ProjectStrip project={project} className="mb-4" />
      <h1 className="heading-lg wrap-anywhere">{fill(t.heading, { title: work.title })}</h1>
      <p className="text-sm text-ink-muted">
        {fill(t.round, {
          n: String(Math.min(revisionsSent(work) + 1, MAX_REVISIONS)),
          max: String(MAX_REVISIONS),
        })}
        {due !== null &&
          fill(t.deadline, {
            date: formatProjectDate(due, project.timeZone, locale),
            zone: project.timeZone,
          })}{" "}
        {fill(t.rule, { rule: wordRuleText(rules, locale) })}
      </p>
      {feedback && <p className="font-serif text-base leading-7 wrap-anywhere">{feedback}</p>}
    </header>
  );
}

/**
 * The revision form (PRD 10.5, step 7): pick the document (the one already sent is chosen, a
 * different one is allowed), add a note for the editor, send. Title and genre stay as sent. Every
 * rule that stops it is shown as its own message and nothing typed is cleared by a failure.
 */
export function ReviseForm(props: Props) {
  const { project, work, all, docs } = props;
  const rules = project.submission;
  const f = useReviseForm(props);
  const flow = useT().projectsFlow;
  const t = flow.revise.form;
  const locale = useLocale();
  const counter = (text: string) =>
    fill(flow.submit.info.counter, {
      n: formatNumber(text.trim().length, locale),
      limit: formatNumber(NOTE_LIMIT, locale),
    });
  if (!rules) return null;

  const sentElsewhere = new Set(
    all
      .filter((s) => s.slug === work.slug && s.id !== work.id && s.status !== "ditarik")
      .map((s) => s.docId),
  );

  return (
    <form className="grid gap-8" noValidate onSubmit={(e) => void f.submit(e)}>
      <Heading project={project} work={work} />

      <Section title={t.manuscript}>
        <p className="text-sm text-ink-muted">{t.frozen}</p>
        <SubmitDocumentPicker
          docs={docs}
          value={f.docId}
          onChange={f.pickDoc}
          sentDocIds={sentElsewhere}
          describedBy={f.docError ? "revisi-doc-error" : undefined}
          invalid={Boolean(f.docError)}
        />
        {project.block.kind === "solo" && (
          <ManuscriptUpload
            upload={f.upload}
            uploading={f.uploading}
            error={f.uploadError}
            onPick={(file) => void f.pickFile(file)}
            onClear={f.clearFile}
          />
        )}
        {f.doc && !f.docError && (
          <p className="text-sm text-ink-muted">
            {fill(flow.submit.form.wordsOk, {
              words: formatNumber(wordsOf(f.doc), locale),
              rule: wordRuleText(rules, locale),
            })}
          </p>
        )}
        {f.docError && <ErrorLine id="revisi-doc-error">{f.docError}</ErrorLine>}
      </Section>

      <Field id="revisi-note" label={t.note} optional hint={counter(f.note)} error={f.noteError}>
        <Textarea
          id="revisi-note"
          value={f.note}
          aria-invalid={f.noteError ? true : undefined}
          aria-describedby={describedBy("revisi-note", { hint: true, error: f.noteError })}
          onChange={(e) => f.changeNote(e.target.value)}
        />
      </Field>

      <div className="grid gap-4">
        {f.failed && <ErrorBanner>{t.writeFailed}</ErrorBanner>}
        {!f.failed && f.blocked && (
          <ErrorBanner>
            {fill(t.blocked, {
              detail:
                f.general.length > 0 ? f.general.map((p) => p.message).join(" ") : t.checkAbove,
            })}
          </ErrorBanner>
        )}
        <Button type="submit" loading={f.busy} className="justify-self-start">
          {t.submit}
        </Button>
      </div>
    </form>
  );
}
