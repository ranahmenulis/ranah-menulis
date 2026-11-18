import type { Metadata } from "next";
import { ManageEventsView } from "@/features/kelola/organizer/events/manage-event-view";

export const metadata: Metadata = { title: "Kelola Event · RanahMenulis" };

export default function Page() {
  return <ManageEventsView />;
}
