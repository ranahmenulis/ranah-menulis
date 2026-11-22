import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { QueueView } from "@/features/kelola/editor/components/queue-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("submissionQueue", "manage") };
}

export default function Page() {
  return <QueueView />;
}
