import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

/**
 * Withdrawing cannot be undone, so it says what stays and what goes before it happens. The danger
 * button is the only red thing on the screen (DESIGN.md: red is for dangerous actions).
 */
export function WithdrawDialog({
  open,
  title,
  projectTitle,
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  projectTitle: string;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title="Tarik karya ini?"
      description={`“${title}” tidak akan ditinjau lagi di ${projectTitle} dan tidak bisa dikembalikan. Salinan yang sudah terkirim tetap tersimpan sebagai riwayat. Jatah karyamu terlepas, jadi kamu bisa mengirim dokumen lain atau dokumen yang sama.`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            Tarik karya
          </Button>
        </>
      }
    />
  );
}
