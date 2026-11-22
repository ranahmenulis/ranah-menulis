import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { SignUpForm } from "@/features/account/components/sign-up-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("signUp"), robots: { index: false } };
}

export default function Page() {
  return <SignUpForm />;
}
