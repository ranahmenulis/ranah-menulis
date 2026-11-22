import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ModerationQueueView } from "@/features/kelola/admin/components/moderation-queue-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("moderation", "manage") };
}

export default function Page() {
  return <ModerationQueueView />;
}
