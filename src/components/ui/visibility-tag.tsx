import { Globe, Lock, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

type Props =
  | { visibility: "pribadi" | "publik"; groupName?: undefined; className?: string }
  | { visibility: "grup"; groupName: string; className?: string };

/** Selalu terlihat di dekat judul dokumen dan di dialog Bagikan; tidak pernah disembunyikan di menu. */
export function VisibilityTag(props: Props) {
  const { className } = props;
  const [Icon, text] =
    props.visibility === "pribadi"
      ? [Lock, "Pribadi"]
      : props.visibility === "publik"
        ? [Globe, "Publik"]
        : [UsersThree, `Grup: ${props.groupName}`];

  return (
    <span
      className={cn("inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-muted", className)}
    >
      <Icon size={16} aria-hidden className="shrink-0" />
      <span className="truncate">{text}</span>
    </span>
  );
}
