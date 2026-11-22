import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ManageEventsView } from "@/features/kelola/organizer/events/manage-event-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("manageEvents") };
}

export default function Page() {
  return <ManageEventsView />;
}
