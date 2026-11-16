import { describe, expect, it } from "vitest";
import { freezeVersion } from "@/features/projects/submission-freeze";
import {
  activeSubmissions,
  emptyForm,
  genreOptions,
  kirimHref,
  newSubmission,
  submitAction,
  submitBlock,
  validateSubmission,
  type SubmitForm,
} from "@/features/projects/submission-model";
import { NOW, project, registration, submission, textOf } from "./helpers";

const DAY = 24 * 60 * 60 * 1000;
const esai = project("lomba-esai-literasi-remaja");
const cerpen = project("lomba-cerpen-hujan-2026");
const solo = project("solo-penerbitan-buku-sendiri");

const doc = (words: number, over = {}) => ({
  id: "d1",
  title: "Esai",
  content: textOf(words),
  ...over,
});
const form = (over: Partial<SubmitForm> = {}): SubmitForm => ({
  ...emptyForm,
  docId: "d1",
  title: "Buku yang Mengubahku",
  genre: "Esai",
  agreed: true,
  ...over,
});
const messages = (input: Parameters<typeof validateSubmission>[0]) =>
  validateSubmission(input).map((p) => `${p.field}: ${p.message}`);
const base = { project: esai, form: form(), doc: doc(800), sent: [], now: NOW };

describe("kirimHref", () => {
  it("points at the project's send page, with the document when one is chosen", () => {
    expect(kirimHref("a")).toBe("/projects/a/kirim");
    expect(kirimHref("a", "d 1")).toBe("/projects/a/kirim?dokumen=d%201");
  });
});

describe("submitBlock", () => {
  const open = {
    project: esai,
    guest: false,
    registration: registration(esai.slug),
    now: NOW,
    sent: 0,
  };

  it("lets a registered, active participant send", () => {
    expect(submitBlock(open)).toBeNull();
  });

  it("names the first thing in the way, in order", () => {
    const kelas = project("kelas-cerpen-untuk-pemula");
    expect(submitBlock({ ...open, project: kelas })).toBe("tidak-menerima");
    expect(submitBlock({ ...open, guest: true })).toBe("tamu");
    expect(submitBlock({ ...open, registration: undefined })).toBe("belum-terdaftar");
    const waiting = registration(esai.slug, { status: "menunggu-pembayaran" });
    expect(submitBlock({ ...open, registration: waiting })).toBe("menunggu-pembayaran");
    expect(submitBlock({ ...open, now: esai.closesAt! + 1 })).toBe("ditutup");
    expect(submitBlock({ ...open, sent: 1 })).toBe("batas-tercapai");
  });

  it("allows up to the limit, so a two-work project takes a second", () => {
    const two = { ...open, project: cerpen, registration: registration(cerpen.slug) };
    expect(submitBlock({ ...two, sent: 1 })).toBeNull();
    expect(submitBlock({ ...two, sent: 2 })).toBe("batas-tercapai");
  });

  it("never closes Solo, which has no deadline", () => {
    expect(solo.closesAt).toBeNull();
    const later = { ...open, project: solo, registration: registration(solo.slug) };
    expect(submitBlock({ ...later, now: NOW + 900 * DAY })).toBeNull();
  });

  it("keeps sending open through the last moment of the deadline day", () => {
    expect(submitBlock({ ...open, now: esai.closesAt! })).toBeNull();
  });
});

describe("submitAction", () => {
  it("offers the send button, or says why not, and leaves the other blocks to registration", () => {
    expect(submitAction(null)).toEqual({ label: "Kirim karya", enabled: true });
    expect(submitAction("ditutup")).toEqual({ label: "Pengiriman ditutup", enabled: false });
    expect(submitAction("batas-tercapai")).toEqual({
      label: "Batas karya tercapai",
      enabled: false,
    });
    expect(submitAction("menunggu-pembayaran")).toBeNull();
    expect(submitAction("tamu")).toBeNull();
  });
});

describe("validateSubmission", () => {
  it("passes a complete form inside the word range", () => {
    expect(messages(base)).toEqual([]);
    expect(messages({ ...base, doc: doc(700) })).toEqual([]);
    expect(messages({ ...base, doc: doc(1200) })).toEqual([]);
  });

  it("checks the words against the project's range, with the real numbers", () => {
    expect(messages({ ...base, doc: doc(699) })).toEqual([
      "doc: Naskahmu 699 kata, kurang dari batas minimal 700 kata.",
    ]);
    expect(messages({ ...base, doc: doc(1201) })).toEqual([
      "doc: Naskahmu 1.201 kata, melebihi batas 1.200 kata.",
    ]);
  });

  it("refuses an empty document, a missing one, a trashed one, and none chosen", () => {
    const gone = "doc: Dokumen ini tidak ada lagi di Studio.";
    expect(messages({ ...base, doc: doc(0) })).toEqual(["doc: Dokumen ini masih kosong."]);
    expect(messages({ ...base, doc: null })).toEqual([gone]);
    expect(messages({ ...base, doc: doc(800, { deletedAt: 5 }) })).toEqual([gone]);
    expect(messages({ ...base, form: form({ docId: null }), doc: null })).toEqual([
      "doc: Pilih dokumen dari Studio.",
    ]);
  });

  it("refuses the same document twice, but not a different one", () => {
    const sent = [submission({ slug: esai.slug, docId: "d1" })];
    expect(messages({ ...base, sent })).toContain("doc: Dokumen ini sudah dikirim ke proyek ini.");
    const other = [submission({ slug: cerpen.slug, docId: "other" })];
    expect(messages({ ...base, project: cerpen, doc: doc(1000), sent: other })).toEqual([]);
  });

  it("reports the limit and the deadline as their own rules", () => {
    const sent = [submission({ slug: esai.slug, docId: "x" })];
    expect(messages({ ...base, sent })).toContain(
      "limit: Kamu sudah mengirim 1 karya, batas untuk proyek ini.",
    );
    expect(messages({ ...base, now: esai.closesAt! + 1 })).toEqual([
      "closed: Pengiriman ke proyek ini sudah ditutup.",
    ]);
  });

  it("needs a title, a genre from the list, and the statement", () => {
    const empty = form({ title: "   ", genre: "", agreed: false });
    expect(messages({ ...base, form: empty })).toEqual([
      "title: Isi judul karya.",
      "genre: Pilih genre.",
      "agreed: Setujui pernyataan keaslian karya.",
    ]);
    expect(messages({ ...base, form: form({ genre: "Komik" }) })).toEqual(["genre: Pilih genre."]);
  });

  it("limits the title and the note by length, trimmed", () => {
    expect(messages({ ...base, form: form({ title: "a".repeat(121) }) })).toEqual([
      "title: Judul maksimal 120 karakter.",
    ]);
    expect(messages({ ...base, form: form({ title: `  ${"a".repeat(120)}  ` }) })).toEqual([]);
    expect(messages({ ...base, form: form({ note: "a".repeat(501) }) })).toEqual([
      "note: Catatan maksimal 500 karakter.",
    ]);
    expect(messages({ ...base, form: form({ note: "" }) })).toEqual([]);
  });

  it("asks Solo for a kind of book and a synopsis instead of a genre", () => {
    const soloBase = { ...base, project: solo, doc: doc(20000) };
    expect(genreOptions(solo)).toContain("Kumpulan puisi");
    expect(genreOptions(esai)).toContain("Cerpen");
    expect(messages({ ...soloBase, form: form({ genre: "Cerpen" }) })).toEqual([
      "genre: Pilih jenis buku.",
      "synopsis: Isi sinopsis.",
    ]);
    const complete = form({ genre: "Novel", synopsis: "Kisah satu keluarga." });
    expect(messages({ ...soloBase, form: complete })).toEqual([]);
    expect(messages({ ...base, form: form({ synopsis: "" }) })).toEqual([]);
  });

  it("says plainly that a project without rules takes no work", () => {
    const kelas = project("kelas-cerpen-untuk-pemula");
    expect(messages({ ...base, project: kelas })).toEqual([
      "limit: Proyek ini tidak menerima kiriman karya.",
    ]);
  });
});

describe("activeSubmissions and newSubmission", () => {
  it("counts only this project's works, and a withdrawn one frees its place", () => {
    const list = [
      submission({ id: "a", slug: "x" }),
      submission({ id: "b", slug: "y" }),
      submission({ id: "c", slug: "x", status: "ditarik" }),
    ];
    expect(activeSubmissions(list, "x").map((s) => s.id)).toEqual(["a"]);
  });

  it("records a sent work as Terkirim, with the change logged and the copy frozen", () => {
    const version = freezeVersion(textOf(3), NOW);
    const made = newSubmission({
      id: "n1",
      project: esai,
      registration: registration(esai.slug),
      form: form({ title: "  Judul  ", note: " catatan " }),
      doc: doc(3, { title: "  " }),
      version,
      now: NOW,
    });
    expect(made).toMatchObject({
      id: "n1",
      slug: esai.slug,
      title: "Judul",
      note: "catatan",
      docId: "d1",
      docTitle: "Tanpa judul",
      status: "terkirim",
      originalityAgreedAt: NOW,
      synopsis: undefined,
      packageName: undefined,
    });
    expect(made.statusLog).toEqual([{ status: "terkirim", at: NOW, by: "sistem" }]);
    expect(made.versions).toEqual([version]);
  });

  it("keeps the Solo package and synopsis", () => {
    const made = newSubmission({
      id: "n2",
      project: solo,
      registration: registration(solo.slug, { packageName: "Penerbitan Penuh" }),
      form: form({ genre: "Novel", synopsis: " Kisah. " }),
      doc: doc(20000),
      version: freezeVersion(textOf(20000), NOW),
      now: NOW,
    });
    expect(made).toMatchObject({ packageName: "Penerbitan Penuh", synopsis: "Kisah." });
  });
});
