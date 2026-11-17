import type { Metadata } from "next";
import { MentorClassesView } from "@/features/kelola/mentor/components/mentor-classes-view";

export const metadata: Metadata = { title: "Kelas · Kelola · RanahMenulis" };

export default function Page() {
  return <MentorClassesView />;
}
