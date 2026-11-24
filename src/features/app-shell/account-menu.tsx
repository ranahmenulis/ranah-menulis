"use client";

import { BookmarkSimple, Bug, GearSix, ShieldCheck, User } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Menu } from "@/components/ui/menu";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { useAccount } from "@/features/account/account-store";
import { KELOLA_HREF, areasFor } from "@/features/kelola/access";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { SETTINGS_HREF } from "@/features/account/redirect";
import { OWN_PROFILE_HREF } from "@/features/profile/profile-href";
import { ReportProblemDialog } from "@/features/support/components/report-problem-dialog";
import { DUMMY_USER, SAVED_HREF } from "./nav";

/**
 * The avatar in the top bar opens a menu: own profile, Tersimpan, account settings, report a problem, and (phones only, for role holders) Kelola. Phones have
 * no Profil tab in the bottom bar (client, 22 November 2026), so this is how they reach all three.
 */
export function AccountMenu({ className }: { className?: string }) {
  const { topBar, nav } = useT().shell;
  const report = useT().support.menu;
  const [reporting, setReporting] = useState(false);
  const manages = areasFor(useEffectiveRoles()).length > 0;
  const account = useAccount();
  const router = useRouter();
  return (
    <>
      <Menu
        label={topBar.accountMenu}
        className={cn(className)}
        icon={
          <Avatar
            name={account.profile.name || DUMMY_USER.name}
            src={account.profile.avatar}
            size={32}
          />
        }
        items={[
          {
            id: "profile",
            label: topBar.myProfile,
            icon: <User aria-hidden />,
            onSelect: () => router.push(OWN_PROFILE_HREF),
          },
          {
            id: "saved",
            label: topBar.saved,
            icon: <BookmarkSimple aria-hidden />,
            onSelect: () => router.push(SAVED_HREF),
          },
          ...(manages
            ? [
                {
                  id: "manage",
                  label: nav.kelola,
                  icon: <ShieldCheck aria-hidden />,
                  // Desktop has Kelola in the sidebar; phones reach it from here.
                  mobileOnly: true,
                  onSelect: () => router.push(KELOLA_HREF),
                },
              ]
            : []),
          {
            id: "settings",
            label: topBar.account,
            icon: <GearSix aria-hidden />,
            onSelect: () => router.push(SETTINGS_HREF),
          },
          {
            id: "report",
            label: report,
            icon: <Bug aria-hidden />,
            onSelect: () => setReporting(true),
          },
        ]}
      />
      {reporting && <ReportProblemDialog onClose={() => setReporting(false)} />}
    </>
  );
}
