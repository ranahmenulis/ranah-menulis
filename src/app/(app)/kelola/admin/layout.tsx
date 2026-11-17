import type { ReactNode } from "react";
import { AdminTabs } from "@/features/kelola/admin/components/admin-tabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminTabs />
      {children}
    </>
  );
}
