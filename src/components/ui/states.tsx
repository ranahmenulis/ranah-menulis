import type { ComponentProps, ReactNode } from "react";
import { Info, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { Button } from "./button";

/** Kosong: satu kalimat serif yang menyatakan keadaan + satu aksi. Tanpa ilustrasi. */
export function EmptyState({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid justify-items-start gap-4 py-8", className)}>
      <p className="font-serif text-xl leading-7 font-semibold text-ink">{children}</p>
      {action}
    </div>
  );
}

/** Memuat: bentuk konten asli di atas latar subtle. Denyut berhenti bila reduced-motion. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("bg-subtle motion-safe:animate-[rm-skel_1.2s_ease-in-out_infinite]", className)}
      {...props}
    />
  );
}

/** Contoh bentuk butir feed. Tampilkan hanya bila data datang lebih dari 300ms. */
export function FeedItemSkeleton() {
  return (
    <div role="status" aria-label="Memuat" className="grid gap-3 border-b border-line py-6">
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-3.5 w-40" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/** Galat: banner danger-subtle + ikon + apa yang gagal + Coba lagi. Galat satu blok tidak mematikan blok lain. */
export function ErrorBanner({
  children,
  action,
  className,
}: {
  children: ReactNode;
  /** Biasanya <RetryButton onClick=...>; dilewatkan sebagai slot agar komponen ini tetap server component. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex items-start gap-3 bg-danger-subtle px-4 py-3.5 text-sm text-ink", className)}>
      <WarningCircle size={20} aria-hidden className="shrink-0 text-danger" />
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  );
}

/** Tombol "Coba lagi" untuk ErrorBanner. Pakai di komponen klien yang memegang aksinya. */
export function RetryButton(props: Omit<ComponentProps<typeof Button>, "variant" | "size" | "children">) {
  return (
    <Button variant="secondary" size="sm" className="-my-1" {...props}>
      Coba lagi
    </Button>
  );
}

/** Kabar yang perlu dibaca tetapi bukan galat [usulan]. Satu per blok. */
export function Notice({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 bg-subtle px-4 py-3.5 text-sm text-ink", className)}>
      <Info size={20} aria-hidden className="shrink-0" />
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  );
}
