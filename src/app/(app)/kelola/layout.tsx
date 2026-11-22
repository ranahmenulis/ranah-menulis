import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import type { ReactNode } from "react";
import { KelolaFrame } from "@/features/kelola/components/kelola-frame";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("manage"), robots: { index: false } };
}

/** Roles are known in the browser only, so the frame decides who sees the screen. */
export default function KelolaLayout({ children }: { children: ReactNode }) {
  return <KelolaFrame>{children}</KelolaFrame>;
}
