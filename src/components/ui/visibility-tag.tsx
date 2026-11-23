"use client";

import { Globe, Lock, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";

type Props =
  | { visibility: "pribadi" | "publik"; groupName?: undefined; className?: string }
  | { visibility: "grup"; groupName: string; className?: string };

/** Always visible next to the document title; never hidden in a menu. */
export function VisibilityTag(props: Props) {
  const { className } = props;
  const t = useT().common.visibility;
  const [Icon, text] =
    props.visibility === "pribadi"
      ? [Lock, t.private]
      : props.visibility === "publik"
        ? [Globe, t.public]
        : [UsersThree, format(t.group, { name: props.groupName ?? "" })];

  return (
    <span
      className={cn("inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-muted", className)}
    >
      <Icon size={16} aria-hidden className="shrink-0" />
      <span className="truncate">{text}</span>
    </span>
  );
}
