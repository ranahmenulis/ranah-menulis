import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { DocumentsView } from "@/features/studio/components/documents/documents-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("studio") };
}

export default function Page() {
  return <DocumentsView />;
}
