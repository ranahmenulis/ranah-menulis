"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { closeJudging, reopenJudging } from "../../juri/judge-actions";
import { judgingStatus, judgingText } from "../../juri/judge-model";
import { useJudgingLog } from "../../juri/score-store";
import { ReasonDialog } from "../../components/reason-dialog";
import type { ContestStage } from "@/features/projects/lomba/types";
import { isPlatformAdmin } from "@/lib/roles";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";

const failed = {
  "sudah-berubah": "Status penilaian sudah berubah, jadi tidak ada yang dilakukan.",
  "belum-waktunya": "Penerimaan karya belum ditutup, jadi penilaian belum bisa ditutup.",
  catatan: "Tulis catatan untuk membuka kembali penilaian.",
} as const;

/**
 * Closing judging (BR-PRJ-09). The Organizer closes it; once closed no Judge can change a score.
 * An Administrator can reopen it with a note that stays in the log. The result is said beside the
 * button, because the button that was pressed is gone afterwards.
 */
export function JudgingControls({ slug, stage }: { slug: string; stage: ContestStage }) {
  const log = useJudgingLog();
  const admin = isPlatformAdmin(useEffectiveRoles());
  const status = judgingStatus(stage, log, slug);
  const [asking, setAsking] = useState<"tutup" | "buka" | null>(null);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);

  function done(text: string) {
    setAsking(null);
    setSaid(text);
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section
      aria-labelledby="penilaian-juri-title"
      className="grid gap-3 border-t border-line pt-5"
    >
      <h3 id="penilaian-juri-title" className="heading-sm">
        Penilaian juri
      </h3>
      <p className="text-sm">{judgingText[status]}</p>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      <div className="flex flex-wrap gap-2">
        {status === "dibuka" && (
          <Button variant="secondary" onClick={() => setAsking("tutup")}>
            Tutup penilaian
          </Button>
        )}
        {status === "ditutup" && admin && (
          <Button variant="secondary" onClick={() => setAsking("buka")}>
            Buka penilaian kembali
          </Button>
        )}
      </div>
      {status === "ditutup" && !admin && (
        <p className="text-xs text-ink-muted">Hanya Administrator yang bisa membukanya kembali.</p>
      )}
      {asking === "tutup" && (
        <Dialog
          open
          onClose={() => setAsking(null)}
          role="alertdialog"
          title="Tutup penilaian?"
          description="Juri tidak bisa mengubah skor lagi. Hanya Administrator yang bisa membukanya kembali, dengan catatan."
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                Batal
              </Button>
              <Button
                onClick={() => {
                  const result = closeJudging(slug, stage, Date.now());
                  done(result === "ok" ? "Penilaian ditutup." : failed[result]);
                }}
              >
                Tutup penilaian
              </Button>
            </>
          }
        />
      )}
      {asking === "buka" && (
        <ReasonDialog
          title="Buka penilaian kembali?"
          hint="Juri bisa mengubah skor lagi. Catatanmu tersimpan di riwayat penutupan."
          fieldLabel="Catatan"
          confirmLabel="Buka kembali"
          busy={false}
          onClose={() => setAsking(null)}
          onConfirm={(note) => {
            const result = reopenJudging(slug, note, Date.now());
            done(result === "ok" ? "Penilaian dibuka kembali." : failed[result]);
          }}
        />
      )}
    </section>
  );
}
