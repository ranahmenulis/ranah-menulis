"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useLastDocument } from "@/features/studio/hooks/use-last-document";
import { studioStore } from "@/features/studio/storage/store";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { areasFor } from "@/features/kelola/access";
import { ViewerSync, useViewer } from "@/lib/viewer";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { GuestFrame } from "./guest-frame";
import { NavLink } from "./nav-link";
import {
  NEW_DOCUMENT_HREF,
  activeId,
  bottomNav,
  isPostPage,
  kelolaNav,
  mainNav,
  mobileTitle,
  showsWriteButton,
} from "./nav";
import { CommunityLink } from "./community-link";
import { ResumeWriting } from "./resume-writing";
import { TopBar } from "./top-bar";

/**
 * App frame (DESIGN.md 5.1). One DOM, three navigations chosen by CSS: sidebar from lg (can be
 * hidden), rail at md, bottom bar below md. The editor does not use this frame.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { nav, topBar } = useT().shell;
  const active = activeId(pathname);
  const [sidebar, setSidebar] = useState(true);
  const viewer = useViewer();
  const roles = useEffectiveRoles();
  // Only a convenience: the screens refuse the wrong role themselves, and the database decides.
  const entries = areasFor(roles).length > 0 ? [...mainNav, kelolaNav] : mainNav;
  const onPost = isPostPage(pathname);
  // One read for both navigations (sidebar and rail are both in the DOM).
  const lastDocument = useLastDocument(studioStore, pathname);

  if (viewer === "tamu") {
    return (
      <>
        <ViewerSync pathname={pathname} />
        <GuestFrame back={onPost}>{children}</GuestFrame>
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col max-md:[--toast-offset:calc(5rem+env(safe-area-inset-bottom))]">
      <ViewerSync pathname={pathname} />
      <TopBar
        title={mobileTitle(pathname)}
        discoverActive={active === "jelajahi"}
        notificationsActive={active === "notifikasi"}
        back={onPost}
        onToggleSidebar={() => setSidebar((v) => !v)}
      />

      <div className="flex min-w-0 flex-1">
        {/* The sidebar stays mounted so it can slide: the column narrows while the list slides
            out to the left (200ms). Closed, it is inert, so neither Tab nor a screen reader
            reaches it. Instant under reduced motion. */}
        <div
          inert={!sidebar}
          className={cn(
            "sticky top-[calc(3.5rem+var(--safe-top))] hidden h-[calc(100dvh-3.5rem-var(--safe-top))] shrink-0 overflow-hidden lg:block",
            "transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none",
            sidebar ? "w-60" : "w-0",
          )}
        >
          <nav
            aria-label={nav.label}
            className={cn(
              "grid h-full w-60 content-start gap-0.5 overflow-y-auto border-r border-line px-3 py-4",
              "transition-transform duration-200 ease-(--ease-out) motion-reduce:transition-none",
              !sidebar && "-translate-x-full",
            )}
          >
            {entries.map((entry) => (
              <NavLink
                key={entry.id}
                entry={entry}
                variant="sidebar"
                active={active === entry.id}
              />
            ))}
            <ResumeWriting variant="card" doc={lastDocument} />
            <CommunityLink variant="sidebar" />
          </nav>
        </div>

        <nav
          aria-label={nav.label}
          className="sticky top-[calc(3.5rem+var(--safe-top))] hidden h-[calc(100dvh-3.5rem-var(--safe-top))] w-18 shrink-0 content-start gap-1 border-r border-line py-3 md:grid lg:hidden"
        >
          {entries.map((entry) => (
            <NavLink key={entry.id} entry={entry} variant="rail" active={active === entry.id} />
          ))}
          <ResumeWriting variant="icon" doc={lastDocument} />
        </nav>

        <main className="min-w-0 flex-1 px-4 py-4 max-md:pb-40 md:px-12 md:py-10">{children}</main>
      </div>

      {showsWriteButton(pathname) && (
        <Link
          href={NEW_DOCUMENT_HREF}
          aria-label={topBar.writeNew}
          className={cn(
            "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 md:hidden",
            "grid size-14 place-items-center rounded-full bg-ink text-on-ink",
            "transition-opacity duration-120 hover:opacity-(--opacity-hover) active:opacity-press",
          )}
        >
          <PencilSimpleLine size={24} aria-hidden />
        </Link>
      )}

      {!onPost && (
        <nav
          aria-label={nav.label}
          className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(3.5rem+env(safe-area-inset-bottom))] grid-cols-4 border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {bottomNav.map((entry) => (
            <NavLink key={entry.id} entry={entry} variant="tab" active={active === entry.id} />
          ))}
        </nav>
      )}
    </div>
  );
}
