"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { TextLink } from "@/components/ui/text-link";
import { format, useT } from "@/lib/i18n/provider";
import { setViewer } from "@/lib/viewer";
import { DEFAULT_ACCOUNT, resetAccount, saveAccount } from "../account-store";
import { simulateSignUp } from "../dummy-auth";
import { NEXT_PARAM, ONBOARDING_HREF, SIGN_IN_HREF, VERIFY_HREF, withNext } from "../redirect";
import { countryForZone, deviceTimeZone } from "../timezones";
import { emailIssue, passwordIssue } from "../validation";
import { PromisesAside } from "./auth-aside";
import { AuthPage } from "./auth-frame";
import { EmailField, focusFirst } from "./email-field";
import { GoogleButton, OrDivider } from "./google-button";
import { PasswordField } from "./password-field";
import { PasswordRules } from "./password-rules";

/** A new, empty account on this device (the dummy stand-in for creating one in Supabase Auth). */
function startAccount(email: string) {
  const zone = deviceTimeZone();
  resetAccount();
  saveAccount({
    email,
    memberSince: new Date().toISOString(),
    profile: {
      ...DEFAULT_ACCOUNT.profile,
      name: "",
      username: "",
      bio: "",
      genres: [],
      avatar: null,
      timeZone: zone,
      country: countryForZone(zone),
    },
  });
}

/**
 * Daftar (PLT-01, AC-01), in two steps (tahap J, user decision): first Google or an email (an
 * address already registered is caught here), then a password and the agreement. The new account
 * is always a Registered User; no role can be chosen here (AC-SA1). It starts empty on this device
 * and the email still has to be verified.
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
  const [exists, setExists] = useState(false);

  const emailError = emailSubmitted ? emailIssue(email) : null;
  const passwordError = submitted ? passwordIssue(password) : null;
  const agreeError = submitted && !agreed;

  function toPassword() {
    setEmailSubmitted(true);
    if (emailIssue(email)) return focusFirst(["email"]);
    if (!simulateSignUp(email).ok) {
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

  function submit() {
    setSubmitted(true);
    const problems = [passwordIssue(password) && "password", !agreed && "agree"].filter(
      (id): id is string => Boolean(id),
    );
    if (problems.length) return focusFirst(problems);
    startAccount(email.trim());
    router.push(withNext(VERIFY_HREF, next));
  }

  /** Google sign-up stand-in: Google has verified the address, so the profile comes next. */
  function google() {
    startAccount(DEFAULT_ACCOUNT.email);
    setViewer("masuk");
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
          <div className="grid gap-5">
            <GoogleButton mode="signUp" onPress={google} />
            <OrDivider />
          </div>
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
            submit();
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
            <Button type="submit">{t.signUp.submit}</Button>
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
