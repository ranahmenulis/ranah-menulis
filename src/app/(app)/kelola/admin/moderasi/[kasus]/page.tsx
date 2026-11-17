import type { Metadata } from "next";
import { CaseView } from "@/features/kelola/admin/components/case-view";

export const metadata: Metadata = {
  title: "Laporan · Kelola · RanahMenulis",
  robots: { index: false },
};

/** Thin route: reports are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/admin/moderasi/[kasus]">) {
  const { kasus } = await params;
  return <CaseView caseKey={decodeURIComponent(kasus)} />;
}
