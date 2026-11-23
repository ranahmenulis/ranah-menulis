"use client";

import { usePathname } from "next/navigation";
import { ADMIN_GROUPS_HREF } from "@/features/community/groups/group-model";
import type { PostStore } from "@/features/community/storage/post-store";
import { useT } from "@/lib/i18n/provider";
import { RoleBand } from "../../components/role-band";
import { useAdminBand } from "../../use-band-work";
import { ADMIN_HREF } from "../area-hrefs";

/** The tab roots get the band; a person, a case or a group opened from a tab does not. */
const TAB_ROOTS = new Set([
  ADMIN_HREF,
  `${ADMIN_HREF}/moderasi`,
  `${ADMIN_HREF}/kurasi`,
  `${ADMIN_HREF}/pengaturan`,
  `${ADMIN_HREF}/audit`,
  ADMIN_GROUPS_HREF,
]);

export const isAdminTabRoot = (pathname: string) => TAB_ROOTS.has(pathname.replace(/\/$/, ""));

/**
 * The band over every Admin tab (DESIGN.md 7.8). Each tab keeps its own h1, so the area name here
 * is a plain line; the number is the reports still waiting for a decision.
 */
export function AdminBand({ store }: { store?: PostStore }) {
  const pathname = usePathname() ?? "";
  if (!isAdminTabRoot(pathname)) return null;
  return <AdminBandContent store={store} />;
}

function AdminBandContent({ store }: { store?: PostStore }) {
  const t = useT().kelolaAdmin.band;
  const work = useAdminBand(store);
  return (
    <RoleBand
      area="admin"
      title={t.title}
      description={t.description}
      work={work}
      className="mb-6"
    />
  );
}
