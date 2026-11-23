"use client";

import { GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";

/**
 * "Sign in / Sign up with Google" (Backlog 00 butir 12; Login Google is in the MVP). Shown before
 * the backend exists (user decision, tahap J): `onPress` runs the same bypass as the email form,
 * without a Google window. Wire it to Supabase Auth with the rest of the bypass (R1).
 */
export function GoogleButton({
  mode,
  onPress,
}: {
  mode: "signIn" | "signUp";
  onPress: () => void;
}) {
  const { google } = useT().account;
  return (
    <Button type="button" variant="secondary" onClick={onPress} className="w-full">
      <GoogleLogo size={20} weight="bold" aria-hidden />
      {google[mode]}
    </Button>
  );
}

/** "or", between the Google button and the email form. */
export function OrDivider() {
  const { google } = useT().account;
  return (
    <div className="flex items-center gap-3 text-xs text-ink-muted" role="separator">
      <span className="h-px flex-1 bg-line" />
      {google.or}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
