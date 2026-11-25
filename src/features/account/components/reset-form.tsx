"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session-context";
import { useT } from "@/lib/i18n/provider";
import { useAuthGateway } from "../auth-gateway-context";
import { FORGOT_HREF, NEXT_PARAM, SIGN_IN_HREF, withNext } from "../redirect";
import { confirmIssue, passwordIssue } from "../validation";
import { AuthPage } from "./auth-frame";
import { focusFirst } from "./email-field";
import { PasswordField } from "./password-field";

/**
 * Atur ulang sandi (PLT-01), opened from the link in the email. The link signs the reader in for
 * this one purpose, so without a session (an old link, another browser) the expired state shows;
 * `?status=kedaluwarsa` shows it too, which is how it is reached while sign-in is simulated.
 */
export function ResetForm() {
  const t = useT().account;
  const router = useRouter();
  const gateway = useAuthGateway();
  const session = useSession();
  const params = useSearchParams();
  const next = params.get(NEXT_PARAM);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<"same" | "password" | "limit" | "network" | null>(null);
  const [expiredNow, setExpiredNow] = useState(false);
  const [busy, setBusy] = useState(false);

  const passwordError = submitted ? passwordIssue(password) : null;
  const confirmError = submitted ? confirmIssue(password, confirmation) : null;
  const noLink = !gateway.simulated && session?.status !== "user";
  const expired = params.get("status") === "kedaluwarsa" || noLink || expiredNow;

  async function save() {
    setBusy(true);
    setFailure(null);
    const result = await gateway.updatePassword(password);
    setBusy(false);
    if (!result.ok) {
      if (result.reason === "expired") return setExpiredNow(true);
      return setFailure(result.reason);
    }
    // The done screen is shown first, so the sign-out below cannot swap it for the expired one.
    setDone(true);
    if (!gateway.simulated) {
      await gateway.signOut();
      router.refresh();
    }
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

  if (expired) {
    return (
      <AuthPage title={t.reset.expiredTitle} subtitle={t.reset.expiredBody}>
        <ButtonLink href={withNext(FORGOT_HREF, next)} className="justify-self-start">
          {t.reset.expiredAction}
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
          if (!busy) void save();
        }}
      >
        {failure && (
          <p role="alert" className="text-sm text-danger">
            {failure === "same"
              ? t.reset.same
              : failure === "password"
                ? t.errors.passwordWeak
                : t.errors[failure]}
          </p>
        )}
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
        <Button type="submit" disabled={busy}>
          {t.reset.submit}
        </Button>
      </form>
    </AuthPage>
  );
}
