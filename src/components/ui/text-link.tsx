import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type TextLinkProps = ComponentProps<typeof Link> & {
  /** Di teks karya garis bawah selalu terlihat; di antarmuka hanya saat hover dan fokus. */
  prose?: boolean;
};

export function TextLink({ prose = false, className, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "text-ink decoration-1 underline-offset-3",
        prose ? "underline" : "no-underline hover:underline focus-visible:underline",
        className,
      )}
      {...props}
    />
  );
}
