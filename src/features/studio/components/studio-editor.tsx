"use client";

import {
  ArrowsOut,
  DownloadSimple,
  Lightbulb,
  PaperPlaneTilt,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { paragraphsOf } from "../diff-paragraphs";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useStudioDocument, type LoadState } from "../hooks/use-studio-document";
import { createIndexedDbStore } from "../storage/indexeddb-store";
import { ConflictDialog, type ConflictVersion } from "./conflict-dialog";
import { EditorBar } from "./editor-bar";
import { EditorCanvas } from "./editor-canvas";
import { EditorError, EditorLoading, EditorMissing } from "./editor-states";
import { FocusHud } from "./focus-hud";
import { HelpDrawer } from "./help-drawer";
import type { MenuEntry } from "@/components/ui/menu";

const store = createIndexedDbStore();
/** [konfirmasi] Back-link target until the Studio document list exists (step 4). */
const STUDIO_HOME = "/";

const FALLBACK_TITLE: Record<LoadState, string> = {
  loading: "",
  ready: "",
  error: "Dokumen tidak terbuka",
  missing: "Dokumen tidak ditemukan",
};

function NotReady({ load, onRetry }: { load: LoadState; onRetry: () => void }) {
  if (load === "error") return <EditorError onRetry={onRetry} backHref={STUDIO_HOME} />;
  if (load === "missing") return <EditorMissing backHref={STUDIO_HOME} />;
  return <EditorLoading />;
}

/**
 * Studio editor screen. Documents live on this device for now (step 3a/3b); the same
 * `useStudioDocument` contract will be backed by Supabase in 3c.
 */
export function StudioEditor({ documentId }: { documentId: string }) {
  const doc = useStudioDocument(documentId, store);
  const online = useOnlineStatus();
  const toast = useToast();
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const enterFocus = useCallback(() => {
    setHelpOpen(false);
    setFocusMode(true);
  }, []);

  // Escape leaves focus mode. A keyboard exit is instant, with no animation.
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  const menuItems = useMemo<MenuEntry[]>(
    () => [
      {
        id: "help",
        label: "Bantuan menulis",
        icon: <Lightbulb />,
        mobileOnly: true,
        onSelect: () => setHelpOpen(true),
      },
      {
        id: "focus",
        label: "Mode fokus",
        icon: <ArrowsOut />,
        mobileOnly: true,
        onSelect: enterFocus,
      },
      { id: "sep-mobile", type: "separator", mobileOnly: true },
      {
        id: "send",
        label: "Kirim ke proyek",
        icon: <PaperPlaneTilt />,
        hint: "Segera",
        disabled: true,
        onSelect: () => {},
      },
      {
        id: "export",
        label: "Ekspor",
        icon: <DownloadSimple />,
        hint: "Segera",
        disabled: true,
        onSelect: () => {},
      },
      { id: "sep", type: "separator" },
      {
        // Reversible, so ink and not red (DESIGN.md 4.1). Needs the Sampah list (step 4).
        id: "trash",
        label: "Pindah ke sampah",
        icon: <Trash />,
        hint: "Segera",
        disabled: true,
        onSelect: () => {},
      },
    ],
    [enterFocus],
  );

  const versions = useMemo<{ local: ConflictVersion; remote: ConflictVersion } | null>(() => {
    if (!doc.conflict) return null;
    const { local, remote } = doc.conflict;
    return {
      local: {
        title: local.title,
        savedAt: new Date(),
        words: local.wordCount,
        paragraphs: paragraphsOf(local.content),
      },
      remote: {
        title: remote.title,
        savedAt: new Date(remote.updatedAt),
        words: remote.wordCount,
        paragraphs: paragraphsOf(remote.content),
      },
    };
  }, [doc.conflict]);

  const isEmpty = doc.title.trim() === "" && doc.words === 0;
  const ready = doc.load === "ready";
  const body = ready ? (
    <EditorCanvas
      key={doc.editorKey}
      initialTitle={doc.initial.title}
      initialContent={doc.initial.content}
      onTitleChange={doc.setTitle}
      onContentChange={doc.onContentChange}
      autoFocusTitle={documentId === "baru"}
    />
  ) : (
    <NotReady load={doc.load} onRetry={doc.reload} />
  );

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      {!focusMode && (
        <EditorBar
          title={doc.title}
          words={doc.words}
          status={doc.status}
          savedAt={doc.savedAt}
          offline={!online}
          progress={doc.progress}
          helpOpen={helpOpen}
          empty={isEmpty}
          ready={ready}
          fallbackTitle={FALLBACK_TITLE[doc.load]}
          menuItems={menuItems}
          onToggleHelp={() => setHelpOpen((v) => !v)}
          onFocusMode={enterFocus}
        />
      )}

      <main
        aria-label="Kanvas menulis"
        className={cn(
          "min-h-0 flex-1 overflow-auto px-4 pt-8 pb-32 md:px-12 md:pt-24 md:pb-40",
          "transition-[padding] duration-200 ease-out",
          helpOpen && !focusMode && "md:pr-100",
          focusMode && "md:pt-36",
        )}
      >
        {body}
      </main>

      {ready && focusMode && (
        <FocusHud
          status={isEmpty ? "draft" : doc.status}
          savedAt={doc.savedAt}
          words={doc.words}
          progress={doc.progress}
          onExit={() => setFocusMode(false)}
        />
      )}
      <HelpDrawer open={helpOpen && !focusMode} onClose={() => setHelpOpen(false)} />

      {versions && (
        <ConflictDialog
          open
          local={versions.local}
          remote={versions.remote}
          onResolve={async (choice) => {
            await doc.resolveConflict(choice);
            if (choice === "both") {
              toast({ message: "Versi dari tempat lain disimpan sebagai dokumen baru." });
            }
          }}
        />
      )}
    </div>
  );
}
