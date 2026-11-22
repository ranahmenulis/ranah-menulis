import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { StreakView } from "@/features/studio/components/streak/streak-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("streak", "studio") };
}

export default function Page() {
  return <StreakView />;
}
