import type { Metadata } from "next";
import type { ReactNode } from "react";
import { KelolaFrame } from "@/features/kelola/components/kelola-frame";

export const metadata: Metadata = {
  title: "Kelola · RanahMenulis",
  robots: { index: false },
};

/** Roles are known in the browser only, so the frame decides who sees the screen. */
export default function KelolaLayout({ children }: { children: ReactNode }) {
  return <KelolaFrame>{children}</KelolaFrame>;
}
