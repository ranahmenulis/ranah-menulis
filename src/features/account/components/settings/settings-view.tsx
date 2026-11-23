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
import { SettingsNav } from "./settings-nav";
import { WritingSection } from "./writing-section";

/**
 * Account settings (PRD 17): personal information, language, writing, privacy, email notifications,
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

  const signOutButton = (
    <Button variant="text" onClick={signOut} className="-ml-1">
      <SignOut size={20} aria-hidden />
      {t.settings.signOut}
    </Button>
  );

  return (
    <div className="mx-auto grid w-full max-w-320 min-w-0 gap-6">
      <h1 className="heading-lg">{t.settings.title}</h1>
      {hydrated ? (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
          <SettingsNav footer={signOutButton} />
          <div className="grid min-w-0 gap-6">
            <PersonalSection account={account} />
            <LanguageSection />
            <WritingSection prefs={account.prefs.writing} />
            <PreferenceSections prefs={account.prefs} />
            <SecuritySection account={account} />
            <DangerSection />
            {/* Phones and tablets have no section menu, so Keluar sits at the end. */}
            <div className="lg:hidden">{signOutButton}</div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6" aria-hidden>
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      )}
    </div>
  );
}
