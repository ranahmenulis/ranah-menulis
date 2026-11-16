import { describe, expect, it } from "vitest";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { canAdd } from "@/features/projects/storage/submission-store";
import { submission } from "../helpers";

describe("canAdd", () => {
  it("accepts a first work", () => {
    expect(canAdd([], submission(), 1)).toBe("ok");
  });

  it("refuses the same document twice for one project, but allows it for another", () => {
    const existing = [submission({ id: "a", slug: "x", docId: "d1" })];
    expect(canAdd(existing, submission({ id: "b", slug: "x", docId: "d1" }), 3)).toBe("duplicate");
    expect(canAdd(existing, submission({ id: "b", slug: "y", docId: "d1" }), 3)).toBe("ok");
  });

  it("refuses a work over the limit, counting only this project", () => {
    const existing = [
      submission({ id: "a", slug: "x", docId: "d1" }),
      submission({ id: "b", slug: "y", docId: "d2" }),
    ];
    expect(canAdd(existing, submission({ id: "c", slug: "x", docId: "d3" }), 1)).toBe("limit");
    expect(canAdd(existing, submission({ id: "c", slug: "x", docId: "d3" }), 2)).toBe("ok");
  });

  it("does not count a withdrawn work, so its document and its place are free again", () => {
    const existing = [submission({ id: "a", slug: "x", docId: "d1", status: "ditarik" })];
    expect(canAdd(existing, submission({ id: "b", slug: "x", docId: "d1" }), 1)).toBe("ok");
  });
});

describe("createMemorySubmissionStore", () => {
  it("stores what is added and refuses what the rules refuse", async () => {
    const store = createMemorySubmissionStore();
    expect(await store.add(submission({ id: "a", docId: "d1" }), 1)).toBe("ok");
    expect(await store.add(submission({ id: "b", docId: "d1" }), 1)).toBe("duplicate");
    expect(await store.add(submission({ id: "c", docId: "d2" }), 1)).toBe("limit");
    expect((await store.list()).map((s) => s.id)).toEqual(["a"]);
  });
});

describe("createMemorySubmissionStore, update", () => {
  it("writes what the change returns and hands it the other submissions", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", docId: "d1" }), 3);
    await store.add(submission({ id: "b", docId: "d2" }), 3);
    let seen: string[] = [];
    const verdict = await store.update("a", (current, all) => {
      seen = all.map((s) => s.id).sort();
      return { ...current, title: "Judul baru" };
    });
    expect(verdict).toBe("ok");
    expect(seen).toEqual(["a", "b"]);
    expect((await store.list()).find((s) => s.id === "a")?.title).toBe("Judul baru");
  });

  it("writes nothing when the change refuses", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a" }), 3);
    expect(await store.update("a", () => null)).toBe("rejected");
    expect((await store.list())[0].title).toBe("Buku yang Mengubahku");
  });

  it("says so when there is no such submission, without calling the change", async () => {
    const store = createMemorySubmissionStore();
    let called = false;
    const verdict = await store.update("nope", (current) => {
      called = true;
      return current;
    });
    expect(verdict).toBe("missing");
    expect(called).toBe(false);
  });
});
