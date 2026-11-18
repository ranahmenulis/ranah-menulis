import type { Metadata } from "next";
import { ManageEventView } from "@/features/kelola/organizer/events/manage-event-view";

export const metadata: Metadata = { title: "Buat Event · RanahMenulis" };

export default function Page() {
  return <ManageEventView />;
}
