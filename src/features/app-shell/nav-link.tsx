"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import type { NavEntry } from "./nav";

type Variant = "sidebar" | "sub" | "rail" | "tab";

const layout: Record<Variant, string> = {
  sidebar: "flex h-10 items-center gap-3 px-3 text-sm",
  sub: "flex h-9 items-center pl-12 text-sm",
  rail: "grid justify-items-center gap-1 py-2 text-xs",
  tab: "grid content-center justify-items-center gap-0.5 text-xs",
};

/**
 * One navigation entry. Active = ink, weight 500, filled icon; no pill behind it (DESIGN.md 5.1).
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
    "no-underline",
    active ? "font-medium text-ink" : "text-ink-muted",
    href ? "hover:text-ink" : "cursor-default opacity-(--opacity-disabled)",
  );
  const content = (
    <>
      {variant !== "sub" && <Icon size={24} weight={active ? "fill" : "regular"} aria-hidden />}
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
