"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { canOfferCancel, cancelMessage } from "../cancel-model";
import { cancelOwnRegistration } from "../cancel-flow";
import type { AssignmentStore } from "../kelas/storage/assignment-store";
import { assignmentStore } from "../kelas/storage/store";
import type { SubmissionStore } from "../storage/submission-store";
import { submissionStore } from "../storage/store";
import type { Project, Registration } from "../types";

/** Said after cancelling. The cancel button is gone by then, so this line takes the focus. */
export function CancelledNotice() {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ref.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <p
      ref={ref}
      role="status"
      tabIndex={-1}
      className="bg-subtle px-4 py-3 text-sm text-ink outline-none"
    >
      Pendaftaranmu dibatalkan. Kuota dilepas, dan kamu bisa mendaftar lagi selama masih ada tempat.
    </p>
  );
}

type Props = {
  project: Project;
  /** Your own live registration; undefined once it is gone. */
  registration?: Registration;
  /** Called after a successful cancel (the parent may show the notice itself). */
  onCancelled?: () => void;
  /** Show the notice here after cancelling, for parents that stay mounted. */
  showNotice?: boolean;
  submissions?: SubmissionStore;
  assignments?: AssignmentStore;
};

/**
 * Cancel a free registration (PRJ-06, BR-PRJ-11). Paid projects get nothing here. Rules are read
 * again at the click, so a refusal arrives as a sentence under the link, not as a disabled button.
 */
export function CancelRegistration({
  project,
  registration,
  onCancelled,
  showNotice = false,
  submissions = submissionStore,
  assignments = assignmentStore,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!registration) return showNotice && done ? <CancelledNotice /> : null;
  if (!canOfferCancel(project, registration)) return null;

  async function confirm() {
    setBusy(true);
    const result = await cancelOwnRegistration({ project, submissions, assignments });
    setBusy(false);
    setOpen(false);
    if (result.kind === "cancelled") {
      setDone(true);
      onCancelled?.();
      return;
    }
    setMessage(
      result.kind === "blocked"
        ? cancelMessage(result.block)
        : "Pendaftaran gagal dibatalkan. Coba lagi sebentar lagi.",
    );
  }

  return (
    <div className="grid justify-items-start gap-2">
      <Button
        variant="text"
        className="-ml-1 text-sm text-ink-muted"
        onClick={() => {
          setMessage(null);
          setOpen(true);
        }}
      >
        Batalkan pendaftaran
      </Button>
      {message && (
        <p role="status" className="text-sm text-ink">
          {message}
        </p>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        role="alertdialog"
        title="Batalkan pendaftaran?"
        description={`Pendaftaranmu di ${project.title} dicabut dan kuotamu dilepas. Kamu bisa mendaftar lagi selama kuota dan tenggat masih ada.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Tetap terdaftar
            </Button>
            <Button variant="danger" onClick={confirm} loading={busy}>
              Batalkan pendaftaran
            </Button>
          </>
        }
      />
    </div>
  );
}
