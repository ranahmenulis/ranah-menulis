"use client";

import { useState, type FormEvent } from "react";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import {
  emptyAssignmentForm,
  validateAssignment,
  type AssignmentForm,
  type AssignmentProblem,
} from "../assignment-model";
import type { HandInResult } from "../assignment-flow";
import type { AssignmentSource } from "../types";

type Input = {
  /** Documents that can be picked: everything outside Sampah. */
  docs: StudioDocument[];
  onSend: (form: AssignmentForm) => Promise<HandInResult>;
};

/**
 * State of the hand-in form: the source, the document or the typed text, which messages show, and
 * sending. Once the participant pressed send every broken rule shows; before that only the chosen
 * document's own problem does. Nothing typed is ever cleared by a failure.
 */
export function useAssignmentForm({ docs, onSend }: Input) {
  const [form, setForm] = useState<AssignmentForm>(emptyAssignmentForm);
  const [attempted, setAttempted] = useState(false);
  /** Problems found when sending, from data read fresh at that moment. */
  const [late, setLate] = useState<AssignmentProblem[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const doc = docs.find((d) => d.id === form.docId) ?? null;
  const problems = validateAssignment({ form, doc });
  const shown = late.length > 0 ? late : attempted ? problems : [];
  const live = form.docId !== null && !shown.some((p) => p.field === "doc") ? problems : [];
  const errorOf = (field: AssignmentProblem["field"]) =>
    [...shown, ...(field === "doc" ? live : [])].find((p) => p.field === field)?.message;

  function change(patch: Partial<AssignmentForm>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setLate([]);
    setFailed(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    if (problems.length > 0) return;
    setBusy(true);
    setFailed(false);
    const result = await onSend(form);
    setBusy(false);
    if (result.kind === "invalid") setLate(result.problems);
    if (result.kind === "failed") setFailed(true);
  }

  return {
    form,
    doc,
    change,
    setSource: (source: AssignmentSource) => change({ source }),
    submit,
    errorOf,
    /** The rule that belongs to no field: the class not started, a repeat, a missing task. */
    general: shown.filter((p) => p.field === "closed"),
    busy,
    failed,
  };
}
