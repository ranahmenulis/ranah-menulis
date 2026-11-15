"use client";

import { FolderSimplePlus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { useSharedDocumentIds } from "@/features/community/hooks/use-shared-documents";
import { postStore } from "@/features/community/storage/store";
import { useDocumentList } from "../../hooks/use-document-list";
import { studioStore } from "../../storage/store";
import { StudioTabs } from "../studio-tabs";
import { LiveList, TrashList } from "./document-lists";
import type { Pending } from "./pending";
import { PendingDialogs } from "./pending-dialogs";
import { TodayLine } from "./today-line";

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

/**
 * Studio, tab Dokumen (DESIGN.md 6.4): a plain list, not cards. Documents and folders from this
 * device; Sampah keeps trashed documents so they can be restored.
 */
export function DocumentsView() {
  const list = useDocumentList(studioStore);
  const sharedIds = useSharedDocumentIds(postStore);
  const [tab, setTab] = useState("semua");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const inTrash = tab === "sampah";
  const ready = list.status === "ready";
  const folder = list.folders.find((f) => f.id === folderId) ?? null;

  return (
    <div className="max-w-182">
      <h1 className="mb-3 heading-lg max-md:hidden">Studio</h1>
      <StudioTabs />
      <TodayLine />

      <div className="mt-6 flex items-center gap-4 shadow-[inset_0_-1px_0_var(--line)]">
        <Tabs
          label="Daftar"
          value={tab}
          onValueChange={(t) => {
            setTab(t);
            setFolderId(null);
          }}
          className="min-w-0 flex-1 shadow-none"
          items={[
            { id: "semua", label: "Semua" },
            { id: "sampah", label: "Sampah" },
          ]}
        />
        {!inTrash && ready && (
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

      {folder && !inTrash && (
        <p className="mt-4 text-sm">
          <button
            type="button"
            className="cursor-pointer text-ink-muted hover:text-ink"
            onClick={() => setFolderId(null)}
          >
            Semua dokumen
          </button>
          <span className="text-ink-muted"> / </span>
          <span className="font-medium">{folder.name}</span>
        </p>
      )}

      {list.status === "loading" && <ListSkeleton />}
      {list.status === "error" && (
        <div className="mt-6 grid gap-3">
          <ErrorBanner action={<RetryButton onClick={list.reload} />}>
            Daftar dokumen gagal dimuat. Isi dokumenmu tidak berubah; yang gagal hanya daftarnya.
          </ErrorBanner>
          <p className="text-xs text-ink-muted">
            Progres hari ini dan tab Streak tetap bisa dibuka.
          </p>
        </div>
      )}
      {ready && !inTrash && (
        <LiveList
          list={list}
          folderId={folderId}
          folderName={folder?.name ?? null}
          onOpenFolder={setFolderId}
          onPending={setPending}
          sharedIds={sharedIds}
        />
      )}
      {ready && inTrash && <TrashList list={list} onPending={setPending} />}

      <PendingDialogs pending={pending} list={list} onClose={() => setPending(null)} />
    </div>
  );
}
