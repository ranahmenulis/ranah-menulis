"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth/session-context";
import { useT } from "@/lib/i18n/provider";
import { useAccount, type AccountProfile } from "../account-store";
import { useAuthGateway } from "../auth-gateway-context";
import { useHydrated } from "../hooks/use-hydrated";
import { useProfileForm } from "../hooks/use-profile-form";
import { useSaveProfile } from "../hooks/use-save-profile";
import { NEXT_PARAM, SIGN_IN_HREF, safeNext, withNext } from "../redirect";
import { ProfilePreviewAside } from "./auth-aside";
import { AuthPage } from "./auth-frame";
import { ProfileFields } from "./profile-fields";

function OnboardingForm({ initial }: { initial: AccountProfile }) {
  const t = useT().account;
  const router = useRouter();
  const toast = useToast();
  const next = useSearchParams().get(NEXT_PARAM);
  const form = useProfileForm(initial);
  const save = useSaveProfile(form);
  const [busy, setBusy] = useState(false);

  return (
    <form
      noValidate
      className="grid gap-8"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy || !form.validate()) return;
        setBusy(true);
        const { result, problem } = await save({ finish: true });
        setBusy(false);
        // A taken username stays on this screen, on its field; anything else is said and the
        // reader moves on only when the profile was kept.
        if (result === "username-taken") return;
        if (problem) return toast({ message: problem, tone: "error" });
        router.refresh();
        router.push(safeNext(next));
      }}
    >
      <ProfilePreviewAside profile={form.values} />
      <ProfileFields form={form} />
      <Button type="submit" disabled={busy}>
        {t.onboarding.submit}
      </Button>
    </form>
  );
}

/**
 * Lengkapi profil, right after the email is verified (PLT-02). Name and username are required; the
 * rest can wait. It opens on the account that sign-up just made, and on the dummy reader when
 * opened directly.
 */
export function OnboardingView() {
  const t = useT().account;
  const router = useRouter();
  const next = useSearchParams().get(NEXT_PARAM);
  const gateway = useAuthGateway();
  const session = useSession();
  const hydrated = useHydrated();
  const { profile } = useAccount();
  const visitor = !gateway.simulated && session?.status === "guest";

  // The profile belongs to an account: a visitor (an old link, a signed-out tab) signs in first.
  useEffect(() => {
    if (visitor) router.replace(withNext(SIGN_IN_HREF, next));
  }, [visitor, router, next]);

  return (
    <AuthPage title={t.onboarding.title} subtitle={t.onboarding.subtitle}>
      {hydrated && !visitor ? (
        <OnboardingForm initial={profile} />
      ) : (
        <div className="grid gap-6" aria-hidden>
          <Skeleton className="size-22 rounded-full" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      )}
    </AuthPage>
  );
}
