import { describe, expect, it, vi } from "vitest";
import {
  scanDocumentMatches,
  searchText,
  studioSearchResults,
} from "@/features/studio/document-search";
import { documentsInScope } from "@/features/studio/documents";
import type { StudioDocument } from "@/features/studio/storage/document-store";

function doc(id: string, title: string, text = ""): StudioDocument {
  return {
    id,
    title,
    version: 1,
    updatedAt: 0,
    wordCount: 0,
    content: {
      type: "doc",
      content: [{ type: "heading", content: [{ type: "text", text }] }],
    },
  };
}

describe("Studio search", () => {
  it("matches names only in quick search and excludes archived and trashed documents", () => {
    const docs = [
      doc("a", "Pagi di Kota"),
      doc("b", "Sore", "pagi"),
      { ...doc("c", "Pagi arsip"), archivedAt: 1 },
      { ...doc("d", "Pagi sampah"), deletedAt: 1 },
    ];
    expect(studioSearchResults(docs, [{ id: "f", name: "Pagi", createdAt: 0 }], " PAGI ")).toEqual([
      { id: "f", kind: "folder", name: "Pagi" },
      { id: "a", kind: "document", name: "Pagi di Kota" },
    ]);
  });

  it("combines folder, kind, and tag before reading bodies and skips title hits", async () => {
    const story = (value: StudioDocument) => ({
      ...value,
      kind: "cerpen" as const,
      tags: ["Draf"],
      folderId: "f",
    });
    const docs = [
      story(doc("title", "Pagi")),
      story(doc("body", "Sore", "SELAMAT\nPAGI")),
      { ...story(doc("elsewhere", "Catatan", "pagi")), folderId: "other" },
      { ...story(doc("archive", "Catatan", "pagi")), archivedAt: 1 },
      { ...story(doc("untagged", "Catatan", "pagi")), tags: [] },
    ];
    const get = vi.fn(async (id: string) => docs.find((item) => item.id === id) ?? null);
    const scope = documentsInScope(docs, "f", { kind: "cerpen", tag: "draf" }, true);
    const matches = await scanDocumentMatches(
      { get },
      scope,
      searchText("pagi"),
      new AbortController().signal,
    );
    expect([...matches]).toEqual(["title", "body"]);
    expect(get.mock.calls).toEqual([["body"]]);
  });

  it("stops after the in-flight batch when cancelled and never scans the next batch", async () => {
    const controller = new AbortController();
    const docs = Array.from({ length: 12 }, (_, i) => doc(String(i), "Catatan"));
    const read = Promise.withResolvers<StudioDocument | null>();
    const get = vi.fn(() => read.promise);
    const scan = scanDocumentMatches({ get }, docs, "keyword", controller.signal);
    expect(get).toHaveBeenCalledTimes(4);
    controller.abort();
    read.resolve(null);
    await expect(scan).rejects.toMatchObject({ name: "AbortError" });
    expect(get).toHaveBeenCalledTimes(4);
  });
});
