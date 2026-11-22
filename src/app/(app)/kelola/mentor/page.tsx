import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { MentorClassesView } from "@/features/kelola/mentor/components/mentor-classes-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("classes", "manage") };
}

export default function Page() {
  return <MentorClassesView />;
}
