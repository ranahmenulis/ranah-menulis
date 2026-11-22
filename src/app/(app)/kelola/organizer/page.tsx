import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { OrganizerView } from "@/features/kelola/organizer/components/organizer-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("projectList", "manage") };
}

export default function Page() {
  return <OrganizerView />;
}
