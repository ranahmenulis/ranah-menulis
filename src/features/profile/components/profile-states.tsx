"use client";

import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";

/** Shape of a profile, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat profil"
      className="mx-auto grid max-w-274 animate-[rm-appear_0s_300ms_forwards] gap-4 opacity-0 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-12"
    >
      <div className="grid content-start gap-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-5 w-64" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid gap-3 border-b border-line py-6">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="grid content-start justify-items-start gap-3 max-lg:order-first">
        <Skeleton className="size-22 rounded-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-182 py-8">
      <ErrorBanner action={<RetryButton onClick={onRetry} />}>
        Profil ini gagal dimuat. Periksa koneksimu, lalu coba lagi.
      </ErrorBanner>
    </div>
  );
}

/** DESIGN.md 8, "Tidak tersedia": one sentence and a way back. */
export function ProfileGone() {
  return (
    <div className="mx-auto grid max-w-182 justify-items-start gap-4 py-12">
      <p className="font-serif text-xl leading-7 font-semibold">Penulis ini tidak ditemukan.</p>
      <p className="text-sm text-ink-muted">
        Nama penggunanya mungkin salah ketik, atau akunnya sudah tidak aktif.
      </p>
      <ButtonLink href="/beranda" variant="secondary">
        Kembali ke Beranda
      </ButtonLink>
    </div>
  );
}
