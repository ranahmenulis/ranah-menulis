"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { formatClock } from "../count-words";
import { paragraphsOf } from "../diff-paragraphs";
import { useVersions } from "../hooks/use-versions";
import { formatChanged } from "../relative-time";
import type { DocumentStore } from "../storage/document-store";
import { deltaLabel, REASON_LABEL, type DocumentVersion } from "../versions";

type Props = {
  open: boolean;
  onClose: () => void;
  store: DocumentStore;
  /** "" for a draft that is not stored yet. */
  docId: string;
  /** Words in the editor now, to show how far each version is from it. */
  currentWords: number;
  /** Puts the version back. Resolves false when it could not be done. */
  onRestore: (version: DocumentVersion) => Promise<boolean>;
};

const number = new Intl.NumberFormat("id-ID");

/** "40 menit lalu", "hari ini 08.40", or "16 Nov 21.40": the clock is added once it is not today. */
function whenLabel(savedAt: number, now: number): string {
  const label = formatChanged(savedAt, now);
  const sameDay = new Date(savedAt).toDateString() === new Date(now).toDateString();
  return sameDay ? label : `${label} ${formatClock(new Date(savedAt))}`;
}

function List({
  versions,
  now,
  currentWords,
  selected,
  onSelect,
}: {
  versions: DocumentVersion[];
  now: number;
  currentWords: number;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul
      aria-label="Versi tersimpan"
      className="max-h-[45%] min-h-0 shrink-0 overflow-auto border-b border-line"
    >
      {versions.map((v) => (
        <li key={v.id} className="border-t border-line first:border-t-0">
          <button
            type="button"
            aria-pressed={selected === v.id}
            onClick={() => onSelect(v.id)}
            className={cn(
              "grid w-full cursor-pointer gap-0.5 px-4 py-3 text-left text-sm md:px-5",
              selected === v.id ? "bg-subtle" : "hover:bg-subtle",
            )}
          >
            <span className="font-medium">{whenLabel(v.savedAt, now)}</span>
            <span className="text-xs text-ink-muted tabular-nums">
              {number.format(v.wordCount)} kata · {deltaLabel(v.wordCount, currentWords)}
            </span>
            <span className="text-xs text-ink-muted">{REASON_LABEL[v.reason]}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Preview({ version, onAsk }: { version: DocumentVersion; onAsk: () => void }) {
  const paragraphs = paragraphsOf(version.content);
  return (
    <section aria-label="Isi versi" className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-4 py-4 md:px-5">
        <p className="mb-3 font-serif text-lg leading-6 font-semibold [overflow-wrap:anywhere]">
          {version.title.trim() || "Tanpa judul"}
        </p>
        {paragraphs.length === 0 ? (
          <p className="text-sm text-ink-muted">Versi ini belum berisi teks.</p>
        ) : (
          paragraphs.map((text, i) => (
            <p
              key={i}
              className="mb-3 font-serif text-base leading-[26px] [overflow-wrap:anywhere]"
            >
              {text}
            </p>
          ))
        )}
      </div>
      <div className="border-t border-line px-4 py-3 md:px-5">
        <Button variant="secondary" onClick={onAsk}>
          Pulihkan versi ini
        </Button>
      </div>
    </section>
  );
}

/**
 * Version history (STD-12): the versions kept for 3 days, newest first, a read-only preview of the
 * chosen one, and "Pulihkan". Restoring keeps what is written now as a version first, so it can be
 * undone. Side by side comparison is a later step.
 */
export function VersionHistoryDrawer({
  open,
  onClose,
  store,
  docId,
  currentWords,
  onRestore,
}: Props) {
  const { state, reload } = useVersions(store, docId, open);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const versions = state.status === "ready" ? state.versions : [];
  const selected = versions.find((v) => v.id === selectedId) ?? null;

  async function restore() {
    if (!selected) return;
    setBusy(true);
    setFailed(false);
    const ok = await onRestore(selected).catch(() => false);
    setBusy(false);
    if (ok) {
      setAsking(false);
      setSelectedId(null);
    } else {
      setFailed(true);
    }
  }

  return (
    <>
      <Drawer open={open} onClose={onClose} title="Riwayat versi" closeLabel="Tutup riwayat versi">
        {state.status === "loading" && (
          <div role="status" aria-label="Memuat versi" className="grid gap-3 px-4 py-4 md:px-5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        )}
        {state.status === "error" && (
          <div className="p-4 md:p-5">
            <ErrorBanner action={<RetryButton onClick={reload} />}>
              Riwayat versi gagal dimuat. Tulisanmu tidak berubah.
            </ErrorBanner>
          </div>
        )}
        {state.status === "ready" && versions.length === 0 && (
          <div className="px-4 md:px-5">
            <EmptyState>Belum ada versi tersimpan.</EmptyState>
            <p className="text-sm text-ink-muted">
              Versi muncul sendiri saat kamu menulis dan disimpan selama 3 hari.
            </p>
          </div>
        )}
        {state.status === "ready" && versions.length > 0 && (
          <>
            <List
              versions={versions}
              now={state.loadedAt}
              currentWords={currentWords}
              selected={selectedId}
              onSelect={setSelectedId}
            />
            {selected ? (
              <Preview version={selected} onAsk={() => setAsking(true)} />
            ) : (
              <p className="px-4 py-4 text-sm text-ink-muted md:px-5">
                Pilih satu versi untuk melihat isinya. Versi disimpan 3 hari.
              </p>
            )}
          </>
        )}
      </Drawer>

      <Dialog
        open={asking}
        onClose={() => !busy && setAsking(false)}
        dismissible={!busy}
        title="Pulihkan versi ini?"
        description="Tulisanmu sekarang disimpan dulu sebagai versi, jadi kamu bisa kembali ke sana kapan saja dalam 3 hari."
        actions={
          <>
            <Button variant="text" onClick={() => setAsking(false)} disabled={busy}>
              Batal
            </Button>
            <Button onClick={() => void restore()} loading={busy}>
              Pulihkan
            </Button>
          </>
        }
      >
        {failed && (
          <ErrorBanner>
            Versi belum bisa dipulihkan. Tulisanmu tidak berubah. Coba lagi.
          </ErrorBanner>
        )}
      </Dialog>
    </>
  );
}
