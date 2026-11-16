"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reviewAssignment } from "../assignment-actions";
import { withMentorDecision, type MentorDecision } from "../assignment-status";
import type { AssignmentStore } from "../storage/assignment-store";
import type { AssignmentSubmission } from "../types";

const STEPS: { decision: MentorDecision; label: string; reason: string }[] = [
  {
    decision: "perlu-perbaikan",
    label: "Minta perbaikan",
    reason: "Adegannya belum jelas apa yang diinginkan tokohmu. Perjelas di dua paragraf pertama.",
  },
  { decision: "selesai", label: "Tandai selesai", reason: "Sudah jelas arahnya. Lanjutkan." },
];

/**
 * Stands in for the Mentor panel, which comes in 6g, so the feedback states can be tried now.
 * Development only (like the reviewer panel of a submission): it never shows in production. It
 * calls the same function the real panel will, which follows the transition table, so it cannot do
 * anything a mentor could not.
 */
export function DevMentorPanel({
  work,
  store,
}: {
  work: AssignmentSubmission;
  store: AssignmentStore;
}) {
  const [busy, setBusy] = useState(false);
  if (process.env.NODE_ENV === "production") return null;

  const available = STEPS.filter(
    (s) => withMentorDecision(work, s.decision, { now: 0, reason: s.reason }) !== null,
  );
  if (available.length === 0) return null;

  async function act(step: (typeof STEPS)[number]) {
    setBusy(true);
    try {
      await reviewAssignment(store, work.id, step.decision, step.reason);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      aria-label="Mentor, hanya untuk pengembangan"
      className="grid gap-2 border-t border-line pt-4"
    >
      <p className="text-xs text-ink-muted">
        Hanya untuk pengembangan. Panel Mentor menyusul; sampai itu, mainkan peran mentor di sini.
      </p>
      <div className="flex flex-wrap gap-2">
        {available.map((step) => (
          <Button
            key={step.decision}
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void act(step)}
          >
            {step.label}
          </Button>
        ))}
      </div>
    </aside>
  );
}
