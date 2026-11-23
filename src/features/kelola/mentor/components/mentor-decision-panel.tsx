"use client";

import { useState } from "react";
import { useLocale, useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { ErrorBanner, Notice } from "@/components/ui/states";
import { reviewAssignment, type ActionResult } from "@/features/projects/kelas/assignment-actions";
import type { MentorDecision } from "@/features/projects/kelas/assignment-status";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { AssignmentSubmission } from "@/features/projects/kelas/types";
import { ReasonDialog } from "../../components/reason-dialog";
import { mentorStepCopyOf, mentorStepsFor } from "../mentor-review";
import { Gavel } from "@phosphor-icons/react/dist/ssr";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

/**
 * The steps the status allows (KLS-03): ask for a repair (a note is required) or mark it done (a
 * note is optional). Both go through a dialog and neither is the filled button; the confirming
 * button in the dialog is. When the status changes the panel disappears, so focus goes to the
 * heading, which `onDone` receives. A message about a failed attempt stays even with no steps left.
 */
export function MentorDecisionPanel({
  work,
  store,
  onDone,
  onRejected,
}: {
  work: AssignmentSubmission;
  store: AssignmentStore;
  onDone: () => void;
  onRejected: () => void;
}) {
  const t = useT().kelolaMentor.decision;
  const locale = useLocale();
  const MESSAGE: Partial<Record<ActionResult, string>> = {
    rejected: t.rejected,
    missing: t.missing,
  };
  const steps = mentorStepsFor(work, locale);
  const [asking, setAsking] = useState<MentorDecision | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  if (steps.length === 0 && !result) return null;

  async function act(decision: MentorDecision, note: string) {
    setBusy(true);
    setResult(null);
    const outcome = await reviewAssignment(store, work.id, decision, note || undefined);
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
    <section aria-labelledby="langkah-title" className={cn(cardClass, "grid min-w-0 gap-3")}>
      <h2 id="langkah-title" className="flex items-center gap-2.5 heading-md">
        <SectionIcon icon={Gavel} />
        {t.title}
      </h2>
      {result === "failed" && <ErrorBanner>{t.failed}</ErrorBanner>}
      {result && MESSAGE[result] && <Notice>{MESSAGE[result]}</Notice>}
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <Button
            key={s.decision}
            variant="secondary"
            disabled={busy}
            onClick={() => setAsking(s.decision)}
          >
            {s.label}
          </Button>
        ))}
      </div>
      {step && (
        <ReasonDialog
          title={mentorStepCopyOf(step.decision, locale).title}
          hint={mentorStepCopyOf(step.decision, locale).hint}
          fieldLabel={mentorStepCopyOf(step.decision, locale).fieldLabel}
          required={step.required}
          confirmLabel={step.label}
          busy={busy}
          onConfirm={(note) => void act(step.decision, note)}
          onClose={() => setAsking(null)}
        />
      )}
    </section>
  );
}
