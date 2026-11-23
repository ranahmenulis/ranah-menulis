"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/provider";
import { saveAccount, useAccount, type AccountProfile } from "../account-store";
import { useHydrated } from "../hooks/use-hydrated";
import { useProfileForm } from "../hooks/use-profile-form";
import { cleanProfile } from "../profile-validation";
import { NEXT_PARAM, safeNext } from "../redirect";
import { normalizeUsername } from "../validation";
import { ProfilePreviewAside } from "./auth-aside";
import { AuthPage } from "./auth-frame";
import { ProfileFields } from "./profile-fields";

function OnboardingForm({ initial }: { initial: AccountProfile }) {
  const t = useT().account;
  const router = useRouter();
  const toast = useToast();
  const next = useSearchParams().get(NEXT_PARAM);
  const form = useProfileForm(initial);

  return (
    <form
      noValidate
      className="grid gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.validate()) return;
        const kept = saveAccount({ profile: cleanProfile(form.values, normalizeUsername) });
        if (!kept) toast({ message: t.settings.personal.failed, tone: "error" });
        router.push(safeNext(next));
      }}
    >
      <ProfilePreviewAside profile={form.values} />
      <ProfileFields form={form} />
      <Button type="submit">{t.onboarding.submit}</Button>
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
  const hydrated = useHydrated();
  const { profile } = useAccount();
  return (
    <AuthPage title={t.onboarding.title} subtitle={t.onboarding.subtitle}>
      {hydrated ? (
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
