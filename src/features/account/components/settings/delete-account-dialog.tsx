"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { format, useT } from "@/lib/i18n/provider";
import { setViewer } from "@/lib/viewer";
import { resetAccount } from "../../account-store";

/**
 * Confirmation before deleting the account: the reader types the word first, so it cannot be one
 * stray click. Only the saved account is cleared here; documents and Community data are not.
 * Mounted only while open.
 */
export function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const t = useT().account;
  const router = useRouter();
  const toast = useToast();
  const [typed, setTyped] = useState("");
  const word = t.settings.deleteDialog.word;
  const ready = typed.trim().toUpperCase() === word;

  function confirm() {
    if (!ready) return;
    resetAccount();
    setViewer("tamu");
    toast({ message: t.settings.deleteDialog.done, key: "account-deleted" });
    onClose();
    router.push("/");
  }

  return (
    <Dialog
      open
      role="alertdialog"
      onClose={onClose}
      title={t.settings.deleteDialog.title}
      description={format(t.settings.deleteDialog.description, { word })}
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            {t.settings.deleteDialog.cancel}
          </Button>
          <Button variant="danger" type="submit" form="delete-account-form" disabled={!ready}>
            {t.settings.deleteDialog.confirm}
          </Button>
        </>
      }
    >
      <form
        id="delete-account-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          confirm();
        }}
      >
        <Field id="delete-confirm" label={t.settings.deleteDialog.label}>
          <Input
            id="delete-confirm"
            value={typed}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            onChange={(event) => setTyped(event.target.value)}
          />
        </Field>
      </form>
    </Dialog>
  );
}
