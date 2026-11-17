"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/states";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { cn } from "@/lib/cn";
import { useViewer } from "@/lib/viewer";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { KELOLA_HREF, areaOf, areasFor, canAccess } from "../access";
import { AccessDenied } from "./access-denied";

const linkBase =
  "inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap no-underline lg:h-10 lg:rounded-none lg:px-3";
const linkOn = "bg-ink text-on-ink lg:bg-transparent lg:text-ink";
const linkOff =
  "bg-subtle text-ink hover:bg-line lg:bg-transparent lg:text-ink-muted lg:hover:bg-transparent lg:hover:text-ink";

/**
 * Frame of every /kelola screen: a menu of the areas you hold (a column from lg, a sticky chip row
 * below) and the screen. Roles are known only in the browser, so the first render is a skeleton.
 */
export function KelolaFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const viewer = useViewer();
  const roles = useEffectiveRoles();

  if (!hydrated) {
    return (
      <div role="status" aria-label="Memuat" className="grid max-w-170 gap-4">
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

  const items = [{ id: "ringkasan", label: "Ringkasan", href: KELOLA_HREF }, ...areas];
  return (
    <div className="mx-auto grid w-full max-w-260 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <nav
        aria-label="Bagian kelola"
        className={cn(
          "sticky top-[calc(3.25rem+var(--safe-top))] z-20 -mx-4 border-b border-line bg-canvas md:top-[calc(3.5rem+var(--safe-top))] md:mx-0",
          "lg:top-[calc(5.5rem+var(--safe-top))] lg:self-start lg:border-b-0",
        )}
      >
        <ul className="scroll-edge-fade flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-3 md:px-0 lg:grid lg:gap-0.5 lg:p-0 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const on =
              item.href === KELOLA_HREF ? pathname === KELOLA_HREF : current?.id === item.id;
            return (
              <li key={item.id} className="contents">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(linkBase, on ? linkOn : linkOff)}
                >
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
