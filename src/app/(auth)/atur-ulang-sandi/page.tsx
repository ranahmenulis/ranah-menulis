import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ResetForm } from "@/features/account/components/reset-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("newPassword"), robots: { index: false } };
}

export default function Page() {
  return <ResetForm />;
}
