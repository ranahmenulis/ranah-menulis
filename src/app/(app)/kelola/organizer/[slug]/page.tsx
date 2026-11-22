import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ManageView } from "@/features/kelola/organizer/components/manage-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("manageProject", "manage"), robots: { index: false } };
}

/** Thin route: the project, registrations and work are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/organizer/[slug]">) {
  const { slug } = await params;
  return <ManageView slug={slug} />;
}
