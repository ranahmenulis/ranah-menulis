import type { Metadata } from "next";
import { SavedView } from "@/features/saved/saved-view";

export const metadata: Metadata = { title: "Tersimpan · RanahMenulis" };

export default function Page() {
  return <SavedView />;
}
