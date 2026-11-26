"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { format, useT } from "@/lib/i18n/provider";
import { useAuthGateway } from "../auth-gateway-context";
import { useCountdown } from "../hooks/use-countdown";
import { rememberPendingEmail } from "../pending-email";
import {
  FORGOT_HREF,
  NEXT_PARAM,
  ONBOARDING_HREF,
  safeNext,
  SIGN_UP_HREF,
  VERIFY_HREF,
  withNext,
} from "../redirect";
import { emailIssue, passwordPresent } from "../validation";
import { StudioSampleAside } from "./auth-aside";
import { AuthPage } from "./auth-frame";
import { EmailField, focusFirst } from "./email-field";
import { GoogleButton, OrDivider } from "./google-button";
import { PasswordField } from "./password-field";

/** Wrong attempts allowed before the form waits (SEC-01: repeated attempts are limited) [usulan]. */
const MAX_FAILURES = 5;
const LOCK_SECONDS = 30;

/** Masuk (PLT-01). Checks the fields, asks the sign-in system, then moves on. */
export function SignInForm() {
  const t = useT().account;
  const router = useRouter();
  const next = useSearchParams().get(NEXT_PARAM);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const gateway = useAuthGateway();
  const [failure, setFailure] = useState<"credentials" | "unverified" | "limit" | "network" | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState(0);
  const lock = useCountdown();

  const emailError = submitted ? emailIssue(email) : null;
  const passwordError = submitted ? passwordPresent(password) : null;
  const locked = lock.seconds > 0;

  /** Signed in: the server reads the new session on refresh; a profile not finished goes to Mulai. */
  function enter(onboarded: boolean) {
    router.refresh();
    router.push(onboarded ? safeNext(next) : withNext(ONBOARDING_HREF, next));
  }

  async function submit() {
    setSubmitted(true);
    if (emailIssue(email) || passwordPresent(password)) {
      focusFirst([emailIssue(email) ? "email" : "password"]);
      return;
    }
    setBusy(true);
    const result = await gateway.signIn(email.trim(), password);
    setBusy(false);
    if (result.ok) return enter(result.onboarded);
    setFailure(result.reason);
    if (result.reason === "credentials" && failures + 1 >= MAX_FAILURES) {
      setFailures(0);
      lock.start(LOCK_SECONDS);
    } else if (result.reason === "credentials") {
      setFailures(failures + 1);
    }
  }

  async function google() {
    const result = await gateway.continueWithGoogle?.("signIn", next);
    if (result) enter(result.onboarded);
  }

  /** The address was never verified: send the email again, then wait on the Verifikasi screen. */
  async function resend() {
    rememberPendingEmail(email.trim());
    await gateway.resendVerification(email.trim(), next);
    router.push(withNext(VERIFY_HREF, next));
  }

  return (
    <AuthPage title={t.signIn.title} accent={t.signIn.accent} subtitle={t.signIn.subtitle}>
      <StudioSampleAside />
      {gateway.continueWithGoogle && (
        <div className="grid gap-5">
          <GoogleButton mode="signIn" onPress={google} />
          <OrDivider />
        </div>
      )}
      <form
        noValidate
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!locked && !busy) void submit();
        }}
      >
        {locked && (
          <p role="alert" className="text-sm text-danger">
            {format(t.signIn.locked, { seconds: String(lock.seconds) })}
          </p>
        )}
        {!locked && failure === "credentials" && (
          <p role="alert" className="text-sm text-danger">
            {t.signIn.wrong}
          </p>
        )}
        {(failure === "limit" || failure === "network") && (
          <p role="alert" className="text-sm text-danger">
            {t.errors[failure]}
          </p>
        )}
        {failure === "unverified" && (
          <Notice
            action={
              <Button variant="text" size="sm" onClick={resend}>
                {t.signIn.unverifiedAction}
              </Button>
            }
          >
            {t.signIn.unverified}
          </Notice>
        )}
        <EmailField value={email} onChange={setEmail} error={emailError && t.errors[emailError]} />
        <PasswordField
          id="password"
          label={t.fields.password}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={passwordError && t.errors[passwordError]}
        />
        <div className="grid gap-4">
          <Button type="submit" disabled={locked || busy}>
            {t.signIn.submit}
          </Button>
          <TextLink href={FORGOT_HREF} className="justify-self-start text-sm text-ink-muted">
            {t.signIn.forgot}
          </TextLink>
        </div>
      </form>
      <p className="text-sm text-ink-muted">
        {t.signIn.noAccount}{" "}
        <TextLink href={withNext(SIGN_UP_HREF, next)} className="font-medium underline">
          {t.signIn.signUp}
        </TextLink>
      </p>
    </AuthPage>
  );
}
