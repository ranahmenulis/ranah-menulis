import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { sendRevision } from "@/features/projects/revise-flow";
import { sendSubmission } from "@/features/projects/submit-flow";
import { freezeFile } from "@/features/projects/submission-freeze";
import { loadDraft, saveDraft } from "@/features/projects/submission-draft";
import {
  emptyForm,
  validateSubmission,
  type SubmitForm,
} from "@/features/projects/submission-model";
import { uploadDocId, type VersionFile } from "@/features/projects/submission-types";
import type { FileStore } from "@/lib/files/file-store";
import { createMemoryFileStore } from "@/lib/files/memory-file-store";
import { saveUpload } from "@/lib/files/save-upload";
import { project, registration, submission } from "./helpers";

const solo = project("solo-penerbitan-buku-sendiri", Date.now());
const esai = project("lomba-esai-literasi-remaja", Date.now());
const PDF = (text: string) => new File([`%PDF-1.7 ${text}`], "naskah.pdf");
const noDocs = { get: vi.fn(async () => null) };

async function stored(files: FileStore, text = "isi satu") {
  const saved = await saveUpload(PDF(text), "manuscript", files);
  if (!saved.ok) throw new Error(saved.message);
  const { id, name, type, size } = saved.file;
  return { fileId: id, name, type, size } satisfies VersionFile;
}

const formWith = (upload: VersionFile | null, over: Partial<SubmitForm> = {}): SubmitForm => ({
  ...emptyForm,
  upload,
  title: "Buku Pertamaku",
  genre: "Novel",
  synopsis: "Sinopsis singkat.",
  agreed: true,
  ...over,
});

beforeEach(() => localStorage.clear());

describe("saveUpload", () => {
  it("keeps a real PDF with the type found in its bytes", async () => {
    const files = createMemoryFileStore();
    const saved = await saveUpload(PDF("a"), "manuscript", files);
    expect(saved).toMatchObject({
      ok: true,
      file: { name: "naskah.pdf", type: "application/pdf" },
    });
  });

  it("refuses a file that is not a PDF or DOCX even when named like one", async () => {
    const saved = await saveUpload(
      new File(["<html></html>"], "naskah.docx"),
      "manuscript",
      createMemoryFileStore(),
    );
    expect(saved).toEqual({ ok: false, message: "Pilih berkas PDF atau DOCX." });
  });
});

describe("an uploaded manuscript in the form rules", () => {
  const rules = (form: SubmitForm, p = solo, sent = []) =>
    validateSubmission({ project: p, form, doc: null, sent, now: Date.now() }).map(
      (problem) => problem.message,
    );

  it("takes the file instead of a Studio document, with no word range", async () => {
    const upload = await stored(createMemoryFileStore());
    expect(rules(formWith(upload))).toEqual([]);
  });

  it("asks for a document or a file when there is neither, for Solo", () => {
    expect(rules(formWith(null))).toEqual(["Pilih dokumen dari Studio atau unggah berkas."]);
  });

  it("refuses a file for a project that only takes Studio documents", async () => {
    const upload = await stored(createMemoryFileStore());
    expect(rules(formWith(upload, { genre: "Esai" }), esai)).toContain(
      "Proyek ini hanya menerima dokumen dari Studio.",
    );
  });

  it("does not let the same file be sent to a project twice", async () => {
    const upload = await stored(createMemoryFileStore());
    const sent = [submission({ slug: solo.slug, docId: uploadDocId(upload.fileId) })];
    expect(rules(formWith(upload), solo, sent as never)).toContain(
      "Berkas ini sudah dikirim ke proyek ini.",
    );
  });
});

describe("the draft keeps the file reference", () => {
  it("brings the uploaded file back when the form is opened again", async () => {
    const upload = await stored(createMemoryFileStore());
    saveDraft(solo.slug, formWith(upload));
    expect(loadDraft(solo.slug)?.upload).toEqual(upload);
  });
});

describe("sending an uploaded manuscript", () => {
  it("freezes the bytes of the file: no text, a hash of the file, the file attached", async () => {
    const files = createMemoryFileStore();
    const store = createMemorySubmissionStore();
    const upload = await stored(files);
    const result = await sendSubmission({
      project: solo,
      registration: registration(solo.slug),
      form: formWith(upload),
      documents: noDocs,
      store,
      files,
    });
    expect(result.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved).toMatchObject({ docId: uploadDocId(upload.fileId), docTitle: "naskah.pdf" });
    expect(saved.versions[0]).toMatchObject({ wordCount: 0, file: upload });
    expect(saved.versions[0].hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("says so when the file is no longer on the device, and stores nothing", async () => {
    const store = createMemorySubmissionStore();
    const upload = await stored(createMemoryFileStore());
    const result = await sendSubmission({
      project: solo,
      registration: registration(solo.slug),
      form: formWith(upload),
      documents: noDocs,
      store,
      files: createMemoryFileStore(),
    });
    expect(result).toMatchObject({
      kind: "invalid",
      problems: [{ field: "doc", message: expect.stringContaining("tidak ditemukan") }],
    });
    expect(await store.list()).toEqual([]);
  });
});

describe("revising with a file", () => {
  async function setup() {
    const files = createMemoryFileStore();
    const store = createMemorySubmissionStore();
    const first = await stored(files, "versi satu");
    const now = Date.now();
    await store.add(
      submission({
        id: "s1",
        slug: solo.slug,
        genre: "Novel",
        synopsis: "Sinopsis.",
        docId: uploadDocId(first.fileId),
        docTitle: first.name,
        status: "perlu-revisi",
        statusLog: [
          { status: "terkirim", at: now - 3 * 86_400_000, by: "sistem" },
          {
            status: "perlu-revisi",
            at: now - 86_400_000,
            by: "editor",
            reason: "Perbaiki bab satu.",
            dueAt: now + 6 * 86_400_000,
          },
        ],
        versions: [freezeFile(first, new TextEncoder().encode("%PDF-1.7 versi satu"), now - 1)],
      }),
      5,
    );
    return { files, store };
  }

  it("adds a version for a new file and keeps the old one", async () => {
    const { files, store } = await setup();
    const second = await stored(files, "versi dua");
    const [work] = await store.list();
    const result = await sendRevision({
      project: solo,
      submission: work,
      docId: null,
      upload: second,
      note: "Sudah diperbaiki.",
      documents: noDocs,
      store,
      files,
    });
    expect(result.kind).toBe("sent");
    const [revised] = await store.list();
    expect(revised.status).toBe("revisi-terkirim");
    expect(revised.versions.map((v) => v.version)).toEqual([1, 2]);
    expect(revised.versions[1].file).toEqual(second);
  });

  it("refuses the same file as the latest version", async () => {
    const { files, store } = await setup();
    const [work] = await store.list();
    const same = work.versions[0].file as VersionFile;
    const result = await sendRevision({
      project: solo,
      submission: work,
      docId: null,
      upload: same,
      note: "",
      documents: noDocs,
      store,
      files,
    });
    expect(result).toMatchObject({
      kind: "invalid",
      problems: [{ message: expect.stringContaining("sama dengan versi terakhir") }],
    });
  });
});
