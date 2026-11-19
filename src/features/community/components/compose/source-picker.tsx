"use client";

import { Lock } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { CheckMark, RadioChoice } from "@/components/ui/choice";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { countWords } from "@/lib/text-stats";
import { formatChanged } from "@/features/studio/relative-time";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { cn } from "@/lib/cn";
import type { PostBlock } from "../../types";

type DocsProps = {
  status: "loading" | "ready" | "error";
  docs: StudioDocument[];
  now: number;
  selectedId: string | null;
  error?: string;
  onSelect: (id: string) => void;
  onChoose: () => void;
  onRetry: () => void;
  onWriteDirect: () => void;
};

/** Step one of "Dari dokumen Studio": which document to take a part of. Nothing leaves it yet. */
export function DocumentChoices(p: DocsProps) {
  return (
    <div className="grid gap-4">
      <h2 className="text-base font-semibold">Pilih dokumen Studio</h2>
      <p className="-mt-2 text-sm text-ink-muted">
        Kamu akan memilih bagian yang menjadi salinan publik. Dokumennya sendiri tidak ikut terbit.
      </p>
      {p.error && <ErrorBanner>{p.error}</ErrorBanner>}

      {p.status === "loading" && (
        <div
          role="status"
          aria-label="Memuat dokumen"
          className="animate-[rm-appear_0s_300ms_forwards] opacity-0"
        >
          {["72%", "56%", "40%", "64%"].map((w) => (
            <div key={w} className="grid gap-2 border-b border-line py-4">
              <Skeleton className="h-4.5" style={{ width: w }} />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      )}

      {p.status === "error" && (
        <ErrorBanner action={<RetryButton onClick={p.onRetry} />}>
          Daftar dokumen Studio gagal dimuat. Kamu tetap bisa menulis langsung.
        </ErrorBanner>
      )}

      {p.status === "ready" && p.docs.length === 0 && (
        <EmptyState
          action={
            <Button variant="secondary" onClick={p.onWriteDirect}>
              Tulis langsung
            </Button>
          }
        >
          Belum ada tulisan di Studio yang bisa dipilih.
        </EmptyState>
      )}

      {p.status === "ready" && p.docs.length > 0 && (
        <>
          <div role="radiogroup" aria-label="Dokumen Studio" className="border-t border-line">
            {p.docs.map((doc) => (
              <div key={doc.id} className="border-b border-line py-4">
                <RadioChoice
                  name="source-doc"
                  checked={p.selectedId === doc.id}
                  onChange={() => p.onSelect(doc.id)}
                  label={<b className="font-medium">{doc.title.trim() || "Tanpa judul"}</b>}
                  hint={`${doc.wordCount.toLocaleString("id-ID")} kata · diubah ${formatChanged(doc.updatedAt, p.now)}`}
                />
              </div>
            ))}
          </div>
          <div>
            <Button variant="secondary" disabled={p.selectedId === null} onClick={p.onChoose}>
              Pilih bagian dari dokumen ini
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

type BlocksProps = {
  docTitle: string;
  blocks: PostBlock[];
  chosen: number[];
  onToggle: (index: number) => void;
  onChangeDoc: () => void;
};

/** Step two: tick the parts to share. What is not ticked stays private (STD-10). */
export function BlockChoices({ docTitle, blocks, chosen, onToggle, onChangeDoc }: BlocksProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <Lock size={16} aria-hidden className="shrink-0 text-ink-muted" />
        <b className="min-w-0 truncate font-medium">{docTitle}</b>
        <Button variant="text" size="sm" onClick={onChangeDoc} className="ml-auto shrink-0">
          Ganti dokumen
        </Button>
      </div>
      <p className="my-3 text-sm text-ink-muted">
        Ketuk bagian yang ingin kamu bagikan. Bagian yang tidak dipilih tetap pribadi.
      </p>
      {blocks.length === 0 ? (
        <p className="border-t border-line py-6 text-sm text-ink-muted">
          Dokumen ini belum ada isinya yang bisa dipilih.
        </p>
      ) : (
        <div role="group" aria-label="Bagian dokumen" className="border-t border-line">
          {blocks.map((block, i) => {
            const on = chosen.includes(i);
            return (
              <label
                key={i}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border-b border-line py-3.5 pr-3 pl-2",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                  on && "bg-subtle",
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(i)}
                  aria-label={`${on ? "Dipilih" : "Tidak dipilih"}, ${countWords(block.text)} kata`}
                  className="sr-only"
                />
                <CheckMark checked={on} />
                <p
                  className={cn(
                    "min-w-0 font-serif text-base leading-[26px] wrap-anywhere whitespace-pre-line text-ink-read",
                    block.type === "quote" && "border-l-2 border-line-strong pl-3 italic",
                    block.type === "heading" && "font-semibold",
                  )}
                >
                  {block.text}
                </p>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
