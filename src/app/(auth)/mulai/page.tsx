import type { Metadata } from "next";
import { OnboardingView } from "@/features/account/components/onboarding-view";

export const metadata: Metadata = {
  title: "Lengkapi profil · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <OnboardingView />;
}
