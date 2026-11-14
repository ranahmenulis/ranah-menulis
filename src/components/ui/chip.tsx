import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type ChipProps = Omit<ComponentProps<"button">, "type"> & { pressed?: boolean };

/** Genre, filter, minat. Letakkan di dalam grup ber-aria-label. Bukan penanda status. */
export function Chip({ pressed = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-sm",
        pressed ? "bg-ink text-on-ink" : "bg-subtle text-ink hover:bg-line",
        className,
      )}
      {...props}
    />
  );
}
