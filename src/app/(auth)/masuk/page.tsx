import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { SignInForm } from "@/features/account/components/sign-in-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("signIn"), robots: { index: false } };
}

export default function Page() {
  return <SignInForm />;
}
