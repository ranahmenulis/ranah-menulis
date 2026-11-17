"use client";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { HOME_HREF } from "@/features/app-shell/nav";

/**
 * Shown instead of a management screen when the viewer lacks the role. Always offers a way out.
 * Hiding the nav entry is not access control; this screen is just the honest answer in the UI.
 */
export function AccessDenied({ reason }: { reason: "tamu" | "peran" }) {
  return (
    <section aria-labelledby="kelola-denied" className="grid max-w-170 justify-items-start gap-4">
      <h1 id="kelola-denied" className="heading-lg">
        Kelola
      </h1>
      <Notice>
        {reason === "tamu"
          ? "Masuk dulu untuk membuka bagian ini."
          : "Kamu tidak punya akses ke bagian ini."}
      </Notice>
      {reason === "tamu" ? (
        <SignInButton>Masuk</SignInButton>
      ) : (
        <ButtonLink href={HOME_HREF}>Kembali ke Beranda</ButtonLink>
      )}
    </section>
  );
}
