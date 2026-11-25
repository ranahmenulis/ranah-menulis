"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { format, useT } from "@/lib/i18n/provider";
import { useAuthGateway } from "../../auth-gateway-context";

/**
 * Confirmation before deleting the account: the reader types the word first, so it cannot be one
 * stray click. The account itself is deleted (profile, roles, photo); documents and Community data
 * kept on this device are not.
 * Mounted only while open.
 */
export function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const t = useT().account;
  const router = useRouter();
  const toast = useToast();
  const gateway = useAuthGateway();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const word = t.settings.deleteDialog.word;
  const ready = typed.trim().toUpperCase() === word;

  async function confirm() {
    if (!ready || busy) return;
    setBusy(true);
    setFailed(false);
    const result = await gateway.deleteAccount();
    setBusy(false);
    if (!result.ok) return setFailed(true);
    toast({ message: t.settings.deleteDialog.done, key: "account-deleted" });
    onClose();
    router.refresh();
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
          <Button
            variant="danger"
            type="submit"
            form="delete-account-form"
            disabled={!ready || busy}
          >
            {t.settings.deleteDialog.confirm}
          </Button>
        </>
      }
    >
      <form
        id="delete-account-form"
        noValidate
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void confirm();
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
        {failed && (
          <p role="alert" className="text-sm text-danger">
            {t.settings.deleteDialog.failed}
          </p>
        )}
      </form>
    </Dialog>
  );
}
