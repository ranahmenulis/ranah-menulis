"use client";

import {
  ArrowLeft,
  Bell,
  List,
  MagnifyingGlass,
  PencilSimpleLine,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { DISCOVER_HREF, DUMMY_USER, NEW_DOCUMENT_HREF } from "./nav";

/** Back to where the reader came from; Jelajahi when the page was opened directly. */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <IconButton
      label="Kembali"
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
  back,
  onToggleSidebar,
}: {
  title: string | null;
  discoverActive: boolean;
  /** Phones only: replace the logo with a back arrow (post page). */
  back: boolean;
  onToggleSidebar: () => void;
}) {
  const unreadLabel = `Notifikasi, ${DUMMY_USER.unread} belum dibaca`;
  const phoneOnly = back ? "max-md:hidden" : undefined;
  return (
    <header className="sticky top-0 z-30 flex h-13 items-center gap-2 border-b border-line bg-canvas pr-2 pl-4 md:h-14 md:gap-4 md:px-4">
      <IconButton
        label="Sembunyikan atau tampilkan sidebar"
        onClick={onToggleSidebar}
        className="-ml-2 max-lg:hidden"
      >
        <List size={24} aria-hidden />
      </IconButton>
      {back && <BackButton className="md:hidden" />}
      <Monogram
        href="/beranda"
        label="RanahMenulis, Beranda"
        height={24}
        className={cn("md:hidden", back && "max-md:hidden")}
      />
      <Wordmark
        href="/beranda"
        label="RanahMenulis, Beranda"
        height={28}
        className="max-md:hidden"
      />
      {title && <span className={cn("ml-2 heading-sm md:hidden", phoneOnly)}>{title}</span>}
      <div
        aria-disabled="true"
        title="Pencarian belum tersedia"
        className="ml-4 flex h-9 w-60 items-center gap-2 rounded-full bg-subtle px-3.5 text-sm text-ink-muted max-md:hidden"
      >
        <MagnifyingGlass size={20} aria-hidden />
        Cari penulis dan karya
      </div>
      <span className="flex-1" />
      <ButtonLink href={NEW_DOCUMENT_HREF} variant="text" className="max-md:hidden">
        <PencilSimpleLine size={20} aria-hidden />
        Tulis
      </ButtonLink>
      <Link
        href={DISCOVER_HREF}
        aria-label="Cari dan jelajahi"
        aria-current={discoverActive ? "page" : undefined}
        className={cn(iconButtonClass, "md:hidden", phoneOnly)}
      >
        <MagnifyingGlass size={24} aria-hidden />
      </Link>
      <IconButton label={unreadLabel} disabled>
        <span className="relative grid place-items-center">
          <Bell size={24} aria-hidden />
          {DUMMY_USER.unread > 0 && (
            <span aria-hidden className="absolute top-0 right-0 size-1.5 rounded-full bg-ink" />
          )}
        </span>
      </IconButton>
      <Avatar name={DUMMY_USER.name} size={32} className={phoneOnly} />
    </header>
  );
}
