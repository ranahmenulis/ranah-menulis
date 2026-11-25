import { describe, expect, it } from "vitest";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { pendingImport } from "@/features/studio/storage/remote/import-local";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";

const fake = (docIds: string[], folderIds: string[]) =>
  ({
    listSummaries: async () => docIds.map((id) => ({ id })),
    listFolders: async () => folderIds.map((id) => ({ id })),
  }) as unknown as DocumentStore;

describe("pendingImport", () => {
  it("counts only what the account does not have", async () => {
    const result = await pendingImport(fake([A, B], [C]), fake([A], []));
    expect(result).toEqual({ documents: 1, folders: 1 });
  });

  it("leaves out ids the import would skip", async () => {
    const result = await pendingImport(fake(["baru", "bukan-uuid", A], ["x"]), fake([], []));
    expect(result).toEqual({ documents: 1, folders: 0 });
  });

  it("is zero when the account already holds everything", async () => {
    expect(await pendingImport(fake([A], [B]), fake([A, C], [B]))).toEqual({
      documents: 0,
      folders: 0,
    });
  });
});
