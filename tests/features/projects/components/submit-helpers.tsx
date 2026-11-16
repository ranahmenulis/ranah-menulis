import { fireEvent, render, screen } from "@testing-library/react";
import { SubmitView } from "@/features/projects/components/submit-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { DocumentStore, StudioDocument } from "@/features/studio/storage/document-store";
import { registration, textOf } from "../helpers";

export const ESAI = "lomba-esai-literasi-remaja";
export const CERPEN = "lomba-cerpen-hujan-2026";

export function register(slug: string, over = {}) {
  const key = "ranah.registrations";
  const current = JSON.parse(localStorage.getItem(key) ?? "{}");
  current[slug] = registration(slug, over);
  localStorage.setItem(key, JSON.stringify(current));
}

export function studioDoc(id: string, title: string, words: number, over = {}): StudioDocument {
  return {
    id,
    title,
    content: textOf(words),
    wordCount: words,
    version: 1,
    updatedAt: 1000 - id.length,
    ...over,
  };
}

export function documentsOf(docs: StudioDocument[]): DocumentStore {
  return {
    list: async () => docs,
    listFolders: async () => [],
    get: async (id: string) => docs.find((d) => d.id === id) ?? null,
  } as unknown as DocumentStore;
}

export const docs = [
  studioDoc("d1", "Buku yang Mengubahku", 800),
  studioDoc("d2", "Terlalu Pendek", 100),
  studioDoc("d3", "Masih Kosong", 0),
  studioDoc("d4", "Sudah di Sampah", 900, { deletedAt: 5 }),
];

export type Opts = {
  slug?: string;
  documentId?: string | null;
  store?: SubmissionStore;
  documents?: DocumentStore;
};

export async function open({ slug = ESAI, documentId = null, store, documents }: Opts = {}) {
  const used = store ?? createMemorySubmissionStore();
  render(
    <SubmitView
      slug={slug}
      documentId={documentId}
      store={used}
      documents={documents ?? documentsOf(docs)}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  return used;
}

export const send = () => screen.getByRole("button", { name: "Kirim karya" });
export const field = (name: RegExp) => screen.getByLabelText(name) as HTMLInputElement;
export const pickDoc = (name: RegExp) => fireEvent.click(screen.getByRole("radio", { name }));
export const agree = () =>
  fireEvent.click(screen.getByRole("checkbox", { name: /karya saya sendiri/ }));
export const backLink = () => screen.getByRole("link", { name: /Kembali ke proyek/ });

export async function fillAndSend() {
  pickDoc(/Buku yang Mengubahku/);
  fireEvent.change(field(/Genre/), { target: { value: "Esai" } });
  agree();
  fireEvent.click(send());
}
