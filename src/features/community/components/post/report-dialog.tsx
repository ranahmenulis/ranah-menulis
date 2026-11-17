"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { RadioChoice } from "@/components/ui/choice";
import { REPORT_REASON_LABEL } from "../../moderation/reasons";
import type { ReportReason } from "../../types";

const REASONS = (Object.entries(REPORT_REASON_LABEL) as [ReportReason, string][]).map(
  ([id, label]) => ({ id, label }),
);

type Props = {
  /** What is being reported: "tulisan" or "komentar Farid Zulkifli". */
  subject: string | null;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
};

/** Report dialog (COM-05). One reason is required; the author of the report stays anonymous. */
export function ReportDialog({ subject, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);

  function close() {
    setReason(null);
    onClose();
  }

  return (
    <Dialog
      open={subject !== null}
      onClose={close}
      title={`Laporkan ${subject ?? ""}`.trim()}
      description="Pilih satu alasan. Penulisnya tidak tahu siapa yang melapor."
      actions={
        <>
          <Button variant="text" onClick={close}>
            Batal
          </Button>
          <Button
            disabled={reason === null}
            onClick={() => {
              if (!reason) return;
              onSubmit(reason);
              setReason(null);
            }}
          >
            Kirim laporan
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label="Alasan laporan" className="grid gap-3.5">
        {REASONS.map((r) => (
          <RadioChoice
            key={r.id}
            name="alasan-laporan"
            label={r.label}
            checked={reason === r.id}
            onChange={() => setReason(r.id)}
          />
        ))}
      </div>
    </Dialog>
  );
}
