"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { TextLink } from "@/components/ui/text-link";
import { format, useT } from "@/lib/i18n/provider";
import { useAuthGateway } from "../auth-gateway-context";
import { rememberPendingEmail } from "../pending-email";
import { NEXT_PARAM, ONBOARDING_HREF, SIGN_IN_HREF, VERIFY_HREF, withNext } from "../redirect";
import { emailIssue, passwordIssue } from "../validation";
import { PromisesAside } from "./auth-aside";
import { AuthPage } from "./auth-frame";
import { EmailField, focusFirst } from "./email-field";
import { GoogleButton, OrDivider } from "./google-button";
import { PasswordField } from "./password-field";
import { PasswordRules } from "./password-rules";

/** Why the sign-up could not go through (the form stays as typed). */
function FailureNote({ failure }: { failure: "password" | "limit" | "network" | null }) {
  const t = useT().account;
  if (!failure) return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {failure === "password" ? t.errors.passwordWeak : t.errors[failure]}
    </p>
  );
}

/**
 * Daftar (PLT-01, AC-01), in two steps (tahap J, user decision): first Google or an email (an
 * address already registered is caught here), then a password and the agreement. The new account
 * is always a Registered User; no role can be chosen here (AC-SA1) and it starts empty. The email
 * still has to be verified. A real sign-in system cannot say that an address is taken before the
 * form is sent, so that answer can also arrive on the second step, which then goes back to the first.
 */
export function SignUpForm() {
  const t = useT().account;
  const router = useRouter();
  const next = useSearchParams().get(NEXT_PARAM);
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const gateway = useAuthGateway();
  const [exists, setExists] = useState(false);
  const [failure, setFailure] = useState<"password" | "limit" | "network" | null>(null);
  const [busy, setBusy] = useState(false);

  const emailError = emailSubmitted ? emailIssue(email) : null;
  const passwordError = submitted ? passwordIssue(password) : null;
  const agreeError = submitted && !agreed;

  function toPassword() {
    setEmailSubmitted(true);
    if (emailIssue(email)) return focusFirst(["email"]);
    if (gateway.emailTaken?.(email)) {
      setExists(true);
      return focusFirst(["email"]);
    }
    setStep("password");
    // The password input exists after this render.
    requestAnimationFrame(() => focusFirst(["password"]));
  }

  function toEmail() {
    setStep("email");
    setSubmitted(false);
    requestAnimationFrame(() => focusFirst(["email"]));
  }

  async function submit() {
    setSubmitted(true);
    const problems = [passwordIssue(password) && "password", !agreed && "agree"].filter(
      (id): id is string => Boolean(id),
    );
    if (problems.length) return focusFirst(problems);
    setBusy(true);
    setFailure(null);
    const result = await gateway.signUp(email.trim(), password, next);
    setBusy(false);
    if (!result.ok) {
      if (result.reason === "exists") return toEmailTaken();
      setFailure(result.reason);
      return;
    }
    rememberPendingEmail(email.trim());
    router.refresh();
    // No email step needed (already signed in): the profile comes next.
    router.push(withNext(result.verified ? ONBOARDING_HREF : VERIFY_HREF, next));
  }

  function toEmailTaken() {
    setExists(true);
    toEmail();
  }

  /** Google has verified the address, so the profile comes next. */
  async function google() {
    const result = await gateway.continueWithGoogle?.("signUp", next);
    if (!result) return;
    router.refresh();
    router.push(withNext(ONBOARDING_HREF, next));
  }

  const existsError = exists && (
    <>
      {t.signUp.exists}{" "}
      <TextLink href={withNext(SIGN_IN_HREF, next)} className="underline">
        {t.signUp.existsAction}
      </TextLink>
    </>
  );

  return (
    <AuthPage
      title={t.signUp.title}
      accent={t.signUp.accent}
      eyebrow={format(t.signUp.step, { n: step === "email" ? "1" : "2" })}
      subtitle={
        step === "email"
          ? t.signUp.subtitle
          : format(t.signUp.passwordSubtitle, { email: email.trim() })
      }
    >
      <PromisesAside />
      {step === "email" ? (
        <>
          {gateway.continueWithGoogle && (
            <div className="grid gap-5">
              <GoogleButton mode="signUp" onPress={google} />
              <OrDivider />
            </div>
          )}
          <form
            noValidate
            className="grid gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              toPassword();
            }}
          >
            <EmailField
              value={email}
              onChange={(value) => {
                setEmail(value);
                setExists(false);
              }}
              error={existsError || (emailError && t.errors[emailError])}
            />
            <Button type="submit">{t.signUp.next}</Button>
          </form>
        </>
      ) : (
        <form
          noValidate
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!busy) void submit();
          }}
        >
          <PasswordField
            id="password"
            label={t.fields.password}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint={<PasswordRules value={password} />}
            error={passwordError && t.errors[passwordError]}
          />
          <div className="grid gap-2">
            <CheckChoice
              id="agree"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              aria-invalid={agreeError || undefined}
              label={t.signUp.agree}
            />
            {agreeError && (
              <p role="alert" className="text-sm text-danger">
                {t.errors.agreeRequired}
              </p>
            )}
          </div>
          <div className="grid gap-3">
            <FailureNote failure={failure} />
            <Button type="submit" disabled={busy}>
              {t.signUp.submit}
            </Button>
            <p className="text-xs text-ink-muted">{t.signUp.notice}</p>
          </div>
          <Button variant="text" size="sm" onClick={toEmail} className="justify-self-start">
            {t.signUp.changeEmail}
          </Button>
        </form>
      )}
      <p className="text-sm text-ink-muted">
        {t.signUp.haveAccount}{" "}
        <TextLink href={withNext(SIGN_IN_HREF, next)} className="font-medium underline">
          {t.signUp.signIn}
        </TextLink>
      </p>
    </AuthPage>
  );
}
