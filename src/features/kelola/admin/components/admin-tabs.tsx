"use client";

import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n/provider";
import { ADMIN_GROUPS_HREF } from "@/features/community/groups/group-model";
import { ADMIN_HREF } from "../area-hrefs";

function current(pathname: string): string {
  if (pathname.startsWith(ADMIN_GROUPS_HREF)) return "grup";
  if (pathname.startsWith(`${ADMIN_HREF}/moderasi`)) return "moderasi";
  if (pathname.startsWith(`${ADMIN_HREF}/kurasi`)) return "kurasi";
  if (pathname.startsWith(`${ADMIN_HREF}/pengaturan`)) return "pengaturan";
  if (pathname.startsWith(`${ADMIN_HREF}/audit`)) return "audit";
  return "pengguna";
}

/** The parts of the Admin area, navigated by link. */
export function AdminTabs() {
  const pathname = usePathname();
  const t = useT().kelolaAdmin.tabs;
  return (
    <Tabs
      label={t.label}
      value={current(pathname)}
      variant="pill"
      className="mb-6"
      items={[
        { id: "pengguna", label: t.users, href: ADMIN_HREF },
        { id: "moderasi", label: t.moderation, href: `${ADMIN_HREF}/moderasi` },
        { id: "kurasi", label: t.curation, href: `${ADMIN_HREF}/kurasi` },
        { id: "pengaturan", label: t.settings, href: `${ADMIN_HREF}/pengaturan` },
        { id: "grup", label: t.groups, href: ADMIN_GROUPS_HREF },
        { id: "audit", label: t.audit, href: `${ADMIN_HREF}/audit` },
      ]}
    />
  );
}
