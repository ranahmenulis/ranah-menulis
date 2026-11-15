import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/features/app-shell/app-shell";

/**
 * Frame for the signed-in screens. Sign-in is bypassed while screens are sliced with dummy data.
 * The frame reads the pathname, which is only known at request time on dynamic routes such as
 * /postingan/[id], so it streams in behind an empty bar.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="h-13 border-b border-line md:h-14" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
