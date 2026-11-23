"use client";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { HOME_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";

/**
 * Shown instead of a management screen when the viewer lacks the role. Always offers a way out.
 * Hiding the nav entry is not access control; this screen is just the honest answer in the UI.
 */
export function AccessDenied({ reason }: { reason: "tamu" | "peran" }) {
  const t = useT().kelolaShared.denied;
  return (
    <section aria-labelledby="kelola-denied" className="grid max-w-170 justify-items-start gap-4">
      <h1 id="kelola-denied" className="heading-lg">
        {t.title}
      </h1>
      <Notice>{reason === "tamu" ? t.guest : t.role}</Notice>
      {reason === "tamu" ? (
        <SignInButton>{t.signIn}</SignInButton>
      ) : (
        <ButtonLink href={HOME_HREF}>{t.home}</ButtonLink>
      )}
    </section>
  );
}
