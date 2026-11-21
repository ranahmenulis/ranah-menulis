import type { ReactNode } from "react";
import { AdminBand } from "@/features/kelola/admin/components/admin-band";
import { AdminTabs } from "@/features/kelola/admin/components/admin-tabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminBand />
      <AdminTabs />
      {children}
    </>
  );
}
