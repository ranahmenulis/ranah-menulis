"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { picksRemoteSync } from "../storage/remote/remote-community-lists";
import { SEED_PICK_IDS } from "./seed-picks";

/** One Editor's Pick. The list order is the order shown; `title` is kept so the audit log can name it. */
export type EditorPick = { postId: string; at: number; title?: string };

const isPick = (value: unknown): value is EditorPick => {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.postId === "string" &&
    Number.isFinite(p.at) &&
    (p.title === undefined || typeof p.title === "string")
  );
};

export const editorPicks = createLocalListStore<EditorPick>(
  "ranah.editorPicks",
  isPick,
  SEED_PICK_IDS.map((postId) => ({ postId, at: 0 })),
  picksRemoteSync,
);
