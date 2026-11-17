import type { Metadata } from "next";
import { OrganizerView } from "@/features/kelola/organizer/components/organizer-view";

export const metadata: Metadata = { title: "Proyek · Kelola · RanahMenulis" };

export default function Page() {
  return <OrganizerView />;
}
