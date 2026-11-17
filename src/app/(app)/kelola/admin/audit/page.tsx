import type { Metadata } from "next";
import { AuditView } from "@/features/kelola/audit/audit-view";

export const metadata: Metadata = { title: "Audit log · Kelola · RanahMenulis" };

export default function Page() {
  return <AuditView />;
}
