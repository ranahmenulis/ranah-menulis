"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ErrorBanner, RetryButton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n/provider";
import { useSharedDocumentIds } from "@/features/community/hooks/use-shared-documents";
import { useSubmittedDocumentIds } from "@/features/projects/hooks/use-submitted-documents";
import { postStore } from "@/features/community/storage/store";
import {
  hasDocumentFilters,
  matchesDocumentFilters,
  type DocumentFilters,
} from "../../document-classification";
import { isActiveDocument } from "../../document-archive";
import { isBook } from "../../book";
import { documentTagOptions } from "../../documents";
import { useDocumentSummaryList } from "../../hooks/use-document-list";
import { useDocumentListSearch } from "../../hooks/use-document-search";
import type { StudioDocument } from "../../storage/document-store";
import { studioStore } from "../../storage/store";
import { buildWorks, searchCandidates, workMatches } from "../../works";
import { StudioTabs } from "../studio-tabs";
import { WorksList } from "../works/works-list";
import { ArchiveList } from "./archive-list";
import { DocumentFilterFields, useDocumentFilters } from "./document-filters";
import { DocumentSearchField } from "./document-search-field";
import { TrashList } from "./document-lists";
import { FolderHead } from "./folder-head";
import { ListActions } from "./list-actions";
import { ListFeedback, ListSkeleton } from "./list-feedback";
import type { Pending } from "./pending";
import { PendingDialogs } from "./pending-dialogs";
import { TodayLine } from "./today-line";

type ArchiveAction = "archive" | "restore" | "duplicate";
type ListNotice = { text: string; copyId?: string; failed?: boolean };

/**
 * Studio, tab Dokumen (DESIGN.md 6.4): a plain list, not cards. Documents and folders from this
 * device; Sampah keeps trashed documents so they can be restored.
 */
export function DocumentsView() {
  const t = useT().studioDocuments;
  return (
    <div className="max-w-260">
      <h1 className="mb-3 heading-lg max-md:hidden">{t.tabs.studio}</h1>
      <StudioTabs />
      <TodayLine />
      <Suspense fallback={<ListSkeleton />}>
        <DocumentListContent />
      </Suspense>
    </div>
  );
}

/** Whether a document whose type or tags just changed still shows under the filter and search. */
const stillListed = (
  doc: StudioDocument,
  filters: DocumentFilters,
  matches: ReadonlySet<string> | null,
) => matchesDocumentFilters(doc, filters) && (matches === null || matches.has(doc.id));

/** The card around the list: the table runs to its edges, the other lists keep its padding. */
const listCardClass = (tab: string, status: string) =>
  cn(
    "mt-4 overflow-hidden rounded-2xl border border-line bg-surface shadow-card",
    tab === "semua" && status === "ready" ? "px-0 pb-1" : "px-4 py-1 md:px-5",
  );

/** Nothing to search yet: the box would only sit above the empty state. A typed query stays. */
export const showsSearch = (enabled: boolean, hasDocuments: boolean, query: string) =>
  enabled && (hasDocuments || query !== "");

function DocumentListContent() {
  const t = useT().studioDocuments;
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
  // Only plain folders open as a list; a book opens on its own page.
  const folder = list.folders.find((f) => f.id === requestedFolder && !isBook(f));
  const folderId = folder?.id ?? null;
  const candidates = useMemo(
    () => searchCandidates(list.docs, list.folders, folderId),
    [list.docs, list.folders, folderId],
  );
  const search = useDocumentListSearch(candidates, folderId, activeReady);
  const works = useMemo(() => buildWorks(list.docs, list.folders), [list.docs, list.folders]);
  const searchMatches = useMemo(
    () => workMatches(works, search.matches, search.query),
    [works, search.matches, search.query],
  );
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
    setNotice({ text: t.list.classified });
    if (!stillListed(doc, filters, search.matches)) focusNotice();
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
          ? {
              text: t.list.archiveSuccess[action],
              copyId: action === "duplicate" ? doc.id : undefined,
            }
          : { text: t.list.statusChanged, failed: true },
      );
    } catch {
      setNotice({ text: t.list.saveFailed, failed: true });
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
          {t.list.searchFailed}
        </ErrorBanner>
      );
    }
    return (
      <WorksList
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
        searchMatches={searchMatches}
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
      <div ref={tabBarRef} className="mt-5 flex items-center gap-4">
        <Tabs
          label={t.list.tabsLabel}
          value={tab}
          onValueChange={selectTab}
          variant="pill"
          className="min-w-0 flex-1"
          items={[
            { id: "semua", label: t.list.all },
            { id: "arsip", label: t.list.archive },
            { id: "sampah", label: t.list.trash },
          ]}
        />
        {activeReady && <ListActions folderId={folderId} onPending={setPending} />}
      </div>

      {folder && (
        <FolderHead folder={folder} headingRef={folderHeadingRef} onBack={() => openFolder(null)} />
      )}

      <div className="lg:flex lg:items-end lg:gap-3 lg:[&>*]:mt-4">
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
      </div>
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
          {t.list.openCopy}
        </ButtonLink>
      )}

      <div className={listCardClass(tab, list.status)}>{renderList()}</div>

      <PendingDialogs
        pending={pending}
        list={list}
        onClose={() => setPending(null)}
        onClassified={classified}
      />
    </>
  );
}
