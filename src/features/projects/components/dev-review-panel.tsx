"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reviewSubmission } from "../submission-actions";
import { withDecision, type Decision } from "../submission-status";
import type { SubmissionStore } from "../storage/submission-store";
import type { Submission } from "../submission-types";

const STEPS: { decision: Decision; label: string; reason?: string }[] = [
  { decision: "peninjauan", label: "Mulai tinjau" },
  {
    decision: "perlu-revisi",
    label: "Minta revisi",
    reason: "Paragraf pembuka belum menarik pembaca. Perkuat satu atau dua paragraf pertama.",
  },
  { decision: "diterima", label: "Terima", reason: "Karya ini layak diterbitkan. Terima kasih." },
  { decision: "ditolak", label: "Tolak", reason: "Karya ini belum sesuai dengan tema proyek." },
];

/**
 * Stands in for the Editor and Judge panels, which come in 6g, so the review states can be tried
 * now. Development only (like "Tandai lunas"): it never shows in production. It calls the same
 * function the real panels will, which follows the transition table, so it cannot do anything a
 * reviewer could not.
 */
export function DevReviewPanel({ work, store }: { work: Submission; store: SubmissionStore }) {
  const [busy, setBusy] = useState(false);
  if (process.env.NODE_ENV === "production") return null;

  const available = STEPS.filter((s) => withDecision(work, s.decision, { now: 0 }) !== null);
  if (available.length === 0) return null;

  async function act(step: (typeof STEPS)[number]) {
    setBusy(true);
    await reviewSubmission(store, work.id, step.decision, step.reason);
    setBusy(false);
  }

  return (
    <aside
      aria-label="Peninjau, hanya untuk pengembangan"
      className="grid gap-2 border-t border-line pt-4"
    >
      <p className="text-xs text-ink-muted">
        Hanya untuk pengembangan. Panel Editor dan Juri menyusul; sampai itu, mainkan peran peninjau
        di sini.
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
