import { Suspense, type ReactNode } from "react";
import { AuthFrame } from "@/features/account/components/auth-frame";

/**
 * Frame of the screens before the app (sign in, sign up, reset, verify, onboarding). The forms read
 * the address (`?lanjut=`, `?status=`), which is only known at request time, so they stream in.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthFrame>
      <Suspense>{children}</Suspense>
    </AuthFrame>
  );
}
