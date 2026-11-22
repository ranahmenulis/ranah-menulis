import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { NotificationsView } from "@/features/notifications/notifications-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("notifications") };
}

export default function Page() {
  return <NotificationsView />;
}
