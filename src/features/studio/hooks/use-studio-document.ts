"use client";

import type { JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { emptyLog, type DailyLog } from "../daily-progress";
import { isArchivedDocument } from "../document-archive";
import { DEFAULT_LAYOUT, type DocumentLayout } from "../document-layout";
import { sanitizeTargets, type DocumentTarget } from "../document-targets";
import { versionId, type DocumentVersion } from "../versions";
import type { DocumentStore, SaveInput, StudioDocument } from "../storage/document-store";
import { EMPTY_DOC, isBlankDraft, storedLayout, type LatestDocument } from "./document-state";

const AUTOSAVE_DELAY_MS = 800;
const RETRY_DELAY_MS = 5000;

export type LoadState = "loading" | "ready" | "missing" | "archived" | "error";
/** draft: nothing written yet. failed: the device could not store the change (retrying). */
export type SaveStatus = "draft" | "saved" | "saving" | "failed";
export type ConflictChoice = "local" | "remote" | "both";
export type Conflict = { local: SaveInput; remote: StudioDocument };

/**
 * Loads one document and keeps it saved. Saving happens after a short typing pause, never twice at
 * once, and is flushed when the tab is hidden or the editor unmounts. A save that finds a newer
 * version stops autosaving and raises a conflict; nothing is overwritten until the writer chooses.
 * "baru" opens an empty draft that is only stored once something is written.
 */
export function useStudioDocument(
  documentId: string,
  store: DocumentStore,
  onSaved?: (doc: StudioDocument) => void,
) {
  const isNew = documentId === "baru";
  const [load, setLoad] = useState<LoadState>(isNew ? "ready" : "loading");
  const [attempt, setAttempt] = useState(0);
  const [initial, setInitial] = useState<{ title: string; content: JSONContent }>({
    title: "",
    content: EMPTY_DOC,
  });
  /** Changes whenever the editor must be rebuilt from `initial` (open, or "use the other version"). */
  const [editorKey, setEditorKey] = useState(0);
  const [title, setTitleState] = useState("");
  const [words, setWords] = useState(0);
  const [targets, setTargetsState] = useState<DocumentTarget[]>([]);
  const [layout, setLayoutState] = useState<DocumentLayout | undefined>(undefined);
  const [status, setStatus] = useState<SaveStatus>("draft");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [progress, setProgress] = useState<DailyLog>(emptyLog());
  const [conflict, setConflict] = useState<Conflict | null>(null);

  const id = useRef(isNew ? "" : documentId);
  const version = useRef(0);
  const latest = useRef<LatestDocument>({ title: "", content: EMPTY_DOC, words: 0, targets: [] });
  const dirty = useRef(false);
  const activityBaseWords = useRef<number | null | undefined>(undefined);
  const inFlight = useRef(false);
  const blocked = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  /** Lets a save schedule its own retry without referring to itself. */
  const flushAgain = useRef<() => void>(() => {});

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    const { title: t, content, words: w, targets: tg, layout: lay } = latest.current;
    if (!dirty.current || inFlight.current || blocked.current) return;
    if (isBlankDraft(version.current, t, w)) return;

    inFlight.current = true;
    dirty.current = false;
    let failed = false;
    setStatus("saving");
    try {
      const input: SaveInput = {
        id: id.current,
        title: t,
        content,
        wordCount: w,
        targets: tg,
        ...(lay ? { layout: lay } : {}),
      };
      const result = await store.save(input, version.current, {
        activityBaseWords: activityBaseWords.current,
      });
      if (result.ok) {
        activityBaseWords.current = undefined;
        version.current = result.doc.version;
        setProgress(result.progress);
        setSavedAt(new Date(result.doc.updatedAt));
        setStatus(dirty.current ? "saving" : "saved");
        onSaved?.(result.doc);
        if (isNew && window.location.pathname !== `/studio/${id.current}`) {
          window.history.replaceState(null, "", `/studio/${id.current}`);
        }
      } else {
        blocked.current = true;
        dirty.current = true;
        setConflict({ local: input, remote: result.conflict });
        setStatus("saved");
      }
    } catch {
      failed = true;
      dirty.current = true;
      setStatus("failed");
      timer.current = window.setTimeout(() => flushAgain.current(), RETRY_DELAY_MS);
    } finally {
      inFlight.current = false;
      // Typing during the save left more to write; a failed save waits for its retry timer.
      if (dirty.current && !blocked.current && !failed) flushAgain.current();
    }
  }, [store, isNew, onSaved]);

  useEffect(() => {
    flushAgain.current = () => void flush();
  }, [flush]);

  const schedule = useCallback(() => {
    dirty.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
  }, [flush]);

  // Open the document (or a fresh draft) and today's progress.
  useEffect(() => {
    let cancelled = false;
    if (isNew && !id.current) id.current = crypto.randomUUID();
    (async () => {
      try {
        const [doc, today] = await Promise.all([
          isNew ? Promise.resolve(null) : store.get(documentId),
          store.today(),
        ]);
        if (cancelled) return;
        setProgress(today);
        if (isNew) return;
        if (!doc) return setLoad("missing");
        if (isArchivedDocument(doc)) return setLoad("archived");
        version.current = doc.version;
        const stored = sanitizeTargets(doc.targets);
        const layoutOfDoc = storedLayout(doc.layout);
        latest.current = {
          title: doc.title,
          content: doc.content,
          words: doc.wordCount,
          targets: stored,
          layout: layoutOfDoc,
        };
        setLayoutState(layoutOfDoc);
        setInitial({ title: doc.title, content: doc.content });
        setTitleState(doc.title);
        setWords(doc.wordCount);
        setTargetsState(stored);
        setSavedAt(new Date(doc.updatedAt));
        setStatus("saved");
        setEditorKey((k) => k + 1);
        setLoad("ready");
      } catch {
        if (!cancelled) setLoad("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [documentId, isNew, store, attempt]);

  // Never lose a pause: write out pending changes when leaving the tab or the editor.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      void flush();
    };
  }, [flush]);

  /**
   * Resolves true once everything written so far is stored (waiting out a save in progress), false
   * when it cannot be: a conflict or a failed save. For leaving the editor with the text intact.
   */
  const saveNow = useCallback(async () => {
    let writes = 0;
    for (let waits = 0; waits < 100; waits++) {
      if (blocked.current) return false;
      if (inFlight.current) {
        await new Promise((resolve) => window.setTimeout(resolve, 50));
        continue;
      }
      const { title: t, words: w } = latest.current;
      if (!dirty.current || isBlankDraft(version.current, t, w)) return true;
      if (writes++ >= 3) return false; // the device keeps refusing; its retry timer takes over
      await flush();
    }
    return false;
  }, [flush]);

  /** The stored id; a new draft gets its id when the editor opens and keeps it from then on. */
  const getId = useCallback(() => id.current, []);

  const setTitle = useCallback(
    (value: string) => {
      latest.current.title = value;
      setTitleState(value);
      schedule();
    },
    [schedule],
  );

  const setTargets = useCallback(
    (next: DocumentTarget[]) => {
      latest.current.targets = next;
      setTargetsState(next);
      schedule();
    },
    [schedule],
  );

  const setLayout = useCallback(
    (next: DocumentLayout) => {
      latest.current.layout = next;
      setLayoutState(next);
      schedule();
    },
    [schedule],
  );

  const onContentChange = useCallback(
    (content: JSONContent, wordCount: number) => {
      latest.current.content = content;
      latest.current.words = wordCount;
      setWords(wordCount);
      schedule();
    },
    [schedule],
  );

  /**
   * Puts an older version back. What is written now is stored as a version first, so the restore
   * can itself be undone; then the editor is rebuilt from the old text and the normal autosave
   * stores it on the version this tab already holds (no conflict). False when it could not start.
   */
  const restoreVersion = useCallback(
    async (target: DocumentVersion) => {
      if (!id.current || blocked.current || !(await saveNow())) return false;
      if (version.current === 0) return false; // a draft that was never stored has no history
      const { title: t, content, words: w, targets: tg, layout: lay } = latest.current;
      try {
        await store.addVersion({
          id: versionId(id.current, version.current),
          docId: id.current,
          savedAt: Date.now(),
          title: t,
          content,
          wordCount: w,
          reason: "pemulihan",
        });
      } catch {
        return false; // Nothing was changed; the text is still safe.
      }
      latest.current = {
        title: target.title,
        content: target.content,
        words: target.wordCount,
        targets: tg,
        layout: lay,
      };
      activityBaseWords.current = target.wordCount;
      setInitial({ title: target.title, content: target.content });
      setTitleState(target.title);
      setWords(target.wordCount);
      setEditorKey((k) => k + 1);
      schedule();
      return true;
    },
    [store, saveNow, schedule],
  );

  const resolveConflict = useCallback(
    async (choice: ConflictChoice) => {
      if (!conflict) return;
      const { remote } = conflict;
      if (choice === "both") {
        await store.duplicate(remote, `${remote.title || "Tanpa judul"} (versi lain)`);
      }
      version.current = remote.version;
      blocked.current = false;
      setConflict(null);
      if (choice === "remote") {
        activityBaseWords.current = undefined;
        dirty.current = false;
        const remoteTargets = sanitizeTargets(remote.targets);
        const remoteLayout = storedLayout(remote.layout);
        latest.current = {
          title: remote.title,
          content: remote.content,
          words: remote.wordCount,
          targets: remoteTargets,
          layout: remoteLayout,
        };
        setLayoutState(remoteLayout);
        setInitial({ title: remote.title, content: remote.content });
        setTitleState(remote.title);
        setWords(remote.wordCount);
        setTargetsState(remoteTargets);
        setSavedAt(new Date(remote.updatedAt));
        setEditorKey((k) => k + 1);
      } else {
        activityBaseWords.current = null;
        await flush();
      }
    },
    [conflict, store, flush],
  );

  return {
    load,
    reload: () => {
      setLoad("loading");
      setAttempt((n) => n + 1);
    },
    initial,
    editorKey,
    title,
    setTitle,
    words,
    targets,
    setTargets,
    layout: layout ?? DEFAULT_LAYOUT,
    setLayout,
    onContentChange,
    status: status === "draft" && (title.trim() !== "" || words > 0) ? "saving" : status,
    savedAt,
    progress,
    conflict,
    resolveConflict,
    saveNow,
    getId,
    restoreVersion,
  };
}
