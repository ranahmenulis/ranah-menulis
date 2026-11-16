import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDraft, loadDraft, saveDraft } from "@/features/projects/submission-draft";
import { emptyForm } from "@/features/projects/submission-model";

const KEY = "ranah.submissionDrafts";

beforeEach(() => localStorage.clear());

describe("submission drafts", () => {
  it("keeps the typed fields per project and never the statement", () => {
    saveDraft("a", { ...emptyForm, docId: "d1", title: "Judul", agreed: true });
    expect(loadDraft("a")).toEqual({
      docId: "d1",
      title: "Judul",
      genre: "",
      note: "",
      synopsis: "",
    });
    expect(loadDraft("b")).toBeNull();
    expect(localStorage.getItem(KEY)).not.toContain("agreed");
  });

  it("drops the draft when the form is emptied again", () => {
    saveDraft("a", { ...emptyForm, title: "Judul" });
    saveDraft("a", { ...emptyForm, title: "  " });
    expect(loadDraft("a")).toBeNull();
  });

  it("clears one project's draft and leaves the others", () => {
    saveDraft("a", { ...emptyForm, title: "A" });
    saveDraft("b", { ...emptyForm, title: "B" });
    clearDraft("a");
    expect(loadDraft("a")).toBeNull();
    expect(loadDraft("b")?.title).toBe("B");
  });

  it("ignores broken or foreign storage instead of throwing", () => {
    localStorage.setItem(KEY, "{not json");
    expect(loadDraft("a")).toBeNull();
    localStorage.setItem(
      KEY,
      JSON.stringify({
        a: { title: 5 },
        b: { docId: null, title: "ok", genre: "", note: "", synopsis: "" },
      }),
    );
    expect(loadDraft("a")).toBeNull();
    expect(loadDraft("b")?.title).toBe("ok");
  });

  it("does not throw when the device refuses to store", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    expect(() => saveDraft("a", { ...emptyForm, title: "x" })).not.toThrow();
    vi.restoreAllMocks();
  });
});
