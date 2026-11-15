"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { DISCOVER_HREF } from "@/features/app-shell/nav";

/** Shape of a post, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function PostSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat tulisan"
      className="mx-auto grid w-full max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-3.5 opacity-0"
    >
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-10 w-[86%]" />
      <Skeleton className="mb-3 h-10 w-1/2" />
      <div className="mb-4 flex items-center gap-3 border-y border-line py-5">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-3.5 w-50" />
      </div>
      {[100, 96, 90, 64].map((w) => (
        <Skeleton key={w} className="h-4" style={{ width: `${w}%` }} />
      ))}
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="h-4 w-[94%]" />
      <Skeleton className="h-4 w-[72%]" />
    </div>
  );
}

export function PostError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4 py-12">
      <ErrorBanner className="w-full" action={<RetryButton onClick={onRetry} />}>
        Tulisan ini gagal dimuat. Periksa koneksimu, lalu coba lagi.
      </ErrorBanner>
      <ButtonLink href={DISCOVER_HREF} variant="text" className="px-0">
        Kembali ke Jelajahi
      </ButtonLink>
    </div>
  );
}

/** Withdrawn, missing, or readable only by a group: one sentence and a way out (DESIGN.md 8). */
export function PostGone({ reason }: { reason: "gone" | "group" }) {
  return (
    <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4 py-12">
      <p className="font-serif text-xl leading-7 font-semibold">
        {reason === "gone"
          ? "Tulisan ini sudah ditarik penulisnya."
          : "Tulisan ini hanya untuk anggota grup."}
      </p>
      <p className="max-w-130 text-sm text-ink-muted">
        {reason === "gone"
          ? "Isinya tidak lagi tampil di Community. Kalau kamu menyimpannya, tulisan ini tetap ada di Tersimpan dengan tanda tidak tersedia."
          : "Masuk sebagai anggota grup untuk membacanya."}
      </p>
      <ButtonLink href={DISCOVER_HREF} variant="secondary">
        Kembali ke Jelajahi
      </ButtonLink>
    </div>
  );
}

/** Right column for a signed-out reader at lg and up (DESIGN.md 6.9 #6). */
export function GuestAside({ authorName }: { authorName: string }) {
  return (
    <aside
      aria-label="Untuk tamu"
      className="sticky top-[calc(6rem+var(--safe-top))] hidden w-80 shrink-0 content-start gap-6 self-start lg:grid"
    >
      <div
        aria-disabled="true"
        title="Pencarian belum tersedia"
        className="flex h-9 items-center gap-2 rounded-full bg-subtle px-3.5 text-sm text-ink-muted"
      >
        <MagnifyingGlass size={20} aria-hidden />
        Cari penulis dan karya
      </div>
      <div className="grid gap-3 border-t border-line pt-6">
        <h2 className="text-lg leading-[26px] font-semibold">Baca, apresiasi, simpan.</h2>
        <p className="text-sm leading-[22px] text-ink-muted">
          Dengan akun, kamu bisa memberi Apresiasi, menyimpan tulisan, membalas komentar, dan
          mengikuti {authorName}.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled title="Masuk tersedia setelah akun dibuka">
            Daftar
          </Button>
          <Button
            variant="text"
            disabled
            title="Masuk tersedia setelah akun dibuka"
            className="text-ink!"
          >
            Masuk
          </Button>
        </div>
      </div>
    </aside>
  );
}
