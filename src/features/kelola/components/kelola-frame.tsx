"use client";

import {
  ChalkboardTeacher,
  Kanban,
  Scales,
  ShieldCheck,
  SquaresFour,
  Tray,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/states";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { KELOLA_HREF, areaOf, areasFor, canAccess, type Area } from "../access";
import { AccessDenied } from "./access-denied";

const ICONS: Record<Area | "ringkasan", Icon> = {
  ringkasan: SquaresFour,
  organizer: Kanban,
  editor: Tray,
  juri: Scales,
  mentor: ChalkboardTeacher,
  admin: ShieldCheck,
};

// A chip row below lg, a column of pills with icons from lg (like the Settings menu).
const linkBase =
  "inline-flex h-8 shrink-0 items-center gap-2.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap no-underline transition-colors lg:h-10 lg:px-3";
const linkOn = "bg-accent text-on-accent lg:bg-accent-subtle lg:text-accent-ink";
const linkOff =
  "bg-subtle text-ink hover:bg-line lg:bg-transparent lg:font-normal lg:text-ink-soft lg:hover:bg-subtle lg:hover:text-ink";

/**
 * Frame of every /kelola screen: a menu of the areas you hold (a column of pills with icons from
 * lg, a sticky chip row below) and the screen. Roles are known only in the browser, so the first render is a skeleton.
 */
export function KelolaFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const viewer = useViewer();
  const roles = useEffectiveRoles();
  const t = useT().kelolaShared;

  if (!hydrated) {
    return (
      <div role="status" aria-label={t.frame.loading} className="grid max-w-170 gap-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (viewer === "tamu") return <AccessDenied reason="tamu" />;

  const areas = areasFor(roles);
  const current = areaOf(pathname);
  if (areas.length === 0 || (current && !canAccess(roles, current.id))) {
    return <AccessDenied reason="peran" />;
  }

  const items = [
    { id: "ringkasan" as const, label: t.frame.summary, href: KELOLA_HREF },
    ...areas.map((a) => ({ id: a.id, label: t.areas[a.id].label, href: a.href })),
  ];
  return (
    <div className="mx-auto grid w-full max-w-320 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
      <nav
        aria-label={t.frame.navLabel}
        className={cn(
          "sticky top-[calc(3.25rem+var(--safe-top))] z-20 -mx-4 border-b border-line bg-canvas md:top-[calc(3.5rem+var(--safe-top))] md:mx-0",
          "lg:top-[calc(5.5rem+var(--safe-top))] lg:self-start lg:border-b-0",
        )}
      >
        <ul className="scroll-edge-fade flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-3 md:px-0 lg:grid lg:gap-1 lg:p-0 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const ItemIcon = ICONS[item.id];
            const on =
              item.href === KELOLA_HREF ? pathname === KELOLA_HREF : current?.id === item.id;
            return (
              <li key={item.id} className="contents">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(linkBase, on ? linkOn : linkOff)}
                >
                  <ItemIcon size={18} aria-hidden className="max-lg:hidden" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
