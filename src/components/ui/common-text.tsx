"use client";

import { useT } from "@/lib/i18n/provider";

/**
 * A shared word in the reader's language, for components that must stay server components
 * (`states.tsx`). Renders text only, so it can sit inside a button or a visually hidden label.
 */
export function CommonText({ name }: { name: "loading" | "retry" | "optional" }) {
  return useT().common[name];
}
