"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { TextLink } from "@/components/ui/text-link";
import { useT } from "@/lib/i18n/provider";
import { DEFAULT_ACCOUNT, resetAccount, saveAccount } from "../account-store";
import { simulateSignUp } from "../dummy-auth";
import { NEXT_PARAM, SIGN_IN_HREF, VERIFY_HREF, withNext } from "../redirect";
import { countryForZone, deviceTimeZone } from "../timezones";
import { emailIssue, passwordIssue } from "../validation";
import { AuthPage } from "./auth-frame";
import { EmailField, focusFirst } from "./email-field";
import { PasswordField } from "./password-field";

/**
 * Daftar (PLT-01, AC-01). The new account is always a Registered User; no role can be chosen here
 * (AC-SA1). It starts empty on this device and the email still has to be verified.
 */
export function SignUpForm() {
  const t = useT().account;
  const router = useRouter();
  const next = useSearchParams().get(NEXT_PARAM);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [exists, setExists] = useState(false);

  const emailError = submitted ? emailIssue(email) : null;
  const passwordError = submitted ? passwordIssue(password) : null;
  const agreeError = submitted && !agreed;

  function submit() {
    setSubmitted(true);
    const problems = [
      emailIssue(email) && "email",
      passwordIssue(password) && "password",
      !agreed && "agree",
    ].filter((id): id is string => Boolean(id));
    if (problems.length) return focusFirst(problems);

    if (!simulateSignUp(email).ok) {
      setExists(true);
      return focusFirst(["email"]);
    }
    const zone = deviceTimeZone();
    resetAccount();
    saveAccount({
      email: email.trim(),
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
    router.push(withNext(VERIFY_HREF, next));
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
    <AuthPage title={t.signUp.title} subtitle={t.signUp.subtitle}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
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
        <PasswordField
          id="password"
          label={t.fields.password}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={t.fields.passwordHint}
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
      </form>
      <p className="text-sm text-ink-muted">
        {t.signUp.haveAccount}{" "}
        <TextLink href={withNext(SIGN_IN_HREF, next)} className="font-medium underline">
          {t.signUp.signIn}
        </TextLink>
      </p>
    </AuthPage>
  );
}
