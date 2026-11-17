import type { Metadata } from "next";
import { MentorClassView } from "@/features/kelola/mentor/components/mentor-class-view";

export const metadata: Metadata = {
  title: "Kelola kelas · Kelola · RanahMenulis",
  robots: { index: false },
};

/** Thin route: hand-ins, tasks and registrations are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/mentor/[slug]">) {
  const { slug } = await params;
  return <MentorClassView slug={slug} />;
}
