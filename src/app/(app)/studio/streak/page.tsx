import type { Metadata } from "next";
import { StreakView } from "@/features/studio/components/streak/streak-view";

export const metadata: Metadata = { title: "Streak · Studio · RanahMenulis" };

export default function Page() {
  return <StreakView />;
}
