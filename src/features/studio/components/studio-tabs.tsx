"use client";

import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

function current(pathname: string): string {
  if (pathname.startsWith("/studio/streak")) return "streak";
  if (pathname.startsWith("/studio/statistik")) return "statistik";
  return "dokumen";
}

/** Dokumen, Streak and Statistik: three areas of one module (DESIGN.md 5.3), navigated by link. */
export function StudioTabs() {
  const pathname = usePathname();
  return (
    <Tabs
      label="Studio"
      value={current(pathname)}
      items={[
        { id: "dokumen", label: "Dokumen", href: "/studio" },
        { id: "streak", label: "Streak", href: "/studio/streak" },
        { id: "statistik", label: "Statistik", href: "/studio/statistik" },
      ]}
    />
  );
}
