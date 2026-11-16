import type { Metadata } from "next";
import { SignUpForm } from "@/features/account/components/sign-up-form";

export const metadata: Metadata = {
  title: "Daftar · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <SignUpForm />;
}
