"use client";

import { Bell, List, MagnifyingGlass, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { DUMMY_USER, NEW_DOCUMENT_HREF } from "./nav";

/**
 * Top bar. Phones (52px): monogram, page title, search, bell, avatar. md and up (56px): wordmark,
 * search pill, "Tulis", bell, avatar; the sidebar toggle appears from lg where the sidebar exists.
 * Search and notifications arrive with Community (step 5) and the account screens (step 6).
 */
export function TopBar({
  title,
  onToggleSidebar,
}: {
  title: string | null;
  onToggleSidebar: () => void;
}) {
  const unreadLabel = `Notifikasi, ${DUMMY_USER.unread} belum dibaca`;
  return (
    <header className="sticky top-0 z-30 flex h-13 items-center gap-2 border-b border-line bg-canvas pr-2 pl-4 md:h-14 md:gap-4 md:px-4">
      <IconButton
        label="Sembunyikan atau tampilkan sidebar"
        onClick={onToggleSidebar}
        className="-ml-2 max-lg:hidden"
      >
        <List size={24} aria-hidden />
      </IconButton>
      <Monogram href="/beranda" label="RanahMenulis, Beranda" height={24} className="md:hidden" />
      <Wordmark
        href="/beranda"
        label="RanahMenulis, Beranda"
        height={28}
        className="max-md:hidden"
      />
      {title && <span className="ml-2 heading-sm md:hidden">{title}</span>}
      <div
        aria-disabled="true"
        title="Pencarian tersedia setelah Community dibuka"
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
      <IconButton label="Cari" disabled className="md:hidden">
        <MagnifyingGlass size={24} aria-hidden />
      </IconButton>
      <IconButton label={unreadLabel} disabled>
        <span className="relative grid place-items-center">
          <Bell size={24} aria-hidden />
          {DUMMY_USER.unread > 0 && (
            <span aria-hidden className="absolute top-0 right-0 size-1.5 rounded-full bg-ink" />
          )}
        </span>
      </IconButton>
      <Avatar name={DUMMY_USER.name} size={32} />
    </header>
  );
}
