import type { Metadata } from "next";
import { ContestsView } from "@/features/kelola/juri/components/contests-view";

export const metadata: Metadata = { title: "Penilaian · Kelola · RanahMenulis" };

export default function Page() {
  return <ContestsView />;
}
