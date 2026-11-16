"use client";

import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/provider";
import { setViewer } from "@/lib/viewer";
import { useAccount } from "../../account-store";
import { useHydrated } from "../../hooks/use-hydrated";
import { SIGN_IN_HREF } from "../../redirect";
import { DangerSection } from "./danger-section";
import { PersonalSection } from "./personal-section";
import { LanguageSection, PreferenceSections } from "./preference-sections";
import { SecuritySection } from "./security-section";

/**
 * Pengaturan akun (PRD 17): personal information, language, privacy, email notifications,
 * security, and the danger zone. One column of 680 in the app frame. The only filled button is
 * "Simpan perubahan"; everything else saves at once or sits in a dialog.
 */
export function SettingsView() {
  const t = useT().account;
  const router = useRouter();
  const toast = useToast();
  const hydrated = useHydrated();
  const account = useAccount();

  function signOut() {
    setViewer("tamu");
    toast({ message: t.settings.signedOut, key: "signed-out" });
    router.push(SIGN_IN_HREF);
  }

  return (
    <div className="mx-auto grid w-full max-w-[42.5rem] min-w-0 gap-8">
      <h1 className="heading-lg">{t.settings.title}</h1>
      {hydrated ? (
        <>
          <PersonalSection account={account} />
          <LanguageSection />
          <PreferenceSections prefs={account.prefs} />
          <SecuritySection account={account} />
          <DangerSection />
          <div className="border-t border-line pt-6">
            <Button variant="text" onClick={signOut} className="-ml-1">
              <SignOut size={20} aria-hidden />
              {t.settings.signOut}
            </Button>
          </div>
        </>
      ) : (
        <div className="grid gap-6" aria-hidden>
          <Skeleton className="size-22 rounded-full" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-28" />
        </div>
      )}
    </div>
  );
}
