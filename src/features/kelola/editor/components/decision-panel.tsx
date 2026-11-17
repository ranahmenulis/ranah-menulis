"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorBanner, Notice } from "@/components/ui/states";
import { reviewSubmission, type ActionResult } from "@/features/projects/submission-actions";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Decision } from "@/features/projects/submission-status";
import type { Submission } from "@/features/projects/submission-types";
import { stepCopy, stepsFor } from "../review-model";
import { ReasonDialog } from "../../components/reason-dialog";

const MESSAGE: Partial<Record<ActionResult, string>> = {
  rejected:
    "Status karya ini sudah berubah, jadi langkah itu tidak bisa dijalankan. Tampilan sudah diperbarui.",
  missing: "Karya ini tidak ditemukan lagi.",
};

/**
 * The steps the status allows, nothing else (PRD 10.5). A lone step ("Mulai tinjau") is the filled
 * button; the three decisions are outlined and the confirming button in their dialog is filled. A step with a reason opens a
 * dialog; "Mulai tinjau" is one click. When the status changes the buttons disappear, so focus goes
 * to the heading, which `onDone` receives.
 */
export function DecisionPanel({
  work,
  store,
  onDone,
  onRejected,
}: {
  work: Submission;
  store: SubmissionStore;
  onDone: () => void;
  onRejected: () => void;
}) {
  const steps = stepsFor(work);
  const [asking, setAsking] = useState<Decision | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  // With no step left the panel is gone, except to say why the last attempt did nothing.
  if (steps.length === 0 && !result) return null;

  async function act(decision: Decision, reason?: string) {
    setBusy(true);
    setResult(null);
    const outcome = await reviewSubmission(store, work.id, decision, reason);
    setBusy(false);
    setAsking(null);
    if (outcome === "ok") onDone();
    else {
      setResult(outcome);
      if (outcome === "rejected") onRejected();
    }
  }

  const step = steps.find((s) => s.decision === asking);
  return (
    <section aria-labelledby="langkah-title" className="grid gap-3 border-t border-line pt-6">
      <h2 id="langkah-title" className="heading-md">
        Langkah berikutnya
      </h2>
      {result === "failed" && (
        <ErrorBanner>
          Keputusan belum tersimpan karena data di perangkat ini tidak bisa ditulis. Coba lagi
          sebentar lagi.
        </ErrorBanner>
      )}
      {result && MESSAGE[result] && <Notice>{MESSAGE[result]}</Notice>}
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <Button
            key={s.decision}
            variant={steps.length === 1 ? "primary" : "secondary"}
            disabled={busy || !!s.blocked}
            loading={busy && !s.needsReason}
            onClick={() => (s.needsReason ? setAsking(s.decision) : void act(s.decision))}
          >
            {s.label}
          </Button>
        ))}
      </div>
      {steps.map(
        (s) =>
          s.blocked && (
            <p key={s.decision} className="text-sm text-ink-muted">
              {s.label}: {s.blocked}
            </p>
          ),
      )}
      {step && step.decision !== "peninjauan" && (
        <ReasonDialog
          title={stepCopy[step.decision].title}
          hint={stepCopy[step.decision].hint}
          confirmLabel={step.label}
          busy={busy}
          onConfirm={(reason) => void act(step.decision, reason)}
          onClose={() => setAsking(null)}
        />
      )}
    </section>
  );
}
