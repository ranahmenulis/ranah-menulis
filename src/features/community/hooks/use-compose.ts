"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { studioStore } from "@/features/studio/storage/store";
import {
  canPublish,
  canSaveDraft,
  composeReducer,
  initialCompose,
  publicBlocks,
  toStored,
  type ComposeState,
} from "../compose-state";
import { memberOf } from "../groups/group-model";
import { writingGroups } from "../groups/group-store";
import { readGroupReader } from "../groups/group-viewer";
import type { PostStore, StoredPost } from "../storage/post-store";
import { useSourceParam } from "./use-source-param";

export type ComposeLoad = "loading" | "ready" | "missing" | "error";

const snapshot = (s: ComposeState) =>
  JSON.stringify([s.title.trim(), s.kind, s.genre, s.visibility, s.groupId, publicBlocks(s)]);

/**
 * State and actions of the compose screen. A draft is a post kept on this device with whatever is
 * filled in; publishing writes the same record as "published". Nothing is autosaved: the author
 * decides when a draft exists (the bar says "Simpan sebagai draf").
 */
export function useCompose(
  store: PostStore,
  draftId: string | null,
  /** A Studio document to start from, from the address; the "Dari dokumen Studio" tab opens on it. */
  startDocId: string | null = null,
) {
  const [state, dispatch] = useReducer(composeReducer, startDocId, (docId) =>
    docId ? { ...initialCompose, tab: "doc" as const } : initialCompose,
  );
  const sourceParam = useSourceParam(studioStore, draftId ? null : startDocId, dispatch);
  const [load, setLoad] = useState<ComposeLoad>(draftId ? "loading" : "ready");
  const [saved, setSaved] = useState(() => snapshot(initialCompose));
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<"publish" | "draft" | "group" | null>(null);
  const [done, setDone] = useState<StoredPost | null>(null);
  const [sourceGone, setSourceGone] = useState(false);

  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    store
      .getPost(draftId)
      .then((post) => {
        if (cancelled) return;
        if (!post || post.status !== "draft") return setLoad("missing");
        dispatch({ type: "load", post });
        setSaved(snapshot(composeReducer(initialCompose, { type: "load", post })));
        setLoad("ready");
      })
      .catch(() => !cancelled && setLoad("error"));
    return () => {
      cancelled = true;
    };
  }, [store, draftId]);

  // The text was copied when it was chosen, so a trashed source only needs a notice (STD-10).
  const sourceDocId = state.draftSource?.docId ?? null;
  useEffect(() => {
    if (!sourceDocId) return;
    let cancelled = false;
    studioStore
      .get(sourceDocId)
      .then((doc) => !cancelled && setSourceGone(!doc || Boolean(doc.deletedAt)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [sourceDocId]);

  const write = useCallback(
    async (status: StoredPost["status"]) => {
      const group =
        state.visibility === "grup"
          ? writingGroups.read().find((item) => item.id === state.groupId)
          : undefined;
      const membership = group && memberOf(group, readGroupReader());
      if (status === "published" && state.visibility === "grup" && !membership) {
        setFailed("group");
        return null;
      }
      setBusy(true);
      setFailed(null);
      const id = state.draftId ?? crypto.randomUUID();
      const post = toStored(
        state,
        id,
        status,
        Date.now(),
        group && membership
          ? { name: group.name, membershipId: membership.membershipId }
          : undefined,
      );
      try {
        await store.putPost(post);
      } catch {
        setFailed(status === "draft" ? "draft" : "publish");
        return null;
      } finally {
        setBusy(false);
      }
      dispatch({ type: "saved", draftId: id });
      return post;
    },
    [state, store],
  );

  const saveDraft = useCallback(async () => {
    const post = await write("draft");
    if (!post) return false;
    setSaved(snapshot(state));
    // The address now names the draft, so a reload or a shared tab reopens it.
    window.history.replaceState(null, "", `/tulis/${post.id}`);
    return true;
  }, [state, write]);

  const publish = useCallback(async () => {
    if (!canPublish(state)) return;
    const post = await write("published");
    if (post) setDone(post);
  }, [state, write]);

  return {
    state,
    dispatch,
    load,
    busy,
    failed,
    done,
    sourceGone,
    sourceParam,
    dirty: canSaveDraft(state) && snapshot(state) !== saved,
    saveDraft,
    publish,
  };
}
