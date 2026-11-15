"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

/**
 * "Kirim ke proyek". Projects does not exist yet (step 6f), so there is nothing to send to and the
 * dialog says so rather than guessing the submission rules (Q-19 onward). The door is in place for
 * 6f to fill.
 */
export function SendToProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      swipeToDismiss
      title="Kirim ke proyek"
      description="Belum ada proyek yang menerima karya. Saat ada, kamu bisa mengirim dokumen ini dari sini."
      actions={<Button onClick={onClose}>Tutup</Button>}
    />
  );
}
