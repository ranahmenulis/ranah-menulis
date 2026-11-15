import type { JSONContent } from "@tiptap/react";
import { applyWordDelta, type DailyLog } from "../daily-progress";

export type StudioDocument = {
  id: string;
  title: string;
  content: JSONContent;
  wordCount: number;
  /** Increases by one on every accepted save. Used to detect two writers (BR-STD-04). */
  version: number;
  updatedAt: number;
};

export type SaveInput = {
  id: string;
  title: string;
  content: JSONContent;
  wordCount: number;
};

export type SaveResult =
  { ok: true; doc: StudioDocument; progress: DailyLog } | { ok: false; conflict: StudioDocument };

/**
 * Where documents live. Today: this device (IndexedDB). The same interface is what the Supabase
 * implementation will satisfy in step 3c, with `version` checked inside the database function.
 */
export interface DocumentStore {
  get(id: string): Promise<StudioDocument | null>;
  /** Fails with a conflict when `baseVersion` is not the stored version. Never overwrites silently. */
  save(input: SaveInput, baseVersion: number): Promise<SaveResult>;
  today(): Promise<DailyLog>;
  /** Copy a version into a new document (conflict resolution "keep both"). */
  duplicate(source: StudioDocument, title: string): Promise<StudioDocument>;
}

/** Pure save rule shared by every store; the storage adapter only has to make it atomic. */
export function commitSave(
  existing: StudioDocument | null,
  input: SaveInput,
  baseVersion: number,
  log: DailyLog,
  now: number,
): SaveResult {
  if (existing && existing.version !== baseVersion) return { ok: false, conflict: existing };

  const doc: StudioDocument = {
    ...input,
    version: (existing?.version ?? 0) + 1,
    updatedAt: now,
  };
  const progress = applyWordDelta(log, input, existing?.wordCount ?? 0, input.wordCount);
  return { ok: true, doc, progress };
}
