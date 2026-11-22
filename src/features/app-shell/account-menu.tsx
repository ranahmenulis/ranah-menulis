"use client";

import { BookmarkSimple, GearSix, User } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Menu } from "@/components/ui/menu";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { useAccount } from "@/features/account/account-store";
import { SETTINGS_HREF } from "@/features/account/redirect";
import { OWN_PROFILE_HREF } from "@/features/profile/profile-href";
import { DUMMY_USER, SAVED_HREF } from "./nav";

/**
 * The avatar in the top bar opens a menu: own profile, Tersimpan, and account settings. Phones have
 * no Profil tab in the bottom bar (client, 22 November 2026), so this is how they reach all three.
 */
export function AccountMenu({ className }: { className?: string }) {
  const { topBar } = useT().shell;
  const account = useAccount();
  const router = useRouter();
  return (
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
        {
          id: "settings",
          label: topBar.account,
          icon: <GearSix aria-hidden />,
          onSelect: () => router.push(SETTINGS_HREF),
        },
      ]}
    />
  );
}
