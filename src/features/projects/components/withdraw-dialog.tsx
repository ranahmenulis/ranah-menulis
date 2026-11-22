"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { fill } from "@/features/studio/copy/fill";
import { useT } from "@/lib/i18n/provider";

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
  const t = useT().projectsFlow.detail.withdrawDialog;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title={t.title}
      description={fill(t.body, { title, project: projectTitle })}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {t.cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {t.confirm}
          </Button>
        </>
      }
    />
  );
}
