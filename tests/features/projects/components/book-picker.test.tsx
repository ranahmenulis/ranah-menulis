import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bookSource } from "@/features/studio/book-source";
import { SubmitDocumentPicker } from "@/features/projects/components/submit-document-picker";
import type { StudioDocument, StudioFolder } from "@/features/studio/storage/document-store";
import { textOf } from "../helpers";

afterEach(cleanup);

const folder: StudioFolder = { id: "b", name: "Pulang ke Pesisir", createdAt: 0, kind: "book" };
const chapter = (id: string, words: number): StudioDocument => ({
  id,
  title: id,
  content: textOf(words),
  wordCount: words,
  version: 1,
  updatedAt: 1,
  createdAt: 1,
  folderId: "b",
});

describe("SubmitDocumentPicker with a book", () => {
  it("lists the book with its chapters and words and lets it be picked", () => {
    const book = bookSource(folder, [chapter("c1", 1200), chapter("c2", 800)])!.doc;
    const onChange = vi.fn();
    render(
      <SubmitDocumentPicker
        docs={[book]}
        value={null}
        onChange={onChange}
        sentDocIds={new Set()}
      />,
    );

    expect(screen.getByText("Naskah buku · 2 bab · 2.000 kata")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Pulang ke Pesisir/ }));
    expect(onChange).toHaveBeenCalledWith(book);
  });

  it("does not let a book that was already sent be sent again", () => {
    const book = bookSource(folder, [chapter("c1", 100)])!.doc;
    render(
      <SubmitDocumentPicker
        docs={[book]}
        value={null}
        onChange={vi.fn()}
        sentDocIds={new Set([book.id])}
      />,
    );
    expect(screen.getByRole("radio", { name: /Pulang ke Pesisir/ }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(screen.getByText("Sudah dikirim ke proyek ini")).toBeTruthy();
  });
});
