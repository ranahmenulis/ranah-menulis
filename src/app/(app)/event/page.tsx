import type { Metadata } from "next";
import { EventsView } from "@/features/community/events/components/events-view";

export const metadata: Metadata = { title: "Event · RanahMenulis" };

export default function Page() {
  return <EventsView />;
}
