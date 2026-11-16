"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/provider";
import { saveAccount } from "../../account-store";
import { confirmIssue, passwordIssue, passwordPresent } from "../../validation";
import { focusFirst } from "../email-field";
import { PasswordField } from "../password-field";

const FORM_ID = "change-password-form";

/**
 * Ubah kata sandi (PLT-01). The current password is only checked for being typed: there is no
 * server to check it against. Mounted only while open, so every opening starts empty.
 */
export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const t = useT().account;
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentError = submitted ? passwordPresent(current) : null;
  const nextError = submitted ? passwordIssue(next) : null;
  const confirmError = submitted ? confirmIssue(next, confirmation) : null;

  function submit() {
    setSubmitted(true);
    const first = passwordPresent(current)
      ? "current-password"
      : passwordIssue(next)
        ? "new-password"
        : confirmIssue(next, confirmation)
          ? "confirm-password"
          : null;
    if (first) return focusFirst([first]);
    saveAccount({ passwordChangedAt: new Date().toISOString() });
    toast({ message: t.settings.changePassword.done, key: "password-changed" });
    onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={t.settings.changePassword.title}
      description={t.settings.changePassword.description}
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            {t.settings.changePassword.cancel}
          </Button>
          <Button type="submit" form={FORM_ID}>
            {t.settings.changePassword.submit}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        noValidate
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <PasswordField
          id="current-password"
          label={t.fields.currentPassword}
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          error={currentError && t.errors[currentError]}
        />
        <PasswordField
          id="new-password"
          label={t.fields.newPassword}
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          hint={t.fields.passwordHint}
          error={nextError && t.errors[nextError]}
        />
        <PasswordField
          id="confirm-password"
          label={t.fields.confirmPassword}
          value={confirmation}
          onChange={setConfirmation}
          autoComplete="new-password"
          error={confirmError && t.errors[confirmError]}
        />
      </form>
    </Dialog>
  );
}
