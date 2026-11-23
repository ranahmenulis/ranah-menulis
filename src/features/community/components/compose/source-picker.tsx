"use client";

import { Lock } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { CheckMark, RadioChoice } from "@/components/ui/choice";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { countWords } from "@/lib/text-stats";
import { formatChanged } from "@/features/studio/relative-time";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { cn } from "@/lib/cn";
import { useFormat } from "@/lib/i18n/use-format";
import { format, useT } from "@/lib/i18n/provider";
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
  const t = useT().compose;
  const s = t.source;
  const { locale, number } = useFormat();
  return (
    <div className="grid gap-4">
      <h2 className="text-base font-semibold">{s.chooseTitle}</h2>
      <p className="-mt-2 text-sm text-ink-muted">{s.chooseBody}</p>
      {p.error && <ErrorBanner>{p.error}</ErrorBanner>}

      {p.status === "loading" && (
        <div
          role="status"
          aria-label={s.loading}
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
        <ErrorBanner action={<RetryButton onClick={p.onRetry} />}>{s.loadError}</ErrorBanner>
      )}

      {p.status === "ready" && p.docs.length === 0 && (
        <EmptyState
          action={
            <Button variant="secondary" onClick={p.onWriteDirect}>
              {s.writeDirect}
            </Button>
          }
        >
          {s.empty}
        </EmptyState>
      )}

      {p.status === "ready" && p.docs.length > 0 && (
        <>
          <div role="radiogroup" aria-label={s.groupLabel} className="border-t border-line">
            {p.docs.map((doc) => (
              <div key={doc.id} className="border-b border-line py-4">
                <RadioChoice
                  name="source-doc"
                  checked={p.selectedId === doc.id}
                  onChange={() => p.onSelect(doc.id)}
                  label={<b className="font-medium">{doc.title.trim() || t.form.untitled}</b>}
                  hint={format(s.meta, {
                    words: number(doc.wordCount),
                    changed: formatChanged(doc.updatedAt, p.now, locale),
                  })}
                />
              </div>
            ))}
          </div>
          <div>
            <Button variant="secondary" disabled={p.selectedId === null} onClick={p.onChoose}>
              {s.pickBlocks}
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
  const s = useT().compose.source;
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <Lock size={16} aria-hidden className="shrink-0 text-ink-muted" />
        <b className="min-w-0 truncate font-medium">{docTitle}</b>
        <Button variant="text" size="sm" onClick={onChangeDoc} className="ml-auto shrink-0">
          {s.changeDoc}
        </Button>
      </div>
      <p className="my-3 text-sm text-ink-muted">{s.tapBlocks}</p>
      {blocks.length === 0 ? (
        <p className="border-t border-line py-6 text-sm text-ink-muted">{s.noBlocks}</p>
      ) : (
        <div
          role="group"
          aria-label={s.partsLabel}
          className="grid gap-1 border-t border-line pt-2"
        >
          {blocks.map((block, i) => {
            const on = chosen.includes(i);
            return (
              <label
                key={i}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl py-3.5 pr-3 pl-2 transition-colors duration-150 hover:bg-subtle",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                  on && "bg-accent-subtle hover:bg-accent-subtle",
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(i)}
                  aria-label={format(s.blockAria, {
                    state: on ? s.selected : s.notSelected,
                    words: String(countWords(block.text)),
                  })}
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
