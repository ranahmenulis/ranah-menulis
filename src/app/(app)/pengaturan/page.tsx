import type { Metadata } from "next";
import { SettingsView } from "@/features/account/components/settings/settings-view";

export const metadata: Metadata = { title: "Pengaturan akun · RanahMenulis" };

export default function Page() {
  return <SettingsView />;
}
