"use client";

import { List } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { KELOLA_HREF, areasFor } from "../access";

/**
 * Phones only: a hamburger that opens the management areas, shown only to people who hold a role.
 * The bottom bar stays at five tabs for everyone else.
 */
export function ManagerMenu({ className }: { className?: string }) {
  const t = useT().kelolaShared;
  const areas = areasFor(useEffectiveRoles());
  const [open, setOpen] = useState(false);
  if (areas.length === 0) return null;
  const close = () => setOpen(false);
  const items = [
    { id: "ringkasan", label: t.frame.summary, href: KELOLA_HREF },
    ...areas.map((a) => ({ id: a.id, label: t.areas[a.id].label, href: a.href })),
  ];
  return (
    <>
      <IconButton
        label={t.menu.open}
        onClick={() => setOpen(true)}
        className={cn("-ml-2", className)}
      >
        <List size={24} aria-hidden />
      </IconButton>
      <Drawer open={open} onClose={close} title={t.menu.title} closeLabel={t.menu.close}>
        <nav aria-label={t.frame.navLabel} className="overflow-y-auto">
          <ul>
            {items.map((item) => (
              <li key={item.id} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-12 items-center px-4 text-sm font-medium text-ink no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>
    </>
  );
}
