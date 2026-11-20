"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import type { NavEntry } from "./nav";

type Variant = "sidebar" | "rail" | "tab";

const layout: Record<Variant, string> = {
  sidebar: "flex h-10 items-center gap-3 px-3 text-sm",
  rail: "grid justify-items-center gap-1 py-2 text-xs",
  tab: "grid content-center justify-items-center gap-0.5 text-xs",
};

/**
 * One navigation entry, always weight 500 (client font brief). Active = ink and a filled icon; no
 * pill behind it (DESIGN.md 5.1). The weight never changes, so labels do not shift.
 * An entry without a destination yet renders as a disabled item instead of a link to nowhere.
 */
export function NavLink({
  entry,
  variant,
  active,
}: {
  entry: NavEntry;
  variant: Variant;
  active: boolean;
}) {
  const { nav } = useT().shell;
  const { Icon, href } = entry;
  const label = nav[entry.id as keyof typeof nav] ?? entry.label;
  const cls = cn(
    layout[variant],
    "font-medium no-underline",
    active ? "text-ink" : "text-ink-muted",
    href ? "hover:text-ink" : "cursor-default opacity-(--opacity-disabled)",
  );
  const content = (
    <>
      <Icon size={24} weight={active ? "fill" : "regular"} aria-hidden />
      {label}
    </>
  );
  if (!href) {
    return (
      <span className={cls} aria-disabled="true" title={nav.soon}>
        {content}
      </span>
    );
  }
  return (
    <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  );
}
