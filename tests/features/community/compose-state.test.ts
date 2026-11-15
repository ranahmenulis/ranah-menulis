import { describe, expect, it } from "vitest";
import {
  canPublish,
  canSaveDraft,
  composeReducer,
  initialCompose,
  layoutOf,
  missingFor,
  missingHint,
  publicBlocks,
  toStored,
  type ComposeAction,
  type ComposeState,
} from "@/features/community/compose-state";
import type { PostBlock } from "@/features/community/types";

const run = (actions: ComposeAction[], from: ComposeState = initialCompose) =>
  actions.reduce(composeReducer, from);

const para = (text: string): PostBlock => ({ type: "paragraph", text });
const words = (n: number) => para(Array.from({ length: n }, () => "kata").join(" "));

const complete = run([
  { type: "title", value: "Lampu Tempel" },
  { type: "genre", value: "Cerpen" },
  { type: "visibility", value: "publik" },
  { type: "direct", blocks: [para("Listrik baru masuk ke kampung kami.")] },
]);

describe("publishing rules", () => {
  it("has no default visibility: a fresh form cannot be published", () => {
    expect(initialCompose.visibility).toBeNull();
    expect(missingFor(initialCompose)).toEqual(["title", "text", "genre", "visibility"]);
    expect(canPublish(initialCompose)).toBe(false);
  });

  it("can be published once title, text, genre, and visibility are all there", () => {
    expect(canPublish(complete)).toBe(true);
  });

  it("stays blocked without a visibility choice even when everything else is filled", () => {
    const state = { ...complete, visibility: null };
    expect(missingFor(state)).toEqual(["visibility"]);
    expect(canPublish(state)).toBe(false);
    expect(missingHint(state)).toBe("Untuk menerbitkan, lengkapi pilihan siapa yang bisa membaca.");
  });

  it("blocks publishing above 500 words but allows a draft, and cuts nothing", () => {
    const long = run([{ type: "direct", blocks: [words(501)] }], complete);
    expect(canPublish(long)).toBe(false);
    expect(canSaveDraft(long)).toBe(true);
    expect(publicBlocks(long)[0].text.split(" ")).toHaveLength(501);
    expect(canPublish(run([{ type: "direct", blocks: [words(500)] }], complete))).toBe(true);
  });

  it("lets a draft be saved with only a title or only some text", () => {
    expect(canSaveDraft(initialCompose)).toBe(false);
    expect(canSaveDraft(run([{ type: "title", value: "Judul" }]))).toBe(true);
  });
});

describe("picking from a Studio document", () => {
  const pick = {
    docId: "d1",
    docTitle: "Yang Ditunggu Nenek",
    blocks: [para("satu"), para("dua"), para("tiga")],
    chosen: [],
  };
  const picked = run([
    { type: "tab", tab: "doc" },
    { type: "pick", pick },
  ]);

  it("shares nothing until blocks are ticked, then only the ticked ones in document order", () => {
    expect(publicBlocks(picked)).toEqual([]);
    const ticked = run(
      [
        { type: "toggle", index: 2 },
        { type: "toggle", index: 0 },
      ],
      picked,
    );
    expect(publicBlocks(ticked).map((b) => b.text)).toEqual(["satu", "tiga"]);
    const unticked = run([{ type: "toggle", index: 2 }], ticked);
    expect(publicBlocks(unticked).map((b) => b.text)).toEqual(["satu"]);
  });

  it("starts the post title from the document title without overwriting a typed one", () => {
    expect(picked.title).toBe("Yang Ditunggu Nenek");
    const typed = run([
      { type: "title", value: "Judul sendiri" },
      { type: "tab", tab: "doc" },
      { type: "pick", pick },
    ]);
    expect(typed.title).toBe("Judul sendiri");
  });

  it("copies the text and remembers the source when stored", () => {
    const ticked = run([{ type: "toggle", index: 1 }], picked);
    const stored = toStored(
      { ...ticked, genre: "Cerpen", visibility: "grup" },
      "x",
      "published",
      1000,
      "Grup Penulis Pesisir",
    );
    expect(stored).toMatchObject({
      blocks: [para("dua")],
      sourceTitle: "Yang Ditunggu Nenek",
      sourceDocId: "d1",
      groupName: "Grup Penulis Pesisir",
      publishedAt: 1000,
    });
  });

  it("describes which screen phones show", () => {
    expect(layoutOf(picked).blocksOnly).toBe(true);
    expect(layoutOf(run([{ type: "review", on: true }], picked)).review).toBe(true);
    expect(layoutOf(run([{ type: "unpick" }], picked)).picking).toBe(true);
  });
});

describe("loading a draft", () => {
  it("reopens as direct text, keeping the source for the trashed-source notice", () => {
    const state = run([
      {
        type: "load",
        post: {
          id: "d",
          status: "draft",
          title: "T",
          kind: "cuplikan",
          genre: null,
          blocks: [para("isi")],
          sourceTitle: "Sumber",
          sourceDocId: "doc-1",
          visibility: null,
          updatedAt: 1,
        },
      },
    ]);
    expect(state).toMatchObject({
      tab: "direct",
      draftId: "d",
      genre: "",
      visibility: null,
      draftSource: { docId: "doc-1", title: "Sumber" },
    });
  });
});
