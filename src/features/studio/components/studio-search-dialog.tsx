"use client";

import { FileText, FolderSimple } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { readViewerNow } from "@/lib/viewer";
import {
  currentSearchHref,
  studioSearchResults,
  type StudioSearchResult,
} from "../document-search";
import { useStudioSearchLibrary } from "../hooks/use-studio-search-library";
import type { DocumentStore } from "../storage/document-store";
import { studioStore } from "../storage/store";

const PAGE_SIZE = 20;

export function StudioSearchDialog({
  onClose,
  beforeNavigate,
  store = studioStore,
}: {
  onClose: () => void;
  beforeNavigate?: () => Promise<boolean>;
  store?: Pick<DocumentStore, "listSummaries" | "listFolders" | "get">;
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const activation = useRef<AbortController | null>(null);
  const id = useId();
  const router = useRouter();
  const t = useT().studioSearch;
  const locale = useLocale();
  const { library, reload } = useStudioSearchLibrary(store);
  const results = useMemo(
    () =>
      library.status === "ready"
        ? studioSearchResults(library.docs, library.folders, query, locale)
        : [],
    [library, query, locale],
  );
  const visibleCount = Math.min(results.length, limit);
  const selectedIndex = Math.min(index, visibleCount - 1);

  useEffect(() => () => activation.current?.abort(), []);

  function dismiss() {
    activation.current?.abort();
    onClose();
  }

  async function choose(result: StudioSearchResult) {
    if (activation.current) return;
    const task = new AbortController();
    activation.current = task;
    setBusy(true);
    setFailure("");
    try {
      if (beforeNavigate && !(await beforeNavigate())) {
        if (!task.signal.aborted) dismiss();
        return;
      }
      if (task.signal.aborted) return;
      const href = await currentSearchHref(store, result);
      if (task.signal.aborted) return;
      if (readViewerNow().viewer === "tamu") {
        dismiss();
        return;
      }
      if (!href) {
        setFailure(t.unavailable);
        reload();
        input.current?.focus();
        return;
      }

      // Commit the dialog removal before changing routes: this page can stay cached by Next.
      flushSync(onClose);
      router.push(href);
    } catch {
      if (!task.signal.aborted) {
        setFailure(t.openFailed);
        input.current?.focus();
      }
    } finally {
      activation.current = null;
      if (!task.signal.aborted) setBusy(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismiss();
      return;
    }
    if (busy || visibleCount === 0) return;
    if (event.key === "Enter") {
      event.preventDefault();
      void choose(results[selectedIndex]);
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = (selectedIndex + step + visibleCount) % visibleCount;
      setIndex(next);
      document.getElementById(`${id}-option-${next}`)?.scrollIntoView?.({ block: "nearest" });
    }
  }

  function renderResults() {
    if (library.status === "error") {
      return (
        <ErrorBanner
          action={
            <RetryButton
              onClick={() => {
                input.current?.focus();
                reload();
              }}
            />
          }
        >
          {t.libraryFailed}
        </ErrorBanner>
      );
    }
    if (!query.trim()) return <p className="text-sm text-ink-muted">{t.hint}</p>;
    if (library.status === "loading") {
      return (
        <div
          role="status"
          aria-label={t.loadingResults}
          className="grid animate-[rm-appear_0s_300ms_forwards] gap-3 opacity-0"
        >
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      );
    }
    if (visibleCount === 0) {
      return (
        <EmptyState className="py-3">
          <span role="status">{t.noMatch}</span>
        </EmptyState>
      );
    }
    return (
      <div className="grid min-w-0 gap-2">
        <p role="status" className="sr-only">
          {format(t.count, { count: String(results.length) })}
        </p>
        <ul
          id={`${id}-results`}
          role="listbox"
          aria-label={t.resultsLabel}
          className="max-h-[min(36dvh,20rem)] overflow-y-auto overscroll-contain"
        >
          {results.slice(0, limit).map((result, i) => {
            const Icon = result.kind === "document" ? FileText : FolderSimple;
            return (
              <li
                key={`${result.kind}:${result.id}`}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === selectedIndex}
                aria-disabled={busy || undefined}
                className={cn(
                  "grid min-h-11 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-line px-2 py-2 hover:bg-subtle",
                  i === selectedIndex && "bg-subtle",
                )}
                onClick={() => void choose(result)}
              >
                <Icon className="text-ink-muted" size={20} aria-hidden />
                <span className="grid min-w-0 [overflow-wrap:anywhere]">
                  <span className="text-sm font-medium">{result.name}</span>
                  <span className="text-xs text-ink-muted">
                    {result.kind === "document" ? t.document : t.folder}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        {visibleCount < results.length && (
          <Button
            variant="text"
            size="sm"
            className="justify-self-start"
            onClick={() => {
              setLimit((value) => value + PAGE_SIZE);
              setIndex(visibleCount);
              input.current?.focus();
              requestAnimationFrame(() =>
                document
                  .getElementById(`${id}-option-${visibleCount}`)
                  ?.scrollIntoView?.({ block: "nearest" }),
              );
            }}
          >
            {t.showMore}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Dialog
      open
      onClose={dismiss}
      title={t.title}
      actions={
        <Button variant="secondary" onClick={dismiss}>
          {t.close}
        </Button>
      }
    >
      <Field id={`${id}-input`} label={t.keyword}>
        <Input
          ref={input}
          id={`${id}-input`}
          type="text"
          enterKeyHint="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visibleCount > 0}
          aria-controls={visibleCount > 0 ? `${id}-results` : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `${id}-option-${selectedIndex}` : undefined}
          autoComplete="off"
          readOnly={busy}
          value={query}
          onKeyDown={onKeyDown}
          onChange={(event) => {
            setQuery(event.target.value);
            setIndex(0);
            setLimit(PAGE_SIZE);
            setFailure("");
          }}
        />
      </Field>
      {busy && (
        <p role="status" className="text-sm text-ink-muted">
          {t.opening}
        </p>
      )}
      {failure && <ErrorBanner>{failure}</ErrorBanner>}
      {renderResults()}
    </Dialog>
  );
}
