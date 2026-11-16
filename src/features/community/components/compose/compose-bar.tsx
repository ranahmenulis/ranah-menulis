"use client";

import { ArrowLeft, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  isDraft: boolean;
  /** False on the success screen: nothing is left to do but leave. */
  actions: boolean;
  /** Phones, second screen: the close button becomes a back arrow to the text. */
  backToText: boolean;
  draftDisabled: boolean;
  publishDisabled: boolean;
  publishing: boolean;
  onClose: () => void;
  onBackToText: () => void;
  onDraft: () => void;
  onPublish: () => void;
};

/**
 * Bar of the compose screen: close, what this is, and the two actions. "Terbitkan" is the only
 * ink button; it stays disabled until the post is complete (BR-COM-01). On phones the draft button
 * moves to the footer.
 */
export function ComposeBar(p: Props) {
  // Once the post is out there is nothing left that "without publishing" could refer to.
  const closeLabel = p.actions ? "Tutup tanpa menerbitkan" : "Tutup";
  return (
    <header className="sticky top-0 z-40 flex h-[calc(3.25rem+var(--safe-top))] items-center gap-2 border-b border-line bg-canvas pt-(--safe-top) pr-3 pl-2 md:h-[calc(3.5rem+var(--safe-top))] md:gap-3 md:px-4">
      {p.backToText ? (
        <IconButton label="Kembali memilih bagian" onClick={p.onBackToText}>
          <ArrowLeft size={20} aria-hidden />
        </IconButton>
      ) : (
        // From md the icon carries the word "Tutup", so the way out never depends on guessing an X.
        <button
          type="button"
          aria-label={closeLabel}
          title={closeLabel}
          onClick={p.onClose}
          className={cn(
            iconButtonClass,
            "md:inline-flex! md:w-auto! md:items-center md:gap-1.5 md:px-3 md:text-sm md:font-medium",
          )}
        >
          <X size={20} aria-hidden />
          <span className="max-md:hidden">Tutup</span>
        </button>
      )}
      <span className="min-w-0 truncate text-[15px] leading-[22px] font-medium">{p.name}</span>
      {p.isDraft && (
        <span className="shrink-0 rounded-full border border-dashed border-ink-muted px-2.5 py-0.5 text-xs text-ink-muted">
          Draf
        </span>
      )}
      <span className="flex-1" />
      {p.actions && (
        <>
          <Button
            variant="secondary"
            size="sm"
            disabled={p.draftDisabled}
            onClick={p.onDraft}
            className="max-md:hidden"
          >
            Simpan sebagai draf
          </Button>
          <Button
            size="sm"
            disabled={p.publishDisabled}
            loading={p.publishing}
            onClick={p.onPublish}
          >
            Terbitkan
          </Button>
        </>
      )}
    </header>
  );
}
