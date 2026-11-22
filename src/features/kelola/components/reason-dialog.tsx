"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Textarea, describedBy } from "@/components/ui/field";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { REASON_LIMIT, validateReason, type ReasonProblem } from "../reason";

/**
 * Asks for the note a reviewer writes before a decision the participant is told about (PRD 10.5,
 * KLS-03). A missing required note keeps the dialog open and the text as it was; nothing is sent.
 * Mounted per step, so every opening starts empty.
 */
export function ReasonDialog({
  title,
  hint,
  fieldLabel,
  required = true,
  confirmLabel,
  emptyMessage,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  hint: string;
  fieldLabel?: string;
  required?: boolean;
  confirmLabel: string;
  /** Replaces the default text when a required note is left empty. */
  emptyMessage?: string;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const t = useT().common.reasonDialog;
  const locale = useLocale();
  const limit = REASON_LIMIT.toLocaleString(locale === "en" ? "en-US" : "id-ID");
  const [text, setText] = useState("");
  const [problem, setProblem] = useState<ReasonProblem | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const error =
    problem === "kosong" && emptyMessage
      ? emptyMessage
      : problem === "kosong"
        ? t.empty
        : problem
          ? format(t.tooLong, { limit })
          : undefined;
  const id = "alasan-keputusan";

  function submit() {
    const found = validateReason(text, required);
    setProblem(found);
    if (found) field.current?.focus();
    else onConfirm(text.trim());
  }

  return (
    <Dialog
      open
      onClose={busy ? () => {} : onClose}
      title={title}
      description={hint}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {t.cancel}
          </Button>
          <Button onClick={submit} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Field
        id={id}
        label={fieldLabel ?? t.field}
        optional={!required}
        hint={format(t.limit, { limit })}
        error={error}
      >
        <Textarea
          id={id}
          ref={field}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint: true, error })}
        />
      </Field>
    </Dialog>
  );
}
