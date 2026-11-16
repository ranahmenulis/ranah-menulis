import type { Metadata } from "next";
import { SignInForm } from "@/features/account/components/sign-in-form";

export const metadata: Metadata = {
  title: "Masuk · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <SignInForm />;
}
