import type { Metadata } from "next";
import { NewProjectView } from "@/features/kelola/organizer/components/new-project-view";

export const metadata: Metadata = {
  title: "Proyek baru · Kelola · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <NewProjectView />;
}
