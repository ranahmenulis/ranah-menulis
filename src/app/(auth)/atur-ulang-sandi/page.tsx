import type { Metadata } from "next";
import { ResetForm } from "@/features/account/components/reset-form";

export const metadata: Metadata = {
  title: "Kata sandi baru · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <ResetForm />;
}
