import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { AuditView } from "@/features/kelola/audit/audit-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("audit", "manage") };
}

export default function Page() {
  return <AuditView />;
}
