import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ForgotForm } from "@/features/account/components/forgot-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("forgotPassword"), robots: { index: false } };
}

export default function Page() {
  return <ForgotForm />;
}
