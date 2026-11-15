import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Lebar 1296 dengan margin 48 (ponsel 16). Grid 12 kolom, gutter 24, mulai dari 768. */
export function Wrap({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-[1296px] px-4 md:px-12", className)} {...props} />
  );
}

export function Grid({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("md:grid md:grid-cols-12 md:gap-x-6", className)} {...props} />;
}

/** Bagian landing: jarak atas 128 (ponsel 80). */
export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("pt-20 md:pt-32", className)} {...props} />;
}

/** Small pill above a section title (client images: "The Ecosystem", "Ranah Studio", ...). */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("mb-5 md:col-span-12 md:mb-6", className)}>
      <span
        className="inline-flex h-8 items-center rounded-full bg-subtle px-3.5 text-xs font-semibold tracking-[0.12em] text-ink uppercase"
        {...props}
      />
    </p>
  );
}

/** Garis atas + judul bagian, selebar grid. */
export function SectionTop({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-t border-line pt-8 md:col-span-12 md:pt-12", className)}
      {...props}
    />
  );
}
