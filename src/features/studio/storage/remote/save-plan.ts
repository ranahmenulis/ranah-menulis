import { applyWordDelta, type DailyLog } from "../../daily-progress";
import { isLargeDeletion, planSnapshots, type DocumentVersion } from "../../versions";
import type { SaveInput, SaveOptions, StudioDocument } from "../document-store";

/** What `studio_save_document` needs besides the document itself. */
export type RemoteSavePlan = {
  /** Words of this document for today's log, or null to leave its row alone. */
  docWords: number | null;
  /** Added to the day's activity; null leaves activity alone, `{}` only creates it. */
  activity: { reduced?: number; added?: number; hour?: number } | null;
  versions: DocumentVersion[];
};

/** True when the previous text is worth loading: only a large deletion keeps a snapshot of it. */
export const needsPreviousText = (previousWords: number, nextWords: number) =>
  isLargeDeletion(previousWords, nextWords);

/**
 * The same rules as `commitSave` and the IndexedDB `writeSave` (daily words, writing activity,
 * version snapshots), expressed as the numbers the database function adds up. The database only
 * guarantees that the version matched and that everything lands in one transaction.
 *
 * `previous` is the stored document before this save (null for the first save). Its `content` may
 * be a stub unless `needsPreviousText` was true for this save.
 */
export function planRemoteSave(args: {
  previous: StudioDocument | null;
  input: SaveInput;
  todayLog: DailyLog;
  options?: SaveOptions;
  hour: number;
  now: number;
  /** The newest kept version of this document, if any (its text may be left out). */
  latest: DocumentVersion | null;
}): RemoteSavePlan {
  const { previous, input, todayLog, options, hour, now, latest } = args;
  const previousWords = previous?.wordCount ?? 0;
  const progress = applyWordDelta(todayLog, input, previousWords, input.wordCount);
  const docWords = input.id in progress.docs ? progress.docs[input.id].words : null;

  const baseline = options?.activityBaseWords;
  let activity: RemoteSavePlan["activity"] = null;
  if (baseline !== null && baseline !== input.wordCount) {
    const delta = input.wordCount - (baseline ?? previousWords);
    activity = delta === 0 ? {} : delta < 0 ? { reduced: -delta } : { added: delta, hour };
  }

  const saved: StudioDocument = {
    id: input.id,
    title: input.title,
    content: input.content,
    wordCount: input.wordCount,
    version: (previous?.version ?? 0) + 1,
    updatedAt: now,
  };
  const versions = planSnapshots(previous, saved, latest ? [latest] : [], now);
  return { docWords, activity, versions };
}
