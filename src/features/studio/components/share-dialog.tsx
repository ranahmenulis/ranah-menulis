"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner, Notice } from "@/components/ui/states";
import { VisibilityTag } from "@/components/ui/visibility-tag";

type Props = {
  open: boolean;
  onClose: () => void;
  documentTitle: string;
  /**
   * Stores what was written and opens "Tulis postingan" with this document chosen. Resolves false
   * when the text could not be stored first, so nothing is left behind unsaved.
   */
  onContinue: () => Promise<boolean>;
};

/**
 * "Bagikan" from the editor (STD-10, DESIGN.md 7.5). It shares nothing itself: it says what sharing
 * means, then hands over to "Tulis postingan", where the author picks the text and sees exactly what
 * becomes public. The notice has no close button on purpose (BR-STD-01, BR-COM-01).
 */
export function ShareDialog({ open, onClose, documentTitle, onContinue }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  function close() {
    if (busy) return;
    setFailed(false);
    onClose();
  }

  async function next() {
    setBusy(true);
    setFailed(false);
    const ok = await onContinue().catch(() => false);
    // The editor stays mounted in the background after the page changes, so the busy state must not
    // outlive this step: coming back would show a button that spins forever.
    setBusy(false);
    if (!ok) setFailed(true);
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      dismissible={!busy}
      swipeToDismiss
      title="Bagikan sebagai postingan"
      actions={
        <>
          <Button variant="text" onClick={close} disabled={busy}>
            Batal
          </Button>
          <Button onClick={() => void next()} loading={busy}>
            Pilih bagian untuk dibagikan
          </Button>
        </>
      }
    >
      <div className="grid gap-1.5">
        <b className="truncate text-sm font-medium">{documentTitle.trim() || "Tanpa judul"}</b>
        <VisibilityTag visibility="pribadi" />
      </div>
      <Notice>
        Dokumen ini tetap Pribadi. Yang menjadi publik hanya teks yang kamu pilih di langkah
        berikutnya, sebagai salinan. Mengubah dokumen sesudahnya tidak mengubah postingan.
      </Notice>
      <p className="text-sm text-ink-muted">
        Kamu memilih bagiannya, memberi judul dan genre, lalu menentukan siapa yang bisa melihatnya.
        Satu postingan maksimal 500 kata.
      </p>
      {failed && (
        <ErrorBanner>
          Tulisanmu belum tersimpan di perangkat ini, jadi belum bisa dibagikan. Coba lagi sebentar
          lagi.
        </ErrorBanner>
      )}
    </Dialog>
  );
}
