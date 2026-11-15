import { Wordmark } from "@/components/ui/logo";
import { TextLink } from "@/components/ui/text-link";
import { Wrap } from "./layout";

export function Footer() {
  return (
    <footer className="pt-20 md:pt-32">
      <Wrap>
        <div className="flex flex-wrap items-center gap-6 border-t border-line pt-10 pb-14">
          <Wordmark height={28} />
          <span className="text-xs text-ink-muted">Indonesia · Malaysia</span>
          {/* Halaman Kebijakan privasi dan Kontak belum ada; wajib sebelum landing tayang. */}
          <nav aria-label="Kaki halaman" className="flex w-full gap-6 md:ml-auto md:w-auto">
            <TextLink
              href="/kebijakan-privasi"
              className="lp-link text-xs text-ink-muted hover:text-ink"
            >
              Kebijakan privasi
            </TextLink>
            <TextLink href="/kontak" className="lp-link text-xs text-ink-muted hover:text-ink">
              Kontak
            </TextLink>
          </nav>
        </div>
      </Wrap>
    </footer>
  );
}
