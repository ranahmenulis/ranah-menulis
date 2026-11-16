"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import { FORGOT_HREF, NEXT_PARAM, SIGN_IN_HREF, withNext } from "../redirect";
import { confirmIssue, passwordIssue } from "../validation";
import { AuthPage } from "./auth-frame";
import { focusFirst } from "./email-field";
import { PasswordField } from "./password-field";

/**
 * Atur ulang sandi (PLT-01), opened from the link in the email. `?status=kedaluwarsa` shows the
 * expired-link state, which is how that state is reached without a real link.
 */
export function ResetForm() {
  const t = useT().account;
  const params = useSearchParams();
  const next = params.get(NEXT_PARAM);
  const expired = params.get("status") === "kedaluwarsa";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  const passwordError = submitted ? passwordIssue(password) : null;
  const confirmError = submitted ? confirmIssue(password, confirmation) : null;

  if (expired) {
    return (
      <AuthPage title={t.reset.expiredTitle} subtitle={t.reset.expiredBody}>
        <ButtonLink href={withNext(FORGOT_HREF, next)} className="justify-self-start">
          {t.reset.expiredAction}
        </ButtonLink>
      </AuthPage>
    );
  }

  if (done) {
    return (
      <AuthPage title={t.reset.doneTitle} subtitle={t.reset.doneBody}>
        <ButtonLink href={withNext(SIGN_IN_HREF, next)} className="justify-self-start">
          {t.reset.doneAction}
        </ButtonLink>
      </AuthPage>
    );
  }

  return (
    <AuthPage title={t.reset.title} subtitle={t.reset.subtitle}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (passwordIssue(password) || confirmIssue(password, confirmation)) {
            return focusFirst([passwordIssue(password) ? "password" : "confirm"]);
          }
          setDone(true);
        }}
      >
        <PasswordField
          id="password"
          label={t.fields.newPassword}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={t.fields.passwordHint}
          error={passwordError && t.errors[passwordError]}
        />
        <PasswordField
          id="confirm"
          label={t.fields.confirmPassword}
          value={confirmation}
          onChange={setConfirmation}
          autoComplete="new-password"
          error={confirmError && t.errors[confirmError]}
        />
        <Button type="submit">{t.reset.submit}</Button>
      </form>
    </AuthPage>
  );
}
