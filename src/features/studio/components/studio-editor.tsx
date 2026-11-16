"use client";

import type { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { postFromDocumentHref, STUDIO_HREF } from "@/features/app-shell/nav";
import { cn } from "@/lib/cn";
import { paragraphsOf } from "../diff-paragraphs";
import { sameStats, type EditorStats } from "../editor-stats";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useStudioDocument, type LoadState } from "../hooks/use-studio-document";
import { studioStore as store } from "../storage/store";
import { useDailyTarget } from "../hooks/use-daily-target";
import { useEditorMenu } from "../hooks/use-editor-menu";
import { ConflictDialog, type ConflictVersion } from "./conflict-dialog";
import { EditorBar } from "./editor-bar";
import { EditorCanvas } from "./editor-canvas";
import { EditorError, EditorLoading, EditorMissing } from "./editor-states";
import { FocusHud } from "./focus-hud";
import { FormatBar } from "./format-bar";
import { HelpDrawer } from "./help-drawer";
import { SendToProjectDialog } from "./send-to-project-dialog";
import { ShareDialog } from "./share-dialog";

const FALLBACK_TITLE: Record<LoadState, string> = {
  loading: "",
  ready: "",
  error: "Dokumen tidak terbuka",
  missing: "Dokumen tidak ditemukan",
};

function NotReady({ load, onRetry }: { load: LoadState; onRetry: () => void }) {
  if (load === "error") return <EditorError onRetry={onRetry} backHref={STUDIO_HREF} />;
  if (load === "missing") return <EditorMissing backHref={STUDIO_HREF} />;
  return <EditorLoading />;
}

/**
 * Studio editor screen. Documents live on this device for now (step 3a/3b); the same
 * `useStudioDocument` contract will be backed by Supabase in 3c.
 */
export function StudioEditor({ documentId }: { documentId: string }) {
  const doc = useStudioDocument(documentId, store);
  const online = useOnlineStatus();
  const target = useDailyTarget();
  const toast = useToast();
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [dialog, setDialog] = useState<"share" | "send" | null>(null);
  const [stats, setStats] = useState<EditorStats | null>(null);
  const [selection, setSelection] = useState<EditorStats | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const router = useRouter();

  // Equal values keep the previous object, so a cursor move does not re-render the editor screen.
  const onStatsChange = useCallback(
    (next: EditorStats) => setStats((prev) => (sameStats(prev, next) ? prev : next)),
    [],
  );
  const onSelectionStatsChange = useCallback(
    (next: EditorStats | null) => setSelection((prev) => (sameStats(prev, next) ? prev : next)),
    [],
  );

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

  const isEmpty = doc.title.trim() === "" && doc.words === 0;
  const ready = doc.load === "ready";
  const { saveNow, getId } = doc;

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const openSend = useCallback(() => setDialog("send"), []);

  const share = useCallback(async () => {
    if (!(await saveNow())) return false;
    router.push(postFromDocumentHref(getId()));
    // This editor stays mounted in the background; coming back must not reopen the dialog.
    setDialog(null);
    return true;
  }, [saveNow, getId, router]);

  // Leaving writes out what was typed first; if the device refuses, stay so nothing is lost.
  const goBack = useCallback(async () => {
    if (await saveNow()) {
      router.push(STUDIO_HREF);
      return;
    }
    toast({
      message: "Tulisanmu belum tersimpan di perangkat ini, jadi belum bisa ditutup. Coba lagi.",
      tone: "error",
    });
  }, [saveNow, router, toast]);

  // Reversible: the document keeps its text in Sampah, and "Urungkan" opens it again.
  const moveToTrash = useCallback(async () => {
    const id = getId();
    const failed = () =>
      toast({ message: "Dokumen belum bisa dipindah. Coba lagi.", tone: "error" });
    if (!(await saveNow())) return failed();
    try {
      if (!(await store.updateMeta(id, { deletedAt: Date.now() }))) return failed();
    } catch {
      return failed();
    }
    const undo = async () => {
      try {
        if (!(await store.updateMeta(id, { deletedAt: null }))) throw new Error("not found");
        router.push(`/studio/${id}`);
      } catch {
        toast({
          message: "Dokumen belum bisa dipulihkan. Buka Sampah untuk mencoba lagi.",
          tone: "error",
        });
      }
    };
    toast({
      message: "Dokumen dipindah ke Sampah.",
      action: { label: "Urungkan", onSelect: () => void undo() },
    });
    router.push(STUDIO_HREF);
  }, [saveNow, getId, router, toast]);

  const menuItems = useEditorMenu({
    canTrash: ready && !isEmpty,
    onHelp: openHelp,
    onFocus: enterFocus,
    onSend: openSend,
    onTrash: () => void moveToTrash(),
  });

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

  const body = ready ? (
    <EditorCanvas
      key={doc.editorKey}
      initialTitle={doc.initial.title}
      initialContent={doc.initial.content}
      onTitleChange={doc.setTitle}
      onContentChange={doc.onContentChange}
      onStatsChange={onStatsChange}
      onSelectionStatsChange={onSelectionStatsChange}
      onEditorChange={setEditor}
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
          stats={stats}
          selection={selection}
          status={doc.status}
          savedAt={doc.savedAt}
          offline={!online}
          progress={doc.progress}
          target={target}
          helpOpen={helpOpen}
          empty={isEmpty}
          ready={ready}
          fallbackTitle={FALLBACK_TITLE[doc.load]}
          menuItems={menuItems}
          onBack={() => void goBack()}
          onShare={() => setDialog("share")}
          onToggleHelp={() => setHelpOpen((v) => !v)}
          onFocusMode={enterFocus}
        />
      )}
      {!focusMode && editor && <FormatBar editor={editor} />}

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
          target={target}
          onExit={() => setFocusMode(false)}
        />
      )}
      <HelpDrawer open={helpOpen && !focusMode} onClose={() => setHelpOpen(false)} />
      <ShareDialog
        open={dialog === "share"}
        onClose={() => setDialog(null)}
        documentTitle={doc.title}
        onContinue={share}
      />
      <SendToProjectDialog open={dialog === "send"} onClose={() => setDialog(null)} />

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
