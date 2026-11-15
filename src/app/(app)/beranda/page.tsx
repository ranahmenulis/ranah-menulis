import type { Metadata } from "next";
import { HomeView } from "@/features/home/home-view";

export const metadata: Metadata = { title: "Beranda · RanahMenulis" };

export default function Page() {
  return <HomeView />;
}
