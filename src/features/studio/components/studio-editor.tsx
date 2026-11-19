"use client";

import type { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { postFromDocumentHref, STUDIO_HREF } from "@/features/app-shell/nav";
import { EventEditorPanel } from "@/features/community/events/components/event-editor-panel";
import { useEventSave } from "@/features/community/events/use-event-save";
import { cn } from "@/lib/cn";
import { sameStats, type EditorStats } from "../editor-stats";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useSendFromEditor } from "../hooks/use-send-from-editor";
import { useDocumentTargets } from "../hooks/use-document-targets";
import { useRestoreVersion } from "../hooks/use-restore-version";
import { useSidePanel } from "../hooks/use-side-panel";
import { useSprint } from "../hooks/use-sprint";
import { useSprintPanel } from "../hooks/use-sprint-panel";
import { useStudioDocument, type LoadState } from "../hooks/use-studio-document";
import { studioStore as store } from "../storage/store";
import { useDailyTarget } from "../hooks/use-daily-target";
import { useEditorMenu } from "../hooks/use-editor-menu";
import { useLeaveEditor } from "../hooks/use-leave-editor";
import { useEditorSearchShortcut } from "../hooks/use-studio-search-shortcut";
import { EditorConflictDialog } from "./conflict-dialog";
import { EditorBar } from "./editor-bar";
import { EditorCanvas } from "./editor-canvas";
import { DocumentTargetsDialog } from "./document-targets-dialog";
import { ExportDialog } from "./export-dialog";
import { EditorUnavailable } from "./editor-states";
import { FocusHud } from "./focus-hud";
import { FormatBar } from "./format-bar";
import { HelpDrawer } from "./help-drawer";
import { SendToProjectDialog } from "./send-to-project-dialog";
import { ShareDialog } from "./share-dialog";
import { SprintAnnouncer } from "./sprint-control";
import { StudioSearchDialog } from "./studio-search-dialog";
import { VersionHistoryDrawer } from "./version-history-drawer";

const FALLBACK_TITLE: Record<LoadState, string> = {
  loading: "",
  ready: "",
  error: "Dokumen tidak terbuka",
  missing: "Dokumen tidak ditemukan",
  archived: "Dokumen diarsipkan",
};

/** The writing area makes room for an open side panel, and sits lower in focus mode. */
function canvasClass(panelOpen: boolean, focusMode: boolean) {
  return cn(
    "min-h-0 flex-1 overflow-auto px-4 pt-8 pb-32 md:px-12 md:pt-24 md:pb-40",
    "transition-[padding] duration-200 ease-out",
    panelOpen && !focusMode && "md:pr-100",
    focusMode && "md:pt-36",
  );
}

/** A new document has no id until it is first stored. */
const storedId = (id: string) => (id === "baru" ? null : id);

/**
 * Studio editor screen. Documents live on this device for now (step 3a/3b); the same
 * `useStudioDocument` contract will be backed by Supabase in 3c.
 */
export function StudioEditor({ documentId, eventId }: { documentId: string; eventId?: string }) {
  const { onSaved, flush: saveEventProgress } = useEventSave(eventId);
  const doc = useStudioDocument(documentId, store, onSaved);
  const online = useOnlineStatus();
  const target = useDailyTarget();
  const toast = useToast();
  const side = useSidePanel();
  const [focusMode, setFocusMode] = useState(false);
  const sprint = useSprint(doc.words);
  const sprintPanel = useSprintPanel(sprint);
  const [dialog, setDialog] = useState<"share" | "send" | "export" | "targets" | "search" | null>(
    null,
  );
  const [stats, setStats] = useState<EditorStats | null>(null);
  const [selection, setSelection] = useState<EditorStats | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const router = useRouter();
  const openSearch = useCallback(() => setDialog("search"), []);
  const search = useEditorSearchShortcut(dialog, Boolean(doc.conflict), openSearch);

  // Equal values keep the previous object, so a cursor move does not re-render the editor screen.
  const onStatsChange = useCallback(
    (next: EditorStats) => setStats((prev) => (sameStats(prev, next) ? prev : next)),
    [],
  );
  const onSelectionStatsChange = useCallback(
    (next: EditorStats | null) => setSelection((prev) => (sameStats(prev, next) ? prev : next)),
    [],
  );

  const closePanel = side.close;
  const enterFocus = useCallback(() => {
    closePanel();
    setFocusMode(true);
  }, [closePanel]);

  // Escape leaves focus mode. A keyboard exit is instant, with no animation.
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) setFocusMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  const isEmpty = doc.title.trim() === "" && doc.words === 0;
  const ready = doc.load === "ready";
  const { saveNow, getId } = doc;
  /** Opened and not empty: something is stored that can be trashed or given targets. */
  const stored = ready && !isEmpty;

  const openSend = useCallback(() => setDialog("send"), []);
  const openExport = useCallback(() => setDialog("export"), []);
  const openTargets = useCallback(() => setDialog("targets"), []);
  const docTargets = useDocumentTargets(doc.targets, doc.words);
  const getContent = useCallback(() => editor?.getJSON() ?? null, [editor]);

  const share = useCallback(async () => {
    if (!(await saveNow())) return false;
    // This editor stays mounted in the background; coming back must not reopen the dialog.
    setDialog(null);
    router.push(postFromDocumentHref(getId()));
    return true;
  }, [saveNow, getId, router]);

  const closeDialog = useCallback(() => setDialog(null), []);
  const restoreVersion = useRestoreVersion(doc.restoreVersion, closePanel);
  const sendTo = useSendFromEditor({ saveNow, getId, closeDialog });

  const { goBack, saveBeforeLeaving } = useLeaveEditor(saveNow, saveEventProgress);

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
    canTrash: stored,
    canSend: doc.words > 0,
    canExport: doc.words > 0,
    canTarget: stored,
    canHistory: stored,
    onHelp: side.openHelp,
    onFocus: enterFocus,
    onSend: openSend,
    onExport: openExport,
    onTargets: openTargets,
    onHistory: side.openVersions,
    onSprint: sprintPanel.show,
    onTrash: () => void moveToTrash(),
  });

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
    <EditorUnavailable load={doc.load} onRetry={doc.reload} backHref={STUDIO_HREF} />
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
          helpOpen={side.panel === "help"}
          empty={isEmpty}
          ready={ready}
          fallbackTitle={FALLBACK_TITLE[doc.load]}
          menuItems={menuItems}
          counterTarget={docTargets.counter}
          sprint={sprint}
          sprintOpen={sprintPanel.open}
          onSprintOpenChange={sprintPanel.setOpen}
          onBack={() => void goBack()}
          onSearch={search.onOpen}
          onShare={() => setDialog("share")}
          onToggleHelp={side.toggleHelp}
          onFocusMode={enterFocus}
        />
      )}
      {eventId && doc.load !== "archived" && (
        <EventEditorPanel
          eventId={eventId}
          documentId={documentId}
          onBack={(href) => void goBack(href)}
        />
      )}
      {!focusMode && editor && <FormatBar editor={editor} />}

      <main aria-label="Kanvas menulis" className={canvasClass(side.panel !== null, focusMode)}>
        {body}
      </main>

      {ready && focusMode && (
        <FocusHud
          status={isEmpty ? "draft" : doc.status}
          savedAt={doc.savedAt}
          words={doc.words}
          progress={doc.progress}
          target={target}
          sprint={sprint}
          onExit={() => setFocusMode(false)}
        />
      )}
      <SprintAnnouncer state={sprint.state} />
      {search.isOpen && (
        <StudioSearchDialog
          onClose={closeDialog}
          beforeNavigate={() => saveBeforeLeaving(!!eventId)}
        />
      )}
      <HelpDrawer open={side.panel === "help" && !focusMode} onClose={side.close} />
      <VersionHistoryDrawer
        open={side.panel === "versions" && !focusMode}
        onClose={side.close}
        store={store}
        docId={getId()}
        currentWords={doc.words}
        onRestore={restoreVersion}
      />
      <ShareDialog
        open={dialog === "share"}
        onClose={() => setDialog(null)}
        documentTitle={doc.title}
        onContinue={share}
      />
      <DocumentTargetsDialog
        open={dialog === "targets"}
        onClose={closeDialog}
        words={doc.words}
        targets={doc.targets}
        today={docTargets.today}
        onChange={doc.setTargets}
      />
      <ExportDialog
        open={dialog === "export"}
        onClose={closeDialog}
        title={doc.title}
        getContent={getContent}
      />
      <SendToProjectDialog
        open={dialog === "send"}
        onClose={closeDialog}
        docId={storedId(documentId)}
        onPick={sendTo}
      />

      <EditorConflictDialog conflict={doc.conflict} resolveConflict={doc.resolveConflict} />
    </div>
  );
}
