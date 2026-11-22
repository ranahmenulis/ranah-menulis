"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { ErrorBanner, Notice } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import type { FileStore } from "@/lib/files/file-store";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { useSubmitForm } from "../hooks/use-submit-form";
import { formatNumber } from "@/lib/i18n/format";
import { projectState } from "../project-model";
import { deadlineText } from "../project-text";
import { isAnonymousContest, wordsOf, type SubmitForm } from "../submission-model";
import { wordRuleText, worksText } from "../submission-text";
import type { Submission } from "../submission-types";
import type { SendResult } from "../submit-flow";
import type { Project } from "../types";
import { Section } from "./category-blocks";
import { SubmitDocumentPicker } from "./submit-document-picker";
import { ManuscriptUpload } from "./manuscript-upload";
import { SubmitInfoFields } from "./submit-info-fields";
import { ProjectStrip } from "./project-strip";

type Props = {
  project: Project;
  /** When the page opened; the real check happens again when the button is pressed. */
  now: number;
  /** Documents that can be picked: everything outside Sampah. */
  docs: StudioDocument[];
  /** This reader's works still counting against this project. */
  sent: Submission[];
  /** The document named in the address (`?dokumen=`), if any. */
  documentId: string | null;
  files?: FileStore;
  onSend: (form: SubmitForm) => Promise<SendResult>;
};

function ErrorLine({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-danger">
      <WarningCircle size={20} className="shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/**
 * The send form (PRD 10.5, steps 2 to 5): the document, the information, the statement, one
 * button. Every rule that stops the work is shown as its own message and nothing typed is ever
 * cleared. Fields are kept as a draft on this device while the form is open (status Draf).
 */
export function SubmitFormScreen(props: Props) {
  const { project, now, docs, sent } = props;
  const rules = project.submission;
  const f = useSubmitForm(props);
  const t = useT().projectsFlow.submit.form;
  const locale = useLocale();
  if (!rules) return null;

  const docError = f.errorOf("doc");
  const agreedError = f.errorOf("agreed");

  return (
    <form className="grid gap-8" noValidate onSubmit={(e) => void f.submit(e)}>
      <header className="grid gap-2">
        <ProjectStrip project={project} className="mb-4" />
        <h1 className="heading-lg">{t.title}</h1>
        <p className="text-sm text-ink-muted">
          {fill(t.rule, {
            rule: wordRuleText(rules, locale),
            sent: formatNumber(sent.length, locale),
            works: worksText(rules.maxWorks, locale),
            deadline: deadlineText(project, projectState(project, now), locale),
          })}
        </p>
      </header>

      {isAnonymousContest(project) && <Notice>{t.anonymous}</Notice>}
      {f.pickedGone && <Notice>{t.pickedGone}</Notice>}

      <Section title={t.manuscript}>
        <p className="text-sm text-ink-muted">{t.frozen}</p>
        <SubmitDocumentPicker
          docs={docs}
          value={f.form.docId}
          onChange={f.pick}
          sentDocIds={new Set(sent.map((s) => s.docId))}
          describedBy={docError ? "kirim-doc-error" : undefined}
          invalid={Boolean(docError)}
        />
        {project.block.kind === "solo" && (
          <ManuscriptUpload
            upload={f.form.upload}
            uploading={f.uploading}
            error={f.uploadError}
            onPick={(file) => void f.pickFile(file)}
            onClear={f.clearFile}
          />
        )}
        {f.doc && !docError && (
          <p className="text-sm text-ink-muted">
            {fill(t.wordsOk, {
              words: formatNumber(wordsOf(f.doc), locale),
              rule: wordRuleText(rules, locale),
            })}
          </p>
        )}
        {docError && <ErrorLine id="kirim-doc-error">{docError}</ErrorLine>}
      </Section>

      <SubmitInfoFields project={project} form={f.form} errorOf={f.errorOf} onChange={f.change} />

      <div className="grid gap-4">
        <CheckChoice
          checked={f.form.agreed}
          onChange={(e) => f.change({ agreed: e.target.checked })}
          aria-describedby={agreedError ? "kirim-agreed-error" : undefined}
          label={t.agree}
        />
        {agreedError && <ErrorLine id="kirim-agreed-error">{agreedError}</ErrorLine>}
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
