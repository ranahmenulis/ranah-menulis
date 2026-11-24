"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { DISCOVER_HREF, NEW_POST_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { EVENTS_HREF } from "../events/event-model";
import { GROUPS_HREF } from "../groups/group-model";

export type CommunityTab = "tulisan" | "event" | "grup";

export function communityTab(pathname: string): CommunityTab {
  if (pathname.startsWith(EVENTS_HREF)) return "event";
  if (pathname.startsWith(GROUPS_HREF)) return "grup";
  return "tulisan";
}

/**
 * Tulisan, Event and Lingkar Menulis: three sections of one module, like Dokumen, Streak and Statistik
 * in Studio (DESIGN.md 6.8). The pill tabs sit at the top of each list page with "Tulis postingan"
 * at their right; the hero and the content of the section follow.
 */
export function CommunityFrame({ children }: { children: ReactNode }) {
  const t = useT().discover;
  const pathname = usePathname() ?? "";
  const guest = useViewer() === "tamu";
  return (
    // One width for all three tabs, so the tabs and the hero never move when switching.
    <div className="@container mx-auto grid max-w-320 gap-5 md:gap-6">
      <div className="flex min-w-0 items-center gap-3">
        <Tabs
          variant="pill"
          label={t.tabs.label}
          value={communityTab(pathname)}
          className="scroll-edge-fade min-w-0"
          items={[
            { id: "tulisan", label: t.tabs.posts, href: DISCOVER_HREF },
            { id: "event", label: t.tabs.events, href: EVENTS_HREF },
            { id: "grup", label: t.tabs.groups, href: GROUPS_HREF },
          ]}
        />
        {!guest && (
          <ButtonLink href={NEW_POST_HREF} variant="text" className="ml-auto shrink-0 max-sm:px-2">
            <PencilSimpleLine size={20} aria-hidden />
            <span className="max-sm:sr-only">{t.write}</span>
          </ButtonLink>
        )}
      </div>
      {children}
    </div>
  );
}
