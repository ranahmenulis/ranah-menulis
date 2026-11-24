import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Width 1296 with a 48px margin (16 on a phone). */
export function Wrap({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-[1296px] px-4 md:px-12", className)} {...props} />
  );
}

/** A landing section: a wide gap above it (112 on a phone, 176 from md), so each one breathes. */
export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("pt-28 md:pt-44", className)} {...props} />;
}

/**
 * The head of a section (tahap H): the title and, at most, one sentence, centred. `align="start"`
 * sets it flush left for two-column sections.
 */
export function SectionHead({
  id,
  title,
  lead,
  align = "center",
  className,
}: {
  id: string;
  title: string;
  lead?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 md:gap-5",
        align === "center" && "mx-auto max-w-[760px] justify-items-center text-center",
        className,
      )}
    >
      <h2 id={id} className="landing-h2">
        {title}
      </h2>
      {lead && (
        <p className="max-w-[46ch] text-lg leading-7 text-pretty text-ink-muted md:text-xl md:leading-8">
          {lead}
        </p>
      )}
    </div>
  );
}

/** Small pill above a title: only the closing card still uses one. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("mb-5 md:mb-6", className)}>
      <span
        className="inline-flex h-8 items-center rounded-full bg-accent-subtle px-3.5 text-xs font-semibold text-accent-ink"
        {...props}
      />
    </p>
  );
}
