import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "text" | "danger" | "danger-text";
export type ButtonSize = "md" | "sm" | "hero";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Titik tiga berdenyut di depan label; label dan tombol tetap pada tempatnya. */
  loading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border " +
  "font-semibold whitespace-nowrap select-none cursor-pointer no-underline " +
  "transition-opacity duration-120 ease-out " +
  "disabled:cursor-default disabled:opacity-(--opacity-disabled) " +
  "aria-disabled:cursor-default aria-disabled:opacity-(--opacity-disabled) " +
  "aria-busy:cursor-progress";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-ink text-on-ink hover:opacity-(--opacity-hover) active:opacity-press",
  secondary: "border-ink text-ink transition-none hover:bg-subtle active:bg-line",
  text: "border-transparent text-ink-muted transition-none hover:text-ink active:text-ink active:underline active:underline-offset-3",
  // Hanya di dialog konfirmasi. Label on-ink agar tetap terbaca di mode gelap (usulan).
  danger:
    "border-transparent bg-danger text-on-ink hover:opacity-(--opacity-hover) active:opacity-press",
  "danger-text": "border-transparent text-danger transition-none",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 text-sm",
  sm: "h-8 text-sm",
  hero: "h-12 text-base",
};

const padding: Record<ButtonSize, string> = {
  md: "px-5",
  sm: "px-4",
  hero: "px-7",
};

// Tombol teks tidak punya padding pill.
function classes({ variant = "primary", size = "md" }: Common, className?: string) {
  const textLike = variant === "text" || variant === "danger-text";
  return cn(base, sizes[size], textLike ? "px-1" : padding[size], variants[variant], className);
}

export function LoadingDots() {
  return (
    <span aria-hidden className="inline-flex gap-[3px]">
      {[0, 160, 320].map((delay) => (
        <i
          key={delay}
          className="size-1 rounded-full bg-current motion-safe:animate-[rm-pulse_1s_ease-in-out_infinite]"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

type ButtonProps = Common &
  Omit<ComponentProps<"button">, "type"> & { type?: "button" | "submit" | "reset" };

export function Button({
  variant,
  size,
  loading,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size }, className)}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoadingDots />}
      {children}
    </button>
  );
}

type ButtonLinkProps = Common & ComponentProps<typeof Link>;

/** Tautan yang tampil sebagai tombol. */
export function ButtonLink({
  variant,
  size,
  loading,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={classes({ variant, size }, className)} {...props}>
      {loading && <LoadingDots />}
      {children}
    </Link>
  );
}
