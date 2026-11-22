"use client";

import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n/provider";

function current(pathname: string): string {
  if (pathname.startsWith("/studio/streak")) return "streak";
  if (pathname.startsWith("/studio/statistik")) return "statistik";
  return "dokumen";
}

/** Dokumen, Streak and Statistik: three areas of one module (DESIGN.md 5.3), navigated by link. */
export function StudioTabs() {
  const pathname = usePathname();
  const t = useT().studioDocuments.tabs;
  return (
    <Tabs
      label={t.studio}
      value={current(pathname)}
      items={[
        { id: "dokumen", label: t.documents, href: "/studio" },
        { id: "streak", label: t.streak, href: "/studio/streak" },
        { id: "statistik", label: t.statistics, href: "/studio/statistik" },
      ]}
    />
  );
}
