"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { format, useT } from "@/lib/i18n/provider";
import { useAuthGateway } from "../auth-gateway-context";
import { useCountdown } from "../hooks/use-countdown";
import { useHydrated } from "../hooks/use-hydrated";
import { usePendingEmail } from "../pending-email";
import {
  NEXT_PARAM,
  ONBOARDING_HREF,
  SIGN_IN_HREF,
  SIGN_UP_HREF,
  VERIFY_HREF,
  withNext,
} from "../redirect";
import { AuthPage } from "./auth-frame";

const RESEND_SECONDS = 30;

/**
 * Verifikasi email (PLT-01, AC-01). Three states from `?status=`: waiting (default), done
 * (`berhasil`), and expired (`kedaluwarsa`); the email link ends on the last two. The address comes
 * from the one just used to sign up (kept for this tab), not from the address bar.
 */
export function VerifyView() {
  const t = useT().account;
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const next = params.get(NEXT_PARAM);
  const status = params.get("status");
  const gateway = useAuthGateway();
  const pending = usePendingEmail();
  const email = pending;
  const hydrated = useHydrated();
  const wait = useCountdown();
  const start = wait.start;

  // An email was just sent, so the resend button starts out waiting.
  useEffect(() => start(RESEND_SECONDS), [start]);

  async function resend(after?: () => void) {
    // Opened in another browser than the one that signed up: the address is not known here.
    // Signing in with it (it reports "not verified") offers the resend.
    if (!email) return router.push(withNext(SIGN_IN_HREF, next));
    const result = await gateway.resendVerification(email, next);
    if (!result.ok) return toast({ message: t.errors[result.reason], key: "verify-resent" });
    wait.start(RESEND_SECONDS);
    toast({ message: t.verify.resentReal, key: "verify-resent" });
    after?.();
  }

  const here = (state?: string) => withNext(VERIFY_HREF, next, state ? { status: state } : {});

  if (status === "berhasil") {
    return (
      <AuthPage title={t.verify.doneTitle} subtitle={t.verify.doneBody} celebrate>
        <ButtonLink href={withNext(ONBOARDING_HREF, next)} className="justify-self-start">
          {t.verify.doneAction}
        </ButtonLink>
      </AuthPage>
    );
  }

  if (status === "kedaluwarsa") {
    return (
      <AuthPage title={t.verify.expiredTitle} subtitle={t.verify.expiredBody}>
        <Button
          className="justify-self-start"
          onClick={() => {
            void resend(() => router.replace(here()));
          }}
        >
          {t.verify.expiredAction}
        </Button>
      </AuthPage>
    );
  }

  const known = hydrated && email;
  const subtitle = known ? format(t.verify.sent, { email }) : t.verify.sentNoEmail;

  return (
    <AuthPage title={t.verify.title} subtitle={subtitle}>
      <div className="grid justify-items-start gap-3">
        <Button
          variant="secondary"
          disabled={wait.seconds > 0 || !email}
          onClick={() => void resend()}
        >
          {wait.seconds > 0
            ? format(t.verify.resendIn, { seconds: String(wait.seconds) })
            : t.verify.resend}
        </Button>
        <TextLink href={withNext(SIGN_UP_HREF, next)} className="text-sm text-ink-muted">
          {t.verify.wrongEmail}
        </TextLink>
      </div>
    </AuthPage>
  );
}
