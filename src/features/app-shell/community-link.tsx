"use client";

import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { useCommunityLink } from "@/lib/platform-settings";

/**
 * The one official outside community (PLT-12). Draws nothing until an Administrator sets the
 * address. Opens in a new tab: the conversation lives outside the app, there is no chat here.
 */
export function CommunityLink({ variant }: { variant: "sidebar" | "row" }) {
  const href = useCommunityLink();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-ink-muted no-underline hover:text-ink",
        variant === "sidebar" ? "mt-2 border-t border-line px-3 pt-4" : "mt-4",
      )}
    >
      <ArrowSquareOut size={20} aria-hidden />
      Komunitas
      <span className="sr-only"> (tab baru)</span>
    </a>
  );
}
