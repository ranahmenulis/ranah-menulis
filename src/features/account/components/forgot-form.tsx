"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { format, useT } from "@/lib/i18n/provider";
import { useAuthGateway } from "../auth-gateway-context";
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
  const gateway = useAuthGateway();
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<"limit" | "network" | null>(null);
  const [busy, setBusy] = useState(false);
  const wait = useCountdown();
  const error = submitted ? emailIssue(email) : null;

  /** Sends the link. Null when it went out (the answer never says whether the address exists). */
  async function send(): Promise<"limit" | "network" | null> {
    setBusy(true);
    setFailure(null);
    const result = await gateway.requestPasswordReset(email.trim());
    setBusy(false);
    if (!result.ok) {
      setFailure(result.reason);
      return result.reason;
    }
    setSent(true);
    wait.start(RESEND_SECONDS);
    return null;
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
            onClick={async () => {
              const failed = await send();
              toast({ message: failed ? t.errors[failed] : t.forgot.resent, key: "forgot-resent" });
            }}
          >
            {wait.seconds > 0
              ? format(t.forgot.resendIn, { seconds: String(wait.seconds) })
              : t.forgot.resend}
          </Button>
          {/* Stand-ins for opening the link from the email; only while sign-in is simulated. */}
          {gateway.simulated && (
            <>
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
            </>
          )}
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
          if (!busy) void send();
        }}
      >
        {failure && (
          <p role="alert" className="text-sm text-danger">
            {t.errors[failure]}
          </p>
        )}
        <EmailField value={email} onChange={setEmail} error={error && t.errors[error]} />
        <Button type="submit" disabled={busy}>
          {t.forgot.submit}
        </Button>
      </form>
      <TextLink href={withNext(SIGN_IN_HREF, next)} className="text-sm text-ink-muted">
        {t.forgot.back}
      </TextLink>
    </AuthPage>
  );
}
