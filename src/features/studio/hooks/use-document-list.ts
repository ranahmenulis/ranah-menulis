"use client";

import { useCallback, useEffect, useState } from "react";
import {
  summarizeDocument,
  type DocumentStore,
  type DocumentSummary,
  type StudioDocument,
  type StudioFolder,
} from "../storage/document-store";
import { onDocumentListChanged } from "../storage/document-events";

export type DocumentList<T extends DocumentSummary = DocumentSummary> = {
  status: "loading" | "ready" | "error";
  /** When the list was read; relative times ("2 jam lalu") are measured from here. */
  loadedAt: number;
  docs: T[];
  folders: StudioFolder[];
  reload: () => void;
  rename: (id: string, title: string) => Promise<void>;
  updateClassification: DocumentStore["updateClassification"];
  duplicateActive: DocumentStore["duplicateActive"];
  setArchived: DocumentStore["setArchived"];
  moveTo: (id: string, folderId: string | null) => Promise<void>;
  trash: (id: string) => Promise<boolean>;
  restore: (id: string) => Promise<void>;
  deleteForever: (id: string) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
};

const nowMs = () => Date.now();

const fullDocuments = {
  read: (store: DocumentStore) => store.list(),
  project: (doc: StudioDocument) => doc,
};
const documentSummaries = {
  read: (store: DocumentStore, signal: AbortSignal) => store.listSummaries(signal),
  project: summarizeDocument,
};

export function useDocumentList(store: DocumentStore) {
  return useList(store, fullDocuments);
}

export function useDocumentSummaryList(store: DocumentStore) {
  return useList(store, documentSummaries);
}

function useList<T extends DocumentSummary>(
  store: DocumentStore,
  source: {
    read: (store: DocumentStore, signal: AbortSignal) => Promise<T[]>;
    project: (doc: StudioDocument) => T;
  },
): DocumentList<T> {
  const [status, setStatus] = useState<DocumentList["status"]>("loading");
  const [docs, setDocs] = useState<T[]>([]);
  const [folders, setFolders] = useState<StudioFolder[]>([]);
  const [loadedAt, setLoadedAt] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([source.read(store, signal), store.listFolders()])
      .then(([list, folderList]) => {
        if (signal.aborted) return;
        setDocs(list);
        setFolders(folderList);
        setLoadedAt(Date.now());
        setStatus("ready");
      })
      .catch(() => !signal.aborted && setStatus("error"));
    return () => controller.abort();
  }, [store, source, attempt]);

  // Actions write, then reload: the list is small and this keeps one source of truth.
  const refresh = useCallback(() => setAttempt((n) => n + 1), []);
  useEffect(() => onDocumentListChanged(refresh), [refresh]);

  function reflect(doc: StudioDocument | null) {
    if (doc) {
      setDocs((current) => [...current.filter(({ id }) => id !== doc.id), source.project(doc)]);
    } else {
      refresh();
    }
    return doc;
  }

  const act = useCallback(
    <A extends unknown[]>(fn: (...args: A) => Promise<unknown>) =>
      async (...args: A) => {
        await fn(...args);
        refresh();
      },
    [refresh],
  );

  return {
    status,
    loadedAt,
    docs,
    folders,
    reload: () => {
      setStatus("loading");
      refresh();
    },
    rename: act((id: string, title: string) => store.updateMeta(id, { title })),
    updateClassification: async (id, expected, changes) => {
      const result = await store.updateClassification(id, expected, changes);
      if (result.status === "saved") {
        setDocs((current) =>
          current.map((doc) => (doc.id === id ? source.project(result.doc) : doc)),
        );
        refresh();
      }
      return result;
    },
    duplicateActive: async (id) => reflect(await store.duplicateActive(id)),
    setArchived: async (id, archived) => reflect(await store.setArchived(id, archived)),
    moveTo: act((id: string, folderId: string | null) => store.updateMeta(id, { folderId })),
    trash: async (id) => {
      const doc = await store.updateMeta(id, { deletedAt: nowMs() });
      refresh();
      return doc !== null;
    },
    restore: act((id: string) => store.updateMeta(id, { deletedAt: null })),
    deleteForever: act((id: string) => store.deletePermanently(id)),
    createFolder: act((name: string) => store.createFolder(name)),
    renameFolder: act((id: string, name: string) => store.renameFolder(id, name)),
  };
}
