import type { Metadata } from "next";
import { SettingsView } from "@/features/kelola/admin/settings/settings-view";

export const metadata: Metadata = { title: "Pengaturan · Kelola · RanahMenulis" };

export default function Page() {
  return <SettingsView />;
}
