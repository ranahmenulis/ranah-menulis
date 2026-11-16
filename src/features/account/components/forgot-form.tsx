"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { format, useT } from "@/lib/i18n/provider";
import { useCountdown } from "../hooks/use-countdown";
import { NEXT_PARAM, RESET_HREF, SIGN_IN_HREF, withNext } from "../redirect";
import { emailIssue } from "../validation";
import { AuthPage } from "./auth-frame";
import { EmailField, focusFirst } from "./email-field";

const RESEND_SECONDS = 30;

/**
 * Lupa sandi (PLT-01). The answer never says whether the address is registered: the same "if it is
 * registered, we sent a link" appears either way, so the form cannot be used to find accounts.
 */
export function ForgotForm() {
  const t = useT().account;
  const toast = useToast();
  const next = useSearchParams().get(NEXT_PARAM);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const wait = useCountdown();
  const error = submitted ? emailIssue(email) : null;

  function send() {
    setSent(true);
    wait.start(RESEND_SECONDS);
  }

  if (sent) {
    return (
      <AuthPage
        title={t.forgot.sentTitle}
        subtitle={format(t.forgot.sentBody, { email: email.trim() })}
      >
        <div className="grid justify-items-start gap-3">
          <Button
            variant="secondary"
            disabled={wait.seconds > 0}
            onClick={() => {
              wait.start(RESEND_SECONDS);
              toast({ message: t.forgot.resent, key: "forgot-resent" });
            }}
          >
            {wait.seconds > 0
              ? format(t.forgot.resendIn, { seconds: String(wait.seconds) })
              : t.forgot.resend}
          </Button>
          {/* Stand-ins for opening the link from the email; they leave with the bypass. */}
          <ButtonLink href={withNext(RESET_HREF, next)} variant="text" size="sm">
            {t.forgot.simulate}
          </ButtonLink>
          <ButtonLink
            href={withNext(RESET_HREF, next, { status: "kedaluwarsa" })}
            variant="text"
            size="sm"
          >
            {t.forgot.simulateExpired}
          </ButtonLink>
          <TextLink href={withNext(SIGN_IN_HREF, next)} className="text-sm text-ink-muted">
            {t.forgot.back}
          </TextLink>
        </div>
      </AuthPage>
    );
  }

  return (
    <AuthPage title={t.forgot.title} subtitle={t.forgot.subtitle}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (emailIssue(email)) return focusFirst(["email"]);
          send();
        }}
      >
        <EmailField value={email} onChange={setEmail} error={error && t.errors[error]} />
        <Button type="submit">{t.forgot.submit}</Button>
      </form>
      <TextLink href={withNext(SIGN_IN_HREF, next)} className="text-sm text-ink-muted">
        {t.forgot.back}
      </TextLink>
    </AuthPage>
  );
}
