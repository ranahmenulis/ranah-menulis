import { beforeEach, describe, expect, it, vi } from "vitest";
import { classCopies, copyKey } from "@/features/projects/kelas/copy-store";
import { copyExercise, exerciseContent } from "@/features/projects/kelas/exercise-copy";
import type { StudioDocument } from "@/features/studio/storage/document-store";

const material = {
  id: "m1",
  title: "Satu ide",
  exercise: "Tulis satu kalimat.\n\nLalu tulis satu pertanyaan.",
};

function fakeStore(existing: Partial<StudioDocument> | null = null) {
  const duplicate = vi.fn(async (source: StudioDocument, title: string) => ({
    ...source,
    id: `doc-${duplicate.mock.calls.length}`,
    title,
  }));
  const get = vi.fn(async () => (existing as StudioDocument | null) ?? null);
  return { get, duplicate };
}

beforeEach(() => classCopies.reset());

describe("exercise content", () => {
  it("is the exercise text followed by an empty paragraph to write in", () => {
    const content = exerciseContent(material.exercise);
    expect(content.content).toHaveLength(3);
    expect(content.content?.at(-1)).toEqual({ type: "paragraph" });
  });
});

describe("copying an exercise to Studio", () => {
  it("creates a new document without writing a log of words written today", async () => {
    const store = fakeStore();
    const result = await copyExercise("kelas", material, store, 1000);
    expect(result).toEqual({ docId: "doc-1", created: true });
    const [draft, title] = store.duplicate.mock.calls[0]!;
    expect(title).toBe("Latihan: Satu ide");
    expect(draft.wordCount).toBe(7);
    expect(draft.version).toBe(1);
    expect(classCopies.read()).toEqual([
      { key: copyKey("kelas", "m1"), docId: "doc-1", createdAt: 1000 },
    ]);
  });

  it("opens the same copy instead of making another while it is in the writing list", async () => {
    await copyExercise("kelas", material, fakeStore(), 1000);
    const store = fakeStore({ id: "doc-1", title: "x" });
    const again = await copyExercise("kelas", material, store, 2000);
    expect(again).toEqual({ docId: "doc-1", created: false });
    expect(store.duplicate).not.toHaveBeenCalled();
  });

  it.each([
    ["in Sampah", { deletedAt: 5 }],
    ["in Archive", { archivedAt: 5 }],
    ["deleted for good", null],
  ])("copies again when the earlier copy is %s", async (_name, state) => {
    await copyExercise("kelas", material, fakeStore(), 1000);
    const store = fakeStore(state === null ? null : { id: "doc-1", ...state });
    const again = await copyExercise("kelas", material, store, 2000);
    expect(again.created).toBe(true);
    expect(classCopies.read()).toHaveLength(1);
    expect(classCopies.read()[0]?.createdAt).toBe(2000);
  });

  it("copies exercises of different materials separately", async () => {
    await copyExercise("kelas", material, fakeStore(), 1000);
    await copyExercise("kelas", { ...material, id: "m2" }, fakeStore(), 1000);
    expect(classCopies.read()).toHaveLength(2);
  });

  it("refuses a material with no exercise and leaves nothing behind", async () => {
    const store = fakeStore();
    await expect(
      copyExercise("kelas", { id: "m3", title: "Tanpa latihan" }, store),
    ).rejects.toThrow();
    expect(classCopies.read()).toEqual([]);
  });

  it("leaves no link behind when the document cannot be written", async () => {
    const store = fakeStore();
    store.duplicate.mockRejectedValueOnce(new Error("quota"));
    await expect(copyExercise("kelas", material, store)).rejects.toThrow("quota");
    expect(classCopies.read()).toEqual([]);
  });
});
