import { cn } from "@/lib/cn";

type DotKind = "full" | "ring" | "fill" | "empty" | "lock";

const base = "inline-block shrink-0 rounded-full";

/**
 * Dots used by the Streak calendar and milestones (DESIGN.md 7.3). Meaning is carried by fill,
 * never by color alone (the accent is the only hue): full = target met, ring = something written, empty = nothing, lock = not yet.
 * "fill" is the ring that fills once (300ms) when today's target is reached.
 */
export function Dot({
  kind,
  size = 14,
  className,
}: {
  kind: DotKind;
  size?: number;
  className?: string;
}) {
  const style = kind === "empty" ? undefined : { width: size, height: size };
  if (kind === "empty") {
    return (
      <i
        aria-hidden
        className={cn(base, "size-1 bg-line-strong opacity-(--opacity-dot-empty)", className)}
      />
    );
  }
  if (kind === "full")
    return <i aria-hidden style={style} className={cn(base, "bg-accent", className)} />;
  if (kind === "lock") {
    return (
      <i
        aria-hidden
        style={style}
        className={cn(base, "border-[1.5px] border-dashed border-ink-faint", className)}
      />
    );
  }
  return (
    <i
      aria-hidden
      style={style}
      className={cn(
        base,
        "relative shadow-[inset_0_0_0_1.5px_var(--accent-ink)]",
        kind === "fill" &&
          "after:absolute after:inset-0 after:scale-0 after:rounded-full after:bg-accent after:content-[''] motion-safe:after:animate-[rm-fill_300ms_cubic-bezier(0.2,0,0,1)_200ms_forwards] motion-reduce:after:scale-100",
        className,
      )}
    />
  );
}
