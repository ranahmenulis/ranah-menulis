import type { Metadata } from "next";
import { ManageView } from "@/features/kelola/organizer/components/manage-view";

export const metadata: Metadata = {
  title: "Kelola proyek · Kelola · RanahMenulis",
  robots: { index: false },
};

/** Thin route: the project, registrations and work are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/organizer/[slug]">) {
  const { slug } = await params;
  return <ManageView slug={slug} />;
}
