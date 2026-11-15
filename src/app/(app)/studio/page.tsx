import type { Metadata } from "next";
import { DocumentsView } from "@/features/studio/components/documents/documents-view";

export const metadata: Metadata = { title: "Studio · RanahMenulis" };

export default function Page() {
  return <DocumentsView />;
}
