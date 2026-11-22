import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { NewProjectView } from "@/features/kelola/organizer/components/new-project-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("newProject", "manage"), robots: { index: false } };
}

export default function Page() {
  return <NewProjectView />;
}
