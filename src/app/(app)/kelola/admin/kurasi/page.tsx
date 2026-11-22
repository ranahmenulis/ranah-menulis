import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { CurationView } from "@/features/kelola/admin/curation/curation-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("curation", "manage") };
}

export default function Page() {
  return <CurationView />;
}
