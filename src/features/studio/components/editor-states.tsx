"use client";

import Link from "next/link";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";

/** Shown only when loading takes longer than 300ms (DESIGN.md 8); CSS keeps it invisible until then. */
export function EditorLoading() {
  return (
    <div
      role="status"
      aria-label="Membuka dokumen"
      className="mx-auto grid w-full max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-3.5 opacity-0"
    >
      <Skeleton className="mb-6 h-10 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[96%]" />
      <Skeleton className="h-4 w-[88%]" />
      <Skeleton className="mb-4 h-4 w-3/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[92%]" />
      <Skeleton className="h-4 w-7/10" />
    </div>
  );
}

export function EditorError({ onRetry, backHref }: { onRetry: () => void; backHref: string }) {
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4">
      <ErrorBanner className="w-full" action={<RetryButton onClick={onRetry} />}>
        Dokumen ini gagal dibuka. Isinya tidak diubah; yang gagal hanya pemuatannya.
      </ErrorBanner>
      <ButtonLink href={backHref} variant="text" className="px-0">
        Kembali ke Studio
      </ButtonLink>
    </div>
  );
}

/** "Tidak tersedia": a single column with one sentence and a way back (DESIGN.md 8). */
export function EditorMissing({ backHref }: { backHref: string }) {
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4 py-8">
      <p className="font-serif text-xl leading-7 font-semibold">
        Dokumen ini tidak ada di perangkat ini.
      </p>
      <p className="text-sm text-ink-muted">
        Mungkin sudah dipindahkan atau dibuka dari perangkat lain.{" "}
        <Link href={backHref} className="text-ink underline underline-offset-3">
          Kembali ke Studio
        </Link>
      </p>
    </div>
  );
}
