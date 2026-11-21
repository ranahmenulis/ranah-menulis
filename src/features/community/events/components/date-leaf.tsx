import { cn } from "@/lib/cn";
import type { TimeZoneName } from "@/features/projects/types";
import { dateLeaf } from "../event-face";

/**
 * An event's start as a calendar leaf: the month above, the day as a large serif number. The full
 * date is always also text nearby, so the leaf is decorative.
 */
export function DateLeaf({
  at,
  zone,
  size = "sm",
  className,
}: {
  at: number;
  zone: TimeZoneName;
  size?: "sm" | "lg";
  className?: string;
}) {
  const leaf = dateLeaf(at, zone);
  const large = size === "lg";
  return (
    <span
      aria-hidden
      className={cn(
        "rm-leaf grid shrink-0 justify-items-center border border-line-strong bg-canvas text-ink",
        large ? "w-28 md:w-32" : "w-14",
        className,
      )}
    >
      <span
        className={cn(
          "w-full bg-ink text-center font-medium tracking-wide text-on-ink uppercase",
          large ? "py-1.5 text-xs" : "py-0.5 text-[10px]",
        )}
      >
        {leaf.month}
      </span>
      <span
        className={cn(
          "font-serif leading-none tabular-nums",
          large ? "pt-3 pb-1 text-[56px] md:text-[64px]" : "pt-1.5 pb-0.5 text-2xl",
        )}
      >
        {leaf.day}
      </span>
      <span className={cn("text-ink-muted", large ? "pb-3 text-xs" : "pb-1.5 text-[10px]")}>
        {large ? leaf.weekday : leaf.weekday.slice(0, 3)}
      </span>
    </span>
  );
}
