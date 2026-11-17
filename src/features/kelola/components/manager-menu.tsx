"use client";

import { List } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { useRoles } from "@/lib/viewer";
import { KELOLA_HREF, areasFor } from "../access";

/**
 * Phones only: a hamburger that opens the management areas, shown only to people who hold a role.
 * The bottom bar stays at five tabs for everyone else.
 */
export function ManagerMenu({ className }: { className?: string }) {
  const areas = areasFor(useRoles());
  const [open, setOpen] = useState(false);
  if (areas.length === 0) return null;
  const close = () => setOpen(false);
  const items = [{ id: "ringkasan", label: "Ringkasan", href: KELOLA_HREF }, ...areas];
  return (
    <>
      <IconButton
        label="Buka menu kelola"
        onClick={() => setOpen(true)}
        className={cn("-ml-2", className)}
      >
        <List size={24} aria-hidden />
      </IconButton>
      <Drawer open={open} onClose={close} title="Kelola" closeLabel="Tutup menu kelola">
        <nav aria-label="Bagian kelola" className="overflow-y-auto">
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
