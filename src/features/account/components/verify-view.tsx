"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { useToast } from "@/components/ui/toast";
import { format, useT } from "@/lib/i18n/provider";
import { setViewer } from "@/lib/viewer";
import { useAccount } from "../account-store";
import { useCountdown } from "../hooks/use-countdown";
import { useHydrated } from "../hooks/use-hydrated";
import { NEXT_PARAM, ONBOARDING_HREF, SIGN_UP_HREF, VERIFY_HREF, withNext } from "../redirect";
import { AuthPage } from "./auth-frame";

const RESEND_SECONDS = 30;

/**
 * Verifikasi email (PLT-01, AC-01). Three states from `?status=`: waiting (default), done
 * (`berhasil`), and expired (`kedaluwarsa`). The email link would open the last two; here two
 * example buttons stand in for it. The address comes from the saved account, not the address bar.
 */
export function VerifyView() {
  const t = useT().account;
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const next = params.get(NEXT_PARAM);
  const status = params.get("status");
  const { email } = useAccount();
  const hydrated = useHydrated();
  const wait = useCountdown();
  const start = wait.start;

  // An email was just sent, so the resend button starts out waiting.
  useEffect(() => start(RESEND_SECONDS), [start]);

  const here = (state?: string) => withNext(VERIFY_HREF, next, state ? { status: state } : {});

  if (status === "berhasil") {
    return (
      <AuthPage title={t.verify.doneTitle} subtitle={t.verify.doneBody} celebrate>
        <ButtonLink
          href={withNext(ONBOARDING_HREF, next)}
          onClick={() => setViewer("masuk")}
          className="justify-self-start"
        >
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
            wait.start(RESEND_SECONDS);
            toast({ message: t.verify.resent, key: "verify-resent" });
            router.replace(here());
          }}
        >
          {t.verify.expiredAction}
        </Button>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      title={t.verify.title}
      subtitle={hydrated && email ? format(t.verify.body, { email }) : t.verify.bodyNoEmail}
    >
      <div className="grid justify-items-start gap-3">
        <Button
          variant="secondary"
          disabled={wait.seconds > 0}
          onClick={() => {
            wait.start(RESEND_SECONDS);
            toast({ message: t.verify.resent, key: "verify-resent" });
          }}
        >
          {wait.seconds > 0
            ? format(t.verify.resendIn, { seconds: String(wait.seconds) })
            : t.verify.resend}
        </Button>
        {/* Stand-ins for opening the link from the email; they leave with the bypass. */}
        <ButtonLink href={here("berhasil")} variant="text" size="sm">
          {t.verify.simulate}
        </ButtonLink>
        <ButtonLink href={here("kedaluwarsa")} variant="text" size="sm">
          {t.verify.simulateExpired}
        </ButtonLink>
        <TextLink href={withNext(SIGN_UP_HREF, next)} className="text-sm text-ink-muted">
          {t.verify.wrongEmail}
        </TextLink>
      </div>
    </AuthPage>
  );
}
