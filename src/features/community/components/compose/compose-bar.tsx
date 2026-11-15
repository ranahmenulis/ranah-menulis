"use client";

import { ArrowLeft, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

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
  return (
    <header className="sticky top-0 z-40 flex h-13 items-center gap-2 border-b border-line bg-canvas pr-3 pl-2 md:h-14 md:gap-3 md:px-4">
      {p.backToText ? (
        <IconButton label="Kembali memilih bagian" onClick={p.onBackToText}>
          <ArrowLeft size={20} aria-hidden />
        </IconButton>
      ) : (
        <IconButton label="Tutup tanpa menerbitkan" onClick={p.onClose}>
          <X size={20} aria-hidden />
        </IconButton>
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
