import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { sendSubmission } from "@/features/projects/submit-flow";
import { loadDraft, saveDraft } from "@/features/projects/submission-draft";
import { emptyForm, type SubmitForm } from "@/features/projects/submission-model";
import { project, registration, submission, textOf } from "./helpers";

const esai = project("lomba-esai-literasi-remaja", Date.now());
const form: SubmitForm = {
  ...emptyForm,
  docId: "d1",
  title: "Buku yang Mengubahku",
  genre: "Esai",
  agreed: true,
};

function docs(over: Partial<StudioDocument> = {}) {
  const doc: StudioDocument = {
    id: "d1",
    title: "Esai",
    content: textOf(800),
    wordCount: 800,
    version: 1,
    updatedAt: 1,
    ...over,
  };
  return { get: vi.fn(async (id: string) => (id === doc.id ? doc : null)) };
}

const run = (over: Partial<Parameters<typeof sendSubmission>[0]> = {}) => {
  const store = createMemorySubmissionStore();
  const documents = docs();
  const input = {
    project: esai,
    registration: registration(esai.slug),
    form,
    documents,
    store,
    ...over,
  };
  return { store, documents, result: sendSubmission(input) };
};

beforeEach(() => localStorage.clear());

describe("sendSubmission", () => {
  it("freezes the document as it is now and stores a Terkirim submission", async () => {
    const { store, result } = run();
    const sent = await result;
    expect(sent.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved).toMatchObject({ slug: esai.slug, status: "terkirim", docId: "d1" });
    expect(saved.versions[0]).toMatchObject({ version: 1, wordCount: 800 });
  });

  it("clears the draft once sent, and keeps it when sending fails a rule", async () => {
    saveDraft(esai.slug, form);
    await run({ form: { ...form, title: "" } }).result;
    expect(loadDraft(esai.slug)).not.toBeNull();

    await run().result;
    expect(loadDraft(esai.slug)).toBeNull();
  });

  it("reads the document again, so a document shortened since the page opened is refused", async () => {
    const { store, result } = run({ documents: docs({ content: textOf(100) }) });
    const out = await result;
    expect(out).toMatchObject({ kind: "invalid" });
    expect(out.kind === "invalid" && out.problems[0].message).toContain(
      "kurang dari batas minimal 700",
    );
    expect(await store.list()).toEqual([]);
  });

  it("refuses a payment that is still pending, whatever the screen showed", async () => {
    const out = await run({
      registration: registration(esai.slug, { status: "menunggu-pembayaran" }),
    }).result;
    expect(out).toMatchObject({ kind: "invalid" });
  });

  it("refuses after the deadline passed while the page was open", async () => {
    const late = { ...esai, closesAt: Date.now() - 1 };
    const out = await run({ project: late }).result;
    expect(out.kind === "invalid" && out.problems.map((p) => p.field)).toEqual(["closed"]);
  });

  it("refuses the same document sent twice, even from a second tab", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ slug: esai.slug, docId: "d1", id: "old" }), 2);
    const out = await sendSubmission({
      project: esai,
      registration: registration(esai.slug),
      form,
      documents: docs(),
      store,
    });
    const messages = out.kind === "invalid" ? out.problems.map((p) => p.message) : [];
    expect(messages).toContain("Dokumen ini sudah dikirim ke proyek ini.");
    expect(await store.list()).toHaveLength(1);
  });

  it("settles a race at the store: a second tab that passed the checks is still refused", async () => {
    const store = createMemorySubmissionStore();
    const racing = { ...store, list: async () => [] };
    await store.add(submission({ slug: esai.slug, docId: "other", id: "first" }), 1);
    const out = await sendSubmission({
      project: esai,
      registration: registration(esai.slug),
      form,
      documents: docs(),
      store: racing,
    });
    expect(out.kind === "invalid" && out.problems[0].field).toBe("limit");
  });

  it("reports a failed read or write as failed, not as a rule", async () => {
    const store = {
      list: async () => Promise.reject(new Error("idb")),
      add: async () => "ok" as const,
      update: async () => "ok" as const,
    };
    const out = await sendSubmission({
      project: esai,
      registration: registration(esai.slug),
      form,
      documents: docs(),
      store,
    });
    expect(out).toEqual({ kind: "failed" });
  });
});
