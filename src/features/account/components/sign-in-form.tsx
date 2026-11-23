"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { format, useT } from "@/lib/i18n/provider";
import { setViewer } from "@/lib/viewer";
import { saveAccount } from "../account-store";
import { simulateSignIn } from "../dummy-auth";
import { useCountdown } from "../hooks/use-countdown";
import {
  FORGOT_HREF,
  NEXT_PARAM,
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

/** Masuk (PLT-01). Validates, then moves on; there is no session while sign-in is bypassed. */
export function SignInForm() {
  const t = useT().account;
  const router = useRouter();
  const next = useSearchParams().get(NEXT_PARAM);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [failure, setFailure] = useState<"credentials" | "unverified" | null>(null);
  const [failures, setFailures] = useState(0);
  const lock = useCountdown();

  const emailError = submitted ? emailIssue(email) : null;
  const passwordError = submitted ? passwordPresent(password) : null;
  const locked = lock.seconds > 0;

  function submit() {
    setSubmitted(true);
    if (emailIssue(email) || passwordPresent(password)) {
      focusFirst([emailIssue(email) ? "email" : "password"]);
      return;
    }
    const result = simulateSignIn(email);
    if (result.ok) {
      setViewer("masuk");
      router.push(safeNext(next));
      return;
    }
    setFailure(result.reason);
    if (result.reason === "credentials" && failures + 1 >= MAX_FAILURES) {
      setFailures(0);
      lock.start(LOCK_SECONDS);
    } else if (result.reason === "credentials") {
      setFailures(failures + 1);
    }
  }

  /** Google sign-in stand-in: the same bypass as a successful email sign-in. */
  function google() {
    setViewer("masuk");
    router.push(safeNext(next));
  }

  function resend() {
    saveAccount({ email: email.trim() });
    router.push(withNext(VERIFY_HREF, next));
  }

  return (
    <AuthPage title={t.signIn.title} accent={t.signIn.accent} subtitle={t.signIn.subtitle}>
      <StudioSampleAside />
      <div className="grid gap-5">
        <GoogleButton mode="signIn" onPress={google} />
        <OrDivider />
      </div>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!locked) submit();
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
          <Button type="submit" disabled={locked}>
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
