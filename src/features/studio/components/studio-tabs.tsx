"use client";

import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

/** Dokumen and Streak: two areas of one module (DESIGN.md 5.3), navigated by link. */
export function StudioTabs() {
  const pathname = usePathname();
  return (
    <Tabs
      label="Studio"
      value={pathname.startsWith("/studio/streak") ? "streak" : "dokumen"}
      items={[
        { id: "dokumen", label: "Dokumen", href: "/studio" },
        { id: "streak", label: "Streak", href: "/studio/streak" },
      ]}
    />
  );
}
