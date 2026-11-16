import type { Metadata } from "next";
import { ForgotForm } from "@/features/account/components/forgot-form";

export const metadata: Metadata = {
  title: "Lupa kata sandi · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <ForgotForm />;
}
