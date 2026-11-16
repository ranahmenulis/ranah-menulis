"use client";

import type { ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useAuthLinks } from "../hooks/use-auth-links";

type Props = Omit<ComponentProps<typeof ButtonLink>, "href">;

/** "Masuk" as a button; the reader returns to the current screen afterwards. */
export function SignInButton(props: Props) {
  return <ButtonLink href={useAuthLinks().signIn} {...props} />;
}

/** "Daftar" as a button; the reader returns to the current screen afterwards. */
export function SignUpButton(props: Props) {
  return <ButtonLink href={useAuthLinks().signUp} {...props} />;
}
