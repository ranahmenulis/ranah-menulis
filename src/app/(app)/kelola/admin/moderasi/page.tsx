import type { Metadata } from "next";
import { ModerationQueueView } from "@/features/kelola/admin/components/moderation-queue-view";

export const metadata: Metadata = { title: "Moderasi · Kelola · RanahMenulis" };

export default function Page() {
  return <ModerationQueueView />;
}
