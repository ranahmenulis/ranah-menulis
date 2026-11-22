import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { VerifyView } from "@/features/account/components/verify-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("verifyEmail"), robots: { index: false } };
}

export default function Page() {
  return <VerifyView />;
}
