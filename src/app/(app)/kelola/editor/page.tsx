import type { Metadata } from "next";
import { QueueView } from "@/features/kelola/editor/components/queue-view";

export const metadata: Metadata = { title: "Antrean submission · Kelola · RanahMenulis" };

export default function Page() {
  return <QueueView />;
}
