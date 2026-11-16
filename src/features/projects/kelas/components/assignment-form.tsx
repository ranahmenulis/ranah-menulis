"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RadioChoice } from "@/components/ui/choice";
import { Field, Textarea, describedBy } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { docStats } from "@/features/studio/editor-stats";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { SubmitDocumentPicker } from "../../components/submit-document-picker";
import { formatNumber } from "../../project-model";
import { textToDoc, wordsInDoc, type AssignmentForm } from "../assignment-model";
import type { HandInResult } from "../assignment-flow";
import { useAssignmentForm } from "../hooks/use-assignment-form";

type Props = {
  docs: StudioDocument[];
  /** The label of the one button: "Kumpulkan tugas" or "Kumpulkan perbaikan". */
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
  const f = useAssignmentForm({ docs, onSend });
  const docError = f.errorOf("doc");
  const textError = f.errorOf("text");
  const typedWords = f.form.source === "teks" ? docStats(textToDoc(f.form.text)).words : 0;

  return (
    <form className="grid gap-5" noValidate onSubmit={(e) => void f.submit(e)}>
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">Sumber tugas</legend>
        <RadioChoice
          name="sumber"
          checked={f.form.source === "studio"}
          onChange={() => f.setSource("studio")}
          label="Dari Studio"
          hint="Yang dikirim adalah salinan beku dokumenmu pada saat kamu menekan tombol."
        />
        <RadioChoice
          name="sumber"
          checked={f.form.source === "teks"}
          onChange={() => f.setSource("teks")}
          label="Ketik langsung"
          hint="Untuk tugas pendek yang tidak perlu disimpan di Studio."
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
            <p className="text-sm text-ink-muted">{formatNumber(wordsInDoc(f.doc))} kata.</p>
          )}
          {docError && <ErrorLine id="tugas-doc-error">{docError}</ErrorLine>}
        </div>
      ) : (
        <Field
          id="tugas-teks"
          label="Tugasmu"
          hint="Pisahkan paragraf dengan satu baris kosong."
          error={textError}
        >
          <Textarea
            id="tugas-teks"
            className="min-h-60"
            value={f.form.text}
            aria-invalid={Boolean(textError) || undefined}
            aria-describedby={describedBy("tugas-teks", { hint: true, error: textError })}
            onChange={(e) => f.change({ text: e.target.value })}
          />
          <p className="text-sm text-ink-muted">{formatNumber(typedWords)} kata.</p>
        </Field>
      )}

      {f.failed && (
        <ErrorBanner>
          Tugas belum terkirim karena data di perangkat ini tidak bisa ditulis. Isianmu masih ada;
          coba lagi sebentar lagi.
        </ErrorBanner>
      )}
      {!f.failed && f.general.length > 0 && (
        <ErrorBanner>{f.general.map((p) => p.message).join(" ")}</ErrorBanner>
      )}
      <Button type="submit" loading={f.busy} className="justify-self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
