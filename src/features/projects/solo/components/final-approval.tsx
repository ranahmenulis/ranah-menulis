"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/field";
import { formatProjectDate } from "../../project-model";
import type { TimeZoneName } from "../../types";
import { approveFinal, requestChanges, type ActionResult } from "../solo-actions";
import {
  changeRounds,
  changeTarget,
  hasPreviews,
  MAX_CHANGE_ROUNDS,
  neededPreviews,
} from "../stage-model";
import type { SoloStore } from "../storage/solo-store";
import type { SoloProgress, SoloStage } from "../types";

const NOTE_LIMIT = 1000;
const STALE = "Tahap buku ini sudah berubah. Muat ulang halaman, lalu coba lagi.";
const FAILED = "Belum bisa menyimpan. Coba lagi.";

type Props = {
  target: { id: string; slug: string; stages: SoloStage[] };
  progress: SoloProgress | null;
  store: SoloStore;
  zone: TimeZoneName;
  /** Called once a decision is saved; the buttons are gone by then, so focus goes elsewhere. */
  onDecided: () => void;
};

/**
 * The final approval (SOL-02): approve, or ask for changes with a note. Approving starts
 * production and cannot be undone [usulan, Q-24], so it asks first. Asking for changes is limited
 * to two rounds; after that only approving is left.
 */
export function FinalApproval({ target, progress, store, zone, onDecided }: Props) {
  const [dialog, setDialog] = useState<"setuju" | "ubah" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = hasPreviews(target.stages, progress);
  const rounds = changeRounds(progress);
  const left = MAX_CHANGE_ROUNDS - rounds;
  const requests = progress?.log.filter((c) => c.kind === "minta-perubahan") ?? [];

  const close = () => {
    if (busy) return;
    setDialog(null);
    setError(null);
  };

  async function submit(run: () => Promise<ActionResult>) {
    setBusy(true);
    setError(null);
    try {
      const result = await run();
      if (result === "ok") {
        setDialog(null);
        setNote("");
        onDecided();
      } else {
        setError(result === "failed" ? FAILED : STALE);
      }
    } finally {
      setBusy(false);
    }
  }

  function sendChanges() {
    if (!note.trim()) {
      setError("Tulis perubahan yang kamu minta.");
      return;
    }
    void submit(() => requestChanges(store, target, note));
  }

  return (
    <section aria-labelledby="solo-final" className="grid gap-4 border border-line p-5">
      <div className="grid gap-1">
        <h2 id="solo-final" className="heading-sm">
          Persetujuan final
        </h2>
        <p className="text-sm text-ink-muted">
          {ready
            ? "Periksa pratinjau di atas. "
            : neededPreviews(target.stages).length > 0
              ? "Tim belum mengunggah semua pratinjau. Kamu bisa memutuskan setelah sampul dan isi buku siap dilihat. "
              : ""}
          Setelah kamu setuju, produksi dimulai dan tidak bisa dibatalkan.
          {left > 0
            ? ` Kamu masih bisa meminta perubahan ${left} kali.`
            : " Jatah permintaan perubahan sudah habis."}
        </p>
      </div>
      {requests.length > 0 && (
        <ul className="grid gap-2 text-sm">
          {requests.map((r) => (
            <li key={r.at} className="grid gap-0.5">
              <span className="text-xs text-ink-muted">
                Perubahan diminta {formatProjectDate(r.at, zone)}
              </span>
              <span className="wrap-anywhere">{r.note}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setDialog("setuju")} disabled={!ready}>
          Setujui
        </Button>
        {left > 0 && changeTarget(target.stages) !== null && (
          <Button variant="secondary" onClick={() => setDialog("ubah")}>
            Minta perubahan
          </Button>
        )}
      </div>

      <Dialog
        open={dialog === "setuju"}
        onClose={close}
        role="alertdialog"
        title="Setujui versi final?"
        description="Setelah disetujui, bukumu masuk produksi. Perubahan tidak bisa diminta lagi dan persetujuan tidak bisa dibatalkan."
        actions={
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void submit(() => approveFinal(store, target))}>
              Setujui dan mulai produksi
            </Button>
          </>
        }
      >
        {dialog === "setuju" && error && <p className="text-sm text-danger">{error}</p>}
      </Dialog>

      <Dialog
        open={dialog === "ubah"}
        onClose={close}
        title="Minta perubahan"
        description="Tulis apa yang perlu diubah. Tim akan memperbaikinya, lalu meminta persetujuanmu lagi."
        actions={
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>
              Batal
            </Button>
            <Button loading={busy} onClick={sendChanges}>
              Kirim permintaan
            </Button>
          </>
        }
      >
        <Field
          id="solo-catatan"
          label="Perubahan yang diminta"
          error={dialog === "ubah" ? error : null}
        >
          <Textarea
            id="solo-catatan"
            rows={5}
            maxLength={NOTE_LIMIT}
            value={note}
            aria-invalid={error ? true : undefined}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </Dialog>
    </section>
  );
}
