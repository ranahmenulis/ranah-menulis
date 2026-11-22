import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { SettingsView } from "@/features/account/components/settings/settings-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("accountSettings") };
}

export default function Page() {
  return <SettingsView />;
}
