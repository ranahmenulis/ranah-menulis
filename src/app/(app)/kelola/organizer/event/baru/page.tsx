import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ManageEventView } from "@/features/kelola/organizer/events/manage-event-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("createEvent") };
}

export default function Page() {
  return <ManageEventView />;
}
