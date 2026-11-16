import type { Metadata } from "next";
import { VerifyView } from "@/features/account/components/verify-view";

export const metadata: Metadata = {
  title: "Verifikasi email · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <VerifyView />;
}
