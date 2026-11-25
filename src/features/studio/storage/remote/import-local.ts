import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyLog } from "../../daily-progress";
import type { DocumentStore } from "../document-store";
import { importableFolder, isUuid } from "./row-mapping";

export type ImportSummary = {
  folders: number;
  /** Documents that were not in the account yet and are now. */
  documents: number;
  /** Documents left out: not a valid id, or refused by the database (for example too large). */
  skipped: number;
  /** Days of writing history sent. */
  days: number;
};

/**
 * Days to send to the account: every local day, with its documents added to what the account
 * already has for that day. The account's own rows win where both sides have the same document or
 * the same day's activity, so importing twice (or after writing in the account) changes nothing.
 */
export function mergeLogs(account: DailyLog[], device: DailyLog[]): DailyLog[] {
  const known = new Map(account.map((log) => [log.day, log]));
  return device.map((log) => {
    const mine = known.get(log.day);
    if (!mine) return log;
    const activity = mine.activity ?? log.activity;
    return {
      day: log.day,
      docs: { ...log.docs, ...mine.docs },
      ...(activity ? { activity } : {}),
    };
  });
}

/** What the device holds that the account does not have yet (nothing is written). */
export type PendingImport = { documents: number; folders: number };

/**
 * Counts the device's folders and documents that could be copied and are not in the account yet.
 * Ids that are not UUIDs are left out because `importFromDevice` would skip them anyway.
 */
export async function pendingImport(
  device: DocumentStore,
  account: DocumentStore,
): Promise<PendingImport> {
  const [deviceDocs, deviceFolders, accountDocs, accountFolders] = await Promise.all([
    device.listSummaries(),
    device.listFolders(),
    account.listSummaries(),
    account.listFolders(),
  ]);
  const haveDocs = new Set(accountDocs.map((doc) => doc.id));
  const haveFolders = new Set(accountFolders.map((folder) => folder.id));
  return {
    documents: deviceDocs.filter((doc) => isUuid(doc.id) && !haveDocs.has(doc.id)).length,
    folders: deviceFolders.filter((folder) => isUuid(folder.id) && !haveFolders.has(folder.id))
      .length,
  };
}

/**
 * Copies what this device holds (folders, documents, writing history) into the signed-in account.
 * Safe to run again: a folder or document already in the account is never overwritten, and
 * version history is not copied (it only keeps 3 days). Nothing is removed from the device.
 */
export async function importFromDevice(
  device: DocumentStore,
  account: DocumentStore,
  client: SupabaseClient,
): Promise<ImportSummary> {
  const [folders, documents, deviceHistory, accountHistory] = await Promise.all([
    device.listFolders(),
    device.list(),
    device.history(),
    account.history(),
  ]);

  // Books may sit in a plain folder, so plain folders go first.
  const usable = folders.filter((folder) => isUuid(folder.id));
  const ordered = [
    usable.filter((folder) => !folder.collectionId),
    usable.filter((folder) => folder.collectionId),
  ];
  let folderCount = 0;
  for (const batch of ordered) {
    if (batch.length === 0) continue;
    const { data, error } = await client
      .from("studio_folders")
      .upsert(batch.map(importableFolder), { onConflict: "id", ignoreDuplicates: true })
      .select("id");
    if (error) throw new Error(error.message, { cause: error });
    folderCount += data?.length ?? 0;
  }

  let imported = 0;
  let skipped = 0;
  for (const doc of documents) {
    if (!isUuid(doc.id)) {
      skipped += 1;
      continue;
    }
    const { data, error } = await client.rpc("studio_import_document", { p_doc: doc });
    if (error) skipped += 1;
    else if (data === true) imported += 1;
  }

  const days = mergeLogs(accountHistory, deviceHistory);
  await account.importHistory(days);
  return { folders: folderCount, documents: imported, skipped, days: days.length };
}
