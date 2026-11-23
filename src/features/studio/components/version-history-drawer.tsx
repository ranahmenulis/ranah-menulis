"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import type { Locale } from "@/lib/i18n/config";
import { formatClock } from "../count-words";
import { paragraphsOf } from "../diff-paragraphs";
import { useVersions } from "../hooks/use-versions";
import { formatChanged } from "../relative-time";
import type { DocumentStore } from "../storage/document-store";
import { deltaLabel, type DocumentVersion } from "../versions";

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

/** "40 menit lalu", "hari ini 08.40", or "16 Nov 21.40": the clock is added once it is not today. */
function whenLabel(savedAt: number, now: number, locale: Locale): string {
  const label = formatChanged(savedAt, now, locale);
  const sameDay = new Date(savedAt).toDateString() === new Date(now).toDateString();
  return sameDay ? label : `${label} ${formatClock(new Date(savedAt), locale)}`;
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
  const t = useT().studioEditor;
  const locale = useLocale();
  const fmt = useFormat();
  return (
    <ul
      aria-label={t.versions.list}
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
              selected === v.id ? "bg-accent-subtle text-accent-ink" : "hover:bg-subtle",
            )}
          >
            <span className="font-medium">{whenLabel(v.savedAt, now, locale)}</span>
            <span className="text-xs text-ink-muted tabular-nums">
              {format(t.versions.wordsLine, {
                n: fmt.number(v.wordCount),
                delta: deltaLabel(v.wordCount, currentWords, locale),
              })}
            </span>
            <span className="text-xs text-ink-muted">{t.versions.reasons[v.reason]}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Preview({ version, onAsk }: { version: DocumentVersion; onAsk: () => void }) {
  const t = useT().studioEditor;
  const paragraphs = paragraphsOf(version.content);
  return (
    <section aria-label={t.versions.content} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-4 py-4 md:px-5">
        <p className="mb-3 font-serif text-lg leading-6 font-semibold [overflow-wrap:anywhere]">
          {version.title.trim() || t.versions.untitled}
        </p>
        {paragraphs.length === 0 ? (
          <p className="text-sm text-ink-muted">{t.versions.empty}</p>
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
          {t.versions.restoreThis}
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
  const t = useT().studioEditor;
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
      <Drawer open={open} onClose={onClose} title={t.versions.title} closeLabel={t.versions.close}>
        {state.status === "loading" && (
          <div
            role="status"
            aria-label={t.versions.loading}
            className="grid gap-3 px-4 py-4 md:px-5"
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        )}
        {state.status === "error" && (
          <div className="p-4 md:p-5">
            <ErrorBanner action={<RetryButton onClick={reload} />}>
              {t.versions.loadError}
            </ErrorBanner>
          </div>
        )}
        {state.status === "ready" && versions.length === 0 && (
          <div className="px-4 md:px-5">
            <EmptyState>{t.versions.none}</EmptyState>
            <p className="text-sm text-ink-muted">{t.versions.noneHint}</p>
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
              <p className="px-4 py-4 text-sm text-ink-muted md:px-5">{t.versions.pick}</p>
            )}
          </>
        )}
      </Drawer>

      <Dialog
        open={asking}
        onClose={() => !busy && setAsking(false)}
        dismissible={!busy}
        title={t.versions.askTitle}
        description={t.versions.askBody}
        actions={
          <>
            <Button variant="text" onClick={() => setAsking(false)} disabled={busy}>
              {t.versions.cancel}
            </Button>
            <Button onClick={() => void restore()} loading={busy}>
              {t.versions.restore}
            </Button>
          </>
        }
      >
        {failed && <ErrorBanner>{t.versions.restoreFailed}</ErrorBanner>}
      </Dialog>
    </>
  );
}
