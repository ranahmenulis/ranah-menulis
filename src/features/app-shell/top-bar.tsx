"use client";

import {
  ArrowLeft,
  Bell,
  List,
  MagnifyingGlass,
  PencilSimpleLine,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DisplayControls } from "@/components/ui/display-controls";
import { ButtonLink } from "@/components/ui/button";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import { useAccount } from "@/features/account/account-store";
import { SETTINGS_HREF } from "@/features/account/redirect";
import { useUnreadCount } from "@/features/notifications/use-notifications";
import { DISCOVER_HREF, DUMMY_USER, NEW_DOCUMENT_HREF, NOTIFICATIONS_HREF } from "./nav";

/** Back to where the reader came from; Jelajahi when the page was opened directly. */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const { topBar } = useT().shell;
  return (
    <IconButton
      label={topBar.back}
      className={cn("-ml-2", className)}
      onClick={() => (window.history.length > 1 ? router.back() : router.push(DISCOVER_HREF))}
    >
      <ArrowLeft size={24} aria-hidden />
    </IconButton>
  );
}

/**
 * Top bar. Phones (52px): monogram, page title, search, bell, avatar. md and up (56px): wordmark,
 * search pill, "Tulis", bell, avatar; the sidebar toggle appears from lg where the sidebar exists.
 * On phones the search icon opens Jelajahi (there is no text search yet). On a post page the phone
 * bar is just a back arrow and the bell and avatar.
 */
export function TopBar({
  title,
  discoverActive,
  notificationsActive,
  back,
  onToggleSidebar,
}: {
  title: string | null;
  discoverActive: boolean;
  notificationsActive: boolean;
  /** Phones only: replace the logo with a back arrow (post page). */
  back: boolean;
  onToggleSidebar: () => void;
}) {
  const { topBar } = useT().shell;
  const account = useAccount();
  const settingsActive = usePathname() === SETTINGS_HREF;
  const unread = useUnreadCount();
  const unreadLabel =
    unread > 0
      ? format(topBar.notifications, { count: unread.toLocaleString("id-ID") })
      : topBar.notificationsNone;
  const phoneOnly = back ? "max-md:hidden" : undefined;
  return (
    <header className="sticky top-0 z-30 flex h-[calc(3.25rem+var(--safe-top))] items-center gap-2 border-b border-line bg-canvas pt-(--safe-top) pr-2 pl-4 md:h-[calc(3.5rem+var(--safe-top))] md:gap-4 md:px-4">
      <IconButton
        label={topBar.toggleSidebar}
        onClick={onToggleSidebar}
        className="-ml-2 max-lg:hidden"
      >
        <List size={24} aria-hidden />
      </IconButton>
      {back && <BackButton className="md:hidden" />}
      <Monogram
        href="/beranda"
        label={topBar.home}
        height={24}
        className={cn("md:hidden", back && "max-md:hidden")}
      />
      <Wordmark href="/beranda" label={topBar.home} height={28} className="max-md:hidden" />
      {title && <span className={cn("ml-2 heading-sm md:hidden", phoneOnly)}>{title}</span>}
      <div
        aria-disabled="true"
        title={topBar.searchSoon}
        className="ml-4 flex h-9 w-60 items-center gap-2 rounded-full bg-subtle px-3.5 text-sm text-ink-muted max-md:hidden"
      >
        <MagnifyingGlass size={20} aria-hidden />
        {topBar.searchPlaceholder}
      </div>
      <span className="flex-1" />
      <ButtonLink href={NEW_DOCUMENT_HREF} variant="text" className="max-md:hidden">
        <PencilSimpleLine size={20} aria-hidden />
        {topBar.write}
      </ButtonLink>
      <Link
        href={DISCOVER_HREF}
        aria-label={topBar.searchAndDiscover}
        aria-current={discoverActive ? "page" : undefined}
        className={cn(iconButtonClass, "md:hidden", phoneOnly)}
      >
        <MagnifyingGlass size={24} aria-hidden />
      </Link>
      <DisplayControls />
      <Link
        href={NOTIFICATIONS_HREF}
        aria-label={unreadLabel}
        title={unreadLabel}
        aria-current={notificationsActive ? "page" : undefined}
        className={iconButtonClass}
      >
        <span className="relative grid place-items-center">
          <Bell size={24} weight={notificationsActive ? "fill" : "regular"} aria-hidden />
          {unread > 0 && (
            <span aria-hidden className="absolute top-0 right-0 size-1.5 rounded-full bg-ink" />
          )}
        </span>
      </Link>
      <Link
        href={SETTINGS_HREF}
        aria-label={topBar.account}
        title={topBar.account}
        aria-current={settingsActive ? "page" : undefined}
        className={cn("grid min-h-11 min-w-11 place-items-center", phoneOnly)}
      >
        <Avatar
          name={account.profile.name || DUMMY_USER.name}
          src={account.profile.avatar}
          size={32}
        />
      </Link>
    </header>
  );
}
