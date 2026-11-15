"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ViewerSync, useViewer } from "@/lib/viewer";
import { GuestFrame } from "./guest-frame";
import { NavLink } from "./nav-link";
import {
  NEW_DOCUMENT_HREF,
  activeId,
  bottomNav,
  isPostPage,
  mainNav,
  mobileTitle,
  showsWriteButton,
  sidebarSub,
} from "./nav";
import { TopBar } from "./top-bar";

/**
 * App frame (DESIGN.md 5.1). One DOM, three navigations chosen by CSS: sidebar from lg (can be
 * hidden), rail at md, bottom bar below md. The editor does not use this frame.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = activeId(pathname);
  const [sidebar, setSidebar] = useState(true);
  const viewer = useViewer();
  const onPost = isPostPage(pathname);

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
        back={onPost}
        onToggleSidebar={() => setSidebar((v) => !v)}
      />

      <div className="flex min-w-0 flex-1">
        {sidebar && (
          <nav
            aria-label="Utama"
            className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 content-start gap-0.5 overflow-y-auto border-r border-line px-3 py-4 lg:grid"
          >
            {mainNav.map((entry) => (
              <div key={entry.id} className="grid">
                <NavLink entry={entry} variant="sidebar" active={active === entry.id} />
                {entry.id === "studio" && (
                  <NavLink entry={sidebarSub} variant="sub" active={active === "streak"} />
                )}
              </div>
            ))}
          </nav>
        )}

        <nav
          aria-label="Utama"
          className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-18 shrink-0 content-start gap-1 border-r border-line py-3 md:grid lg:hidden"
        >
          {mainNav.map((entry) => (
            <NavLink
              key={entry.id}
              entry={entry}
              variant="rail"
              active={active === entry.id || (entry.id === "studio" && active === "streak")}
            />
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-4 py-4 max-md:pb-40 md:px-12 md:py-10">{children}</main>
      </div>

      {showsWriteButton(pathname) && (
        <Link
          href={NEW_DOCUMENT_HREF}
          aria-label="Tulis dokumen baru"
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
          aria-label="Utama"
          className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(3.5rem+env(safe-area-inset-bottom))] grid-cols-5 border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {bottomNav.map((entry) => (
            <NavLink key={entry.id} entry={entry} variant="tab" active={active === entry.id} />
          ))}
        </nav>
      )}
    </div>
  );
}
