import type { Metadata } from "next";
import { StatisticsView } from "@/features/studio/components/statistics/statistics-view";

export const metadata: Metadata = { title: "Statistik · Studio · RanahMenulis" };

export default function Page() {
  return <StatisticsView />;
}
