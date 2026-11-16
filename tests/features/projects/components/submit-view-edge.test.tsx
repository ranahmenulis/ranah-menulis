import { cleanup, configure, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { notifySubmissionsChanged } from "@/features/projects/storage/submission-events";
import { emptyForm, initialForm } from "@/features/projects/submission-model";
import { project, submission } from "../helpers";
import {
  agree,
  CERPEN,
  documentsOf,
  field,
  open,
  pickDoc,
  register,
  send,
  studioDoc,
} from "./submit-helpers";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

describe("SubmitView, starting over after a send", () => {
  it("does not choose the document from the address again for the next work", async () => {
    register(CERPEN);
    const documents = documentsOf([
      studioDoc("d1", "Hujan Pertama", 1200),
      studioDoc("d5", "Hujan Kedua", 1500),
    ]);
    await open({ slug: CERPEN, documentId: "d1", documents });
    fireEvent.change(field(/Genre/), { target: { value: "Cerpen" } });
    agree();
    fireEvent.click(send());
    fireEvent.click(await screen.findByRole("button", { name: "Kirim karya lain" }));

    await screen.findByText("Karya yang sudah kamu kirim");
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
    expect((field(/Judul karya/) as HTMLInputElement).value).toBe("");
    expect(screen.queryByText(/sudah dikirim ke proyek ini\./)).toBeNull();
  });
});

describe("SubmitView, the title follows the document", () => {
  it("follows a long document title that was cut at the limit when another is chosen", async () => {
    register(CERPEN);
    const long = "Judul sangat panjang ".repeat(10).trim();
    const documents = documentsOf([
      studioDoc("d1", long, 1200),
      studioDoc("d5", "Hujan Kedua", 1500),
    ]);
    await open({ slug: CERPEN, documents });
    pickDoc(/Judul sangat panjang/);
    expect((field(/Judul karya/) as HTMLInputElement).value).toHaveLength(120);

    pickDoc(/Hujan Kedua/);
    expect((field(/Judul karya/) as HTMLInputElement).value).toBe("Hujan Kedua");
  });

  it("keeps a title the participant wrote when another document is chosen", async () => {
    register(CERPEN);
    const documents = documentsOf([
      studioDoc("d1", "Hujan Pertama", 1200),
      studioDoc("d5", "Hujan Kedua", 1500),
    ]);
    await open({ slug: CERPEN, documents });
    pickDoc(/Hujan Pertama/);
    fireEvent.change(field(/Judul karya/), { target: { value: "Judul pilihanku" } });
    pickDoc(/Hujan Kedua/);
    expect((field(/Judul karya/) as HTMLInputElement).value).toBe("Judul pilihanku");
  });
});

describe("initialForm", () => {
  const cerpen = project(CERPEN);
  const docs = [
    { id: "A", title: "Cerita A", content: { type: "doc" } },
    { id: "B", title: "Cerita B", content: { type: "doc" } },
  ];
  const draft = { ...emptyForm, docId: "A", title: "Cerita A diedit", genre: "Cerpen" };

  it("brings the title of a different document named in the address, not the draft's", () => {
    const form = initialForm({ project: cerpen, draft, docs, documentId: "B" });
    expect(form).toMatchObject({ docId: "B", title: "Cerita B", genre: "Cerpen" });
  });

  it("keeps the typed title when the address names the draft's own document", () => {
    const form = initialForm({ project: cerpen, draft, docs, documentId: "A" });
    expect(form.title).toBe("Cerita A diedit");
  });

  it("keeps the draft as it was when the address names nothing", () => {
    const form = initialForm({ project: cerpen, draft, docs, documentId: null });
    expect(form).toMatchObject({ docId: "A", title: "Cerita A diedit" });
  });

  it("drops a document that is gone or in Sampah, and a genre the project does not offer", () => {
    const trashed = [{ ...docs[0], deletedAt: 5 }];
    const form = initialForm({
      project: cerpen,
      draft: { ...draft, genre: "Komik" },
      docs: trashed,
      documentId: null,
    });
    expect(form).toMatchObject({ docId: null, genre: "" });
  });
});

describe("SubmitView, when sent from another tab meanwhile", () => {
  it("shows the new limit after the submissions change", async () => {
    register(CERPEN);
    const store = createMemorySubmissionStore();
    await open({ slug: CERPEN, store, documents: documentsOf([studioDoc("d1", "Hujan", 1200)]) });
    expect(screen.getByText(/sudah mengirim 0 dari 2 karya/)).toBeTruthy();

    await store.add(submission({ id: "x", slug: CERPEN, docId: "z" }), 2);
    await store.add(submission({ id: "y", slug: CERPEN, docId: "w" }), 2);
    notifySubmissionsChanged();
    expect(
      await screen.findByText(/Kamu sudah mengirim 2 karya, batas untuk proyek ini/),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Kirim karya" })).toBeNull();
  });
});
