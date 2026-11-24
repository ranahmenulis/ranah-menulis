import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { BugReportsView } from "@/features/kelola/admin/components/bug-reports-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("bugReports", "manage") };
}

export default function Page() {
  return <BugReportsView />;
}
