"use client";

import { FolderSimplePlus } from "@phosphor-icons/react/dist/ssr";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { useSharedDocumentIds } from "@/features/community/hooks/use-shared-documents";
import { useSubmittedDocumentIds } from "@/features/projects/hooks/use-submitted-documents";
import { postStore } from "@/features/community/storage/store";
import { hasDocumentFilters } from "../../document-classification";
import { isActiveDocument } from "../../document-archive";
import { documentTagOptions, listEntries } from "../../documents";
import { useDocumentSummaryList } from "../../hooks/use-document-list";
import { useDocumentListSearch } from "../../hooks/use-document-search";
import type { StudioDocument } from "../../storage/document-store";
import { studioStore } from "../../storage/store";
import { StudioTabs } from "../studio-tabs";
import { ArchiveList } from "./archive-list";
import { DocumentFilterFields, useDocumentFilters } from "./document-filters";
import { DocumentSearchField } from "./document-search-field";
import { LiveList, TrashList } from "./document-lists";
import type { Pending } from "./pending";
import { PendingDialogs } from "./pending-dialogs";
import { TodayLine } from "./today-line";

type ArchiveAction = "archive" | "restore" | "duplicate";
type ListNotice = { text: string; copyId?: string; failed?: boolean };

const archiveSuccess = {
  archive: "Dokumen dipindah ke Arsip.",
  restore: "Dokumen dipulihkan.",
  duplicate: "Salinan dokumen dibuat.",
};

function ListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat dokumen"
      className="animate-[rm-appear_0s_300ms_forwards] opacity-0"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-3 border-b border-line py-5"
        >
          <Skeleton className="size-5" />
          <div className="grid gap-2.5">
            <Skeleton className="h-4" style={{ width: `${70 - i * 6}%` }} />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListFeedback({ status, onRetry }: { status: "loading" | "error"; onRetry: () => void }) {
  if (status === "loading") return <ListSkeleton />;
  return (
    <div className="mt-6 grid gap-3">
      <ErrorBanner action={<RetryButton onClick={onRetry} />}>
        Daftar dokumen gagal dimuat. Isi dokumenmu tidak berubah; yang gagal hanya daftarnya.
      </ErrorBanner>
      <p className="text-xs text-ink-muted">Progres hari ini dan tab Streak tetap bisa dibuka.</p>
    </div>
  );
}

/**
 * Studio, tab Dokumen (DESIGN.md 6.4): a plain list, not cards. Documents and folders from this
 * device; Sampah keeps trashed documents so they can be restored.
 */
export function DocumentsView() {
  return (
    <div className="max-w-182">
      <h1 className="mb-3 heading-lg max-md:hidden">Studio</h1>
      <StudioTabs />
      <TodayLine />
      <Suspense fallback={<ListSkeleton />}>
        <DocumentListContent />
      </Suspense>
    </div>
  );
}

/** Nothing to search yet: the box would only sit above the empty state. A typed query stays. */
export const showsSearch = (enabled: boolean, hasDocuments: boolean, query: string) =>
  enabled && (hasDocuments || query !== "");

function DocumentListContent() {
  const list = useDocumentSummaryList(studioStore);
  const sharedIds = useSharedDocumentIds(postStore);
  const submittedIds = useSubmittedDocumentIds();
  const [pending, setPending] = useState<Pending | null>(null);
  const [notice, setNotice] = useState<ListNotice | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const kindFilterRef = useRef<HTMLSelectElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const folderHeadingRef = useRef<HTMLSpanElement>(null);
  const { filters, rawTag, changeFilters, tab, requestedFolder } = useDocumentFilters();

  const activeReady = list.status === "ready" && tab === "semua";
  const folder = list.folders.find((f) => f.id === requestedFolder);
  const folderId = folder?.id ?? null;
  const search = useDocumentListSearch(list.docs, folderId, filters, activeReady);
  useEffect(() => {
    if (folderId) folderHeadingRef.current?.focus();
  }, [folderId]);

  const hasActiveDocuments = list.docs.some(isActiveDocument);
  const hasFilterOptions = hasDocumentFilters(filters) || hasActiveDocuments;

  function openFolder(id: string | null) {
    search.setQuery("");
    setNotice(null);
    changeFilters({ folder: id ?? "" }, "pushState");
    if (!id) search.inputRef.current?.focus();
  }

  function selectTab(next: string) {
    changeFilters({ tab: next === "semua" ? "" : next, folder: "" });
    search.setQuery("");
    setNotice(null);
  }

  function focusNotice() {
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  function classified(doc: StudioDocument) {
    setNotice({ text: "Jenis dan tag disimpan." });
    if (listEntries([doc], [], folderId, filters, search.matches).length === 0) {
      focusNotice();
    }
  }

  async function runArchiveAction(action: ArchiveAction, id: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const doc = await (action === "duplicate"
        ? list.duplicateActive(id)
        : list.setArchived(id, action === "archive"));
      setNotice(
        doc
          ? { text: archiveSuccess[action], copyId: action === "duplicate" ? doc.id : undefined }
          : { text: "Status dokumen sudah berubah. Periksa daftar dan coba lagi.", failed: true },
      );
    } catch {
      setNotice({ text: "Perubahan belum tersimpan. Coba lagi.", failed: true });
    } finally {
      busyRef.current = false;
      setBusy(false);
      focusNotice();
    }
  }

  function renderList() {
    if (list.status !== "ready") return <ListFeedback status={list.status} onRetry={list.reload} />;
    if (tab === "sampah") return <TrashList list={list} onPending={setPending} />;
    if (tab === "arsip") {
      return (
        <ArchiveList
          list={list}
          busy={busy}
          onRestore={(id) => void runArchiveAction("restore", id)}
          onShowAll={() => {
            selectTab("semua");
            requestAnimationFrame(() =>
              tabBarRef.current?.querySelector<HTMLElement>("#tab-semua")?.focus(),
            );
          }}
        />
      );
    }
    if (search.state.status === "loading") return <ListSkeleton />;
    if (search.state.status === "error") {
      return (
        <ErrorBanner className="mt-4" action={<RetryButton onClick={search.state.retry} />}>
          Pencarian dokumen gagal. Coba lagi.
        </ErrorBanner>
      );
    }
    return (
      <LiveList
        list={list}
        folderId={folderId}
        folderName={folder?.name ?? null}
        onOpenFolder={openFolder}
        onPending={(action) => {
          setNotice(null);
          setPending(action);
        }}
        onArchiveAction={(action, id) => void runArchiveAction(action, id)}
        archiveBusy={busy}
        sharedIds={sharedIds}
        submittedIds={submittedIds}
        filters={filters}
        searchMatches={search.matches}
        onClearSearch={search.clear}
        onClearFilters={() => {
          changeFilters({ jenis: "", tag: "" });
          const target = hasActiveDocuments
            ? kindFilterRef.current
            : tabBarRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
          target?.focus();
        }}
      />
    );
  }

  return (
    <>
      <div
        ref={tabBarRef}
        className="mt-6 flex items-center gap-4 shadow-[inset_0_-1px_0_var(--line)]"
      >
        <Tabs
          label="Daftar"
          value={tab}
          onValueChange={selectTab}
          className="min-w-0 flex-1 shadow-none"
          items={[
            { id: "semua", label: "Semua" },
            { id: "arsip", label: "Arsip" },
            { id: "sampah", label: "Sampah" },
          ]}
        />
        {activeReady && (
          <div className="flex items-center gap-2 max-md:hidden">
            <Button
              variant="text"
              size="sm"
              className="text-ink"
              onClick={() => setPending({ kind: "newFolder" })}
            >
              <FolderSimplePlus size={16} aria-hidden />
              Folder baru
            </Button>
            <ButtonLink href="/studio/baru" size="sm">
              Dokumen baru
            </ButtonLink>
          </div>
        )}
      </div>

      {folder && (
        <p className="mt-4 text-sm [overflow-wrap:anywhere]">
          <button
            type="button"
            className="cursor-pointer text-ink-muted hover:text-ink"
            onClick={() => openFolder(null)}
          >
            Semua dokumen
          </button>
          <span className="text-ink-muted"> / </span>
          <span ref={folderHeadingRef} tabIndex={-1} className="font-medium">
            {folder.name}
          </span>
        </p>
      )}

      {showsSearch(search.enabled, hasActiveDocuments, search.query) && (
        <DocumentSearchField
          value={search.query}
          inputRef={search.inputRef}
          onChange={search.setQuery}
          onClear={search.clear}
        />
      )}

      {activeReady && hasFilterOptions && (
        <DocumentFilterFields
          filters={filters}
          rawTag={rawTag}
          tags={documentTagOptions(list.docs, folderId)}
          kindRef={kindFilterRef}
          onChange={changeFilters}
        />
      )}
      <p
        role="status"
        tabIndex={-1}
        ref={statusRef}
        className={
          notice ? `mt-3 text-sm ${notice.failed ? "text-danger" : "text-ink"}` : "sr-only"
        }
      >
        {notice?.text}
      </p>
      {notice?.copyId && (
        <ButtonLink href={`/studio/${notice.copyId}`} variant="text" size="sm" className="px-0">
          Buka salinan
        </ButtonLink>
      )}

      {renderList()}

      <PendingDialogs
        pending={pending}
        list={list}
        onClose={() => setPending(null)}
        onClassified={classified}
      />
    </>
  );
}
