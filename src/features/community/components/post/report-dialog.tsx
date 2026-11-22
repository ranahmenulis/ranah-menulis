"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { RadioChoice } from "@/components/ui/choice";
import { format, useT } from "@/lib/i18n/provider";
import type { ReportReason } from "../../types";

const REASONS: ReportReason[] = ["spam", "hate", "copyright", "other"];

type Props = {
  /** What is being reported, already in the interface language ("tulisan", "komentar Farid"). */
  subject: string | null;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
};

/** Report dialog (COM-05). One reason is required; the author of the report stays anonymous. */
export function ReportDialog({ subject, onClose, onSubmit }: Props) {
  const t = useT().post.report;
  const [reason, setReason] = useState<ReportReason | null>(null);

  function close() {
    setReason(null);
    onClose();
  }

  return (
    <Dialog
      open={subject !== null}
      onClose={close}
      title={format(t.title, { subject: subject ?? "" }).trim()}
      description={t.description}
      actions={
        <>
          <Button variant="text" onClick={close}>
            {t.cancel}
          </Button>
          <Button
            disabled={reason === null}
            onClick={() => {
              if (!reason) return;
              onSubmit(reason);
              setReason(null);
            }}
          >
            {t.submit}
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label={t.group} className="grid gap-3.5">
        {REASONS.map((r) => (
          <RadioChoice
            key={r}
            name="alasan-laporan"
            label={t.reasons[r]}
            checked={reason === r}
            onChange={() => setReason(r)}
          />
        ))}
      </div>
    </Dialog>
  );
}
