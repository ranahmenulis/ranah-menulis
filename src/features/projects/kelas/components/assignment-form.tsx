"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RadioChoice } from "@/components/ui/choice";
import { Field, Textarea, describedBy } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { docStats } from "@/features/studio/editor-stats";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { SubmitDocumentPicker } from "../../components/submit-document-picker";
import { problemText, textToDoc, wordsInDoc, type AssignmentForm } from "../assignment-model";
import type { HandInResult } from "../assignment-flow";
import { useAssignmentForm } from "../hooks/use-assignment-form";

type Props = {
  docs: StudioDocument[];
  /** The label of the one button: hand in the assignment or the revision. */
  submitLabel: string;
  onSend: (form: AssignmentForm) => Promise<HandInResult>;
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
 * The hand-in form (KLS-03): a Studio document, whose frozen copy is taken when you press the
 * button, or text typed right here. Every rule that stops it is shown as its own message and
 * nothing typed is ever cleared.
 */
export function AssignmentFormScreen({ docs, submitLabel, onSend }: Props) {
  const t = useT().projectsClass.form;
  const { locale, number } = useFormat();
  const f = useAssignmentForm({ docs, onSend });
  const messageOf = (field: "doc" | "text") => {
    const problem = f.errorOf(field);
    return problem ? problemText(problem, locale) : undefined;
  };
  const docError = messageOf("doc");
  const textError = messageOf("text");
  const typedWords = f.form.source === "teks" ? docStats(textToDoc(f.form.text)).words : 0;

  return (
    <form className="grid gap-5" noValidate onSubmit={(e) => void f.submit(e)}>
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">{t.source}</legend>
        <RadioChoice
          name="sumber"
          checked={f.form.source === "studio"}
          onChange={() => f.setSource("studio")}
          label={t.fromStudio}
          hint={t.fromStudioHint}
        />
        <RadioChoice
          name="sumber"
          checked={f.form.source === "teks"}
          onChange={() => f.setSource("teks")}
          label={t.typed}
          hint={t.typedHint}
        />
      </fieldset>

      {f.form.source === "studio" ? (
        <div className="grid gap-3">
          <SubmitDocumentPicker
            docs={docs}
            value={f.form.docId}
            onChange={(doc) => f.change({ docId: doc.id })}
            sentDocIds={new Set()}
            describedBy={docError ? "tugas-doc-error" : undefined}
            invalid={Boolean(docError)}
          />
          {f.doc && !docError && (
            <p className="text-sm text-ink-muted">
              {fill(t.words, { n: number(wordsInDoc(f.doc)) })}
            </p>
          )}
          {docError && <ErrorLine id="tugas-doc-error">{docError}</ErrorLine>}
        </div>
      ) : (
        <Field id="tugas-teks" label={t.fieldLabel} hint={t.fieldHint} error={textError}>
          <Textarea
            id="tugas-teks"
            className="min-h-60"
            value={f.form.text}
            aria-invalid={Boolean(textError) || undefined}
            aria-describedby={describedBy("tugas-teks", { hint: true, error: textError })}
            onChange={(e) => f.change({ text: e.target.value })}
          />
          <p className="text-sm text-ink-muted">{fill(t.words, { n: number(typedWords) })}</p>
        </Field>
      )}

      {f.failed && <ErrorBanner>{t.failed}</ErrorBanner>}
      {!f.failed && f.general.length > 0 && (
        <ErrorBanner>{f.general.map((p) => problemText(p, locale)).join(" ")}</ErrorBanner>
      )}
      <Button type="submit" loading={f.busy} className="justify-self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
