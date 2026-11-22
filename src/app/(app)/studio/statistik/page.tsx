import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { StatisticsView } from "@/features/studio/components/statistics/statistics-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("statistics", "studio") };
}

export default function Page() {
  return <StatisticsView />;
}
