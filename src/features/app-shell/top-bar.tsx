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
import { DisplayControls } from "@/components/ui/display-controls";
import { ButtonLink } from "@/components/ui/button";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/i18n/format";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { ManagerMenu } from "@/features/kelola/components/manager-menu";
import { useUnreadCount } from "@/features/notifications/use-notifications";
import { StudioTopBarSearch } from "@/features/studio/components/studio-top-bar-search";
import { AccountMenu } from "./account-menu";
import { DISCOVER_HREF, NEW_DOCUMENT_HREF, NOTIFICATIONS_HREF } from "./nav";

const studioSearchPaths = new Set(["/studio", "/studio/streak", "/studio/statistik"]);

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
 * the Studio search pill (Studio pages only; client, 23 November 2026: no search beside the logo
 * elsewhere), "Tulis", bell, avatar; the sidebar toggle appears from lg where the sidebar exists.
 * On phones outside Studio the search icon opens Jelajahi. On a post page the phone
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
  const locale = useLocale();
  const pathname = usePathname();
  const studioSearch = studioSearchPaths.has(pathname);
  const unread = useUnreadCount();
  const unreadLabel =
    unread > 0
      ? format(topBar.notifications, { count: formatNumber(unread, locale) })
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
      <ManagerMenu className={cn("md:hidden", phoneOnly)} />
      {back && <BackButton className="md:hidden" />}
      <Monogram
        href="/beranda"
        label={topBar.home}
        height={24}
        className={cn("md:hidden", back && "max-md:hidden")}
      />
      <Wordmark href="/beranda" label={topBar.home} height={28} className="max-md:hidden" />
      {title && <span className={cn("ml-2 heading-sm md:hidden", phoneOnly)}>{title}</span>}
      {studioSearch && <StudioTopBarSearch key={pathname} />}
      <span className={cn("flex-1", studioSearch && "max-md:hidden")} />
      <ButtonLink href={NEW_DOCUMENT_HREF} variant="text" className="max-md:hidden">
        <PencilSimpleLine size={20} aria-hidden />
        {topBar.write}
      </ButtonLink>
      {!studioSearch && (
        <Link
          href={DISCOVER_HREF}
          aria-label={topBar.searchAndDiscover}
          aria-current={discoverActive ? "page" : undefined}
          className={cn(iconButtonClass, "md:hidden", phoneOnly)}
        >
          <MagnifyingGlass size={24} aria-hidden />
        </Link>
      )}
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
      <AccountMenu className={phoneOnly} />
    </header>
  );
}
