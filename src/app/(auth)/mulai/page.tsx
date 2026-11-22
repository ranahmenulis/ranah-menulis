import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { OnboardingView } from "@/features/account/components/onboarding-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("completeProfile"), robots: { index: false } };
}

export default function Page() {
  return <OnboardingView />;
}
