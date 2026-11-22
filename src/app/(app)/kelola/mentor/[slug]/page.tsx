import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { MentorClassView } from "@/features/kelola/mentor/components/mentor-class-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("manageClass", "manage"), robots: { index: false } };
}

/** Thin route: hand-ins, tasks and registrations are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/mentor/[slug]">) {
  const { slug } = await params;
  return <MentorClassView slug={slug} />;
}
