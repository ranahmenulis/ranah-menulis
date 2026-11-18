"use client";

import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { ADMIN_HREF } from "../area-hrefs";

function current(pathname: string): string {
  if (pathname.startsWith(`${ADMIN_HREF}/moderasi`)) return "moderasi";
  if (pathname.startsWith(`${ADMIN_HREF}/kurasi`)) return "kurasi";
  if (pathname.startsWith(`${ADMIN_HREF}/pengaturan`)) return "pengaturan";
  if (pathname.startsWith(`${ADMIN_HREF}/audit`)) return "audit";
  return "pengguna";
}

/** The parts of the Admin area, navigated by link. Groups join here later. */
export function AdminTabs() {
  const pathname = usePathname();
  return (
    <Tabs
      label="Bagian Admin"
      value={current(pathname)}
      className="mb-6"
      items={[
        { id: "pengguna", label: "Pengguna", href: ADMIN_HREF },
        { id: "moderasi", label: "Moderasi", href: `${ADMIN_HREF}/moderasi` },
        { id: "kurasi", label: "Kurasi", href: `${ADMIN_HREF}/kurasi` },
        { id: "pengaturan", label: "Pengaturan", href: `${ADMIN_HREF}/pengaturan` },
        { id: "audit", label: "Audit log", href: `${ADMIN_HREF}/audit` },
      ]}
    />
  );
}
