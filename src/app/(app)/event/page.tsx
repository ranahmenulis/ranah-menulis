import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { EventsView } from "@/features/community/events/components/events-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("event") };
}

export default function Page() {
  return <EventsView />;
}
