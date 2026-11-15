import type { ReactNode } from "react";
import { AppShell } from "@/features/app-shell/app-shell";

/** Frame for the signed-in screens. Sign-in is bypassed while screens are sliced with dummy data. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
