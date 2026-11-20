import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Skeleton } from "@/components/ui/states";
import { DISCOVER_HREF, NEW_POST_HREF } from "@/features/app-shell/nav";

/** Shown only if opening a draft takes more than 300ms (DESIGN.md 8). */
export function ComposeLoading() {
  return (
    <main className="px-4 pt-24">
      <div
        role="status"
        aria-label="Membuka draf"
        className="mx-auto grid w-full max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-3.5 opacity-0"
      >
        <Skeleton className="mb-4 h-9 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[94%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
    </main>
  );
}

/** A draft link that no longer leads anywhere, or a store that would not open. */
export function ComposeMissing({ failed }: { failed: boolean }) {
  return (
    <main className="px-4 pt-24">
      <div className="mx-auto grid w-full max-w-170 justify-items-start gap-4">
        {failed ? (
          <ErrorBanner className="w-full">
            Draf ini gagal dibuka. Isinya tidak diubah; yang gagal hanya pemuatannya.
          </ErrorBanner>
        ) : (
          <>
            <p className="font-serif text-xl leading-7 font-semibold">
              Draf ini tidak ada di perangkat ini.
            </p>
            <p className="text-sm text-ink-muted">
              Mungkin sudah diterbitkan atau dibuka dari perangkat lain.
            </p>
          </>
        )}
        <div className="flex items-center gap-2">
          <ButtonLink href={NEW_POST_HREF} variant="secondary">
            Tulis postingan baru
          </ButtonLink>
          <ButtonLink href={DISCOVER_HREF} variant="text">
            Kembali ke Community
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
