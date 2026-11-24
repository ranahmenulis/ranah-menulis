import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { BugReportDetailView } from "@/features/kelola/admin/components/bug-report-detail-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("bugReports", "manage"), robots: { index: false } };
}

/** The segment may arrive decoded already; a stray "%" must not break the page. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Thin route: reports are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/admin/laporan/[id]">) {
  const { id } = await params;
  return <BugReportDetailView reportId={safeDecode(id)} />;
}
