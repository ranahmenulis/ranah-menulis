import type { Metadata } from "next";
import { CurationView } from "@/features/kelola/admin/curation/curation-view";

export const metadata: Metadata = { title: "Kurasi · Kelola · RanahMenulis" };

export default function Page() {
  return <CurationView />;
}
