import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { StudioSearchDialog } from "@/features/studio/components/studio-search-dialog";
import { StudioTabs } from "@/features/studio/components/studio-tabs";
import { ArchiveList } from "@/features/studio/components/documents/archive-list";
import { DocumentClassificationDialog } from "@/features/studio/components/documents/document-classification-dialog";
import { TrashList } from "@/features/studio/components/documents/document-lists";
import { WorksList } from "@/features/studio/components/works/works-list";
import { PendingDialogs } from "@/features/studio/components/documents/pending-dialogs";
import { addDocumentTag } from "@/features/studio/document-classification";
import { studioSearchResults } from "@/features/studio/document-search";
import { dueLabel, targetLine, targetSummary } from "@/features/studio/document-targets";
import type { DocumentList } from "@/features/studio/hooks/use-document-list";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { studioDocuments as en } from "@/features/studio/copy/documents-en";
import { studioDocuments as id } from "@/features/studio/copy/documents-id";
import { studioSearch as searchEn } from "@/features/studio/copy/documents-search-en";
import { studioSearch as searchId } from "@/features/studio/copy/documents-search-id";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";
import { installDialogShim } from "@/test/dialog-shim";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/studio",
}));

beforeAll(installDialogShim);
afterEach(cleanup);

const english = (node: ReactNode) =>
  render(
    <I18nProvider locale="en" dictionary={dictionaries.en}>
      <ToastProvider>{node}</ToastProvider>
    </I18nProvider>,
  );

const doc = (
  docId: string,
  title: string,
  extra: Partial<StudioDocument> = {},
): StudioDocument => ({
  id: docId,
  title,
  content: { type: "doc", content: [] },
  wordCount: 120,
  version: 1,
  updatedAt: 1000,
  ...extra,
});

function listOf(docs: StudioDocument[]): DocumentList {
  return {
    status: "ready",
    loadedAt: 5000,
    docs,
    folders: [],
    reload: vi.fn(),
    rename: vi.fn(),
    updateClassification: vi.fn(),
    duplicateActive: vi.fn(),
    setArchived: vi.fn(),
    moveTo: vi.fn(),
    trash: vi.fn(),
    restore: vi.fn(),
    deleteForever: vi.fn(),
    createFolder: vi.fn(),
    renameFolder: vi.fn(),
    updateFolder: vi.fn(),
  };
}

function leaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  return Object.values(value as object).flatMap(leaves);
}

describe("dictionaries", () => {
  it("keeps the same keys and placeholders in both languages", () => {
    const keys = (value: object, prefix = ""): string[] =>
      Object.entries(value).flatMap(([key, v]) =>
        typeof v === "string" ? [prefix + key] : keys(v as object, `${prefix}${key}.`),
      );
    expect(keys(en)).toEqual(keys(id));
    expect(keys(searchEn)).toEqual(keys(searchId));
    const holes = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join();
    expect(leaves(en).map(holes)).toEqual(leaves(id).map(holes));
    expect(leaves(searchEn).map(holes)).toEqual(leaves(searchId).map(holes));
  });
});

describe("Dokumen tab in English", () => {
  it("translates the tabs", () => {
    english(<StudioTabs />);
    expect(screen.getByRole("link", { name: "Works" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Statistics" })).toBeTruthy();
  });

  it("writes document rows, kinds and the menu label in English", () => {
    const list = listOf([
      doc("a", "", { kind: "cerpen", tags: ["Rain"], wordCount: 1200 }),
      doc("b", "One word", { wordCount: 1 }),
    ]);
    english(
      <WorksList
        list={list}
        folderId={null}
        folderName={null}
        onOpenFolder={vi.fn()}
        onArchiveAction={vi.fn()}
        onPending={vi.fn()}
        sharedIds={new Set(["a"])}
        submittedIds={new Set(["a"])}
      />,
    );
    expect(screen.getByText("Untitled")).toBeTruthy();
    expect(screen.getByText("Short story")).toBeTruthy();
    expect(screen.getByText("Shared")).toBeTruthy();
    expect(screen.getByText("Sent to a project")).toBeTruthy();
    expect(screen.getByText(/Changed .* · 1,200 words/)).toBeTruthy();
    expect(screen.getByText(/Changed .* · 1 word$/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Document menu Untitled" })).toBeTruthy();
  });

  it("translates the empty states", () => {
    english(
      <WorksList
        list={listOf([])}
        folderId={null}
        folderName={null}
        onOpenFolder={vi.fn()}
        onArchiveAction={vi.fn()}
        onPending={vi.fn()}
      />,
    );
    expect(screen.getByText("Nothing written here yet.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start writing" })).toBeTruthy();
  });

  it("translates Sampah and Arsip lists", () => {
    const trashed = doc("t", "Gone", { deletedAt: 2000 });
    english(<TrashList list={listOf([trashed])} onPending={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Restore" })).toBeTruthy();
    expect(screen.getByText(/Moved .* · 120 words/)).toBeTruthy();
    cleanup();

    const archived = doc("r", "Old", { archivedAt: 2000 });
    english(
      <ArchiveList
        list={listOf([archived])}
        busy={false}
        onRestore={vi.fn()}
        onShowAll={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Restore Old" })).toBeTruthy();
    expect(screen.getByText(/Archived .* · 120 words/)).toBeTruthy();
  });

  it("translates the delete confirmation", () => {
    english(
      <PendingDialogs
        pending={{ kind: "delete", doc: doc("a", "") }}
        list={listOf([])}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Delete this document permanently?")).toBeTruthy();
    expect(screen.getByText(/“Untitled” and everything in it/)).toBeTruthy();
  });

  it("translates the classification dialog and its tag errors", () => {
    english(
      <DocumentClassificationDialog
        doc={doc("a", "Title")}
        onSave={vi.fn()}
        onSaved={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading", { name: "Type and tags" })).toBeTruthy();
    expect(screen.getByText("Temporary limit of 5 tags, 24 characters each.")).toBeTruthy();
    const select = screen.getByRole<HTMLSelectElement>("combobox", { name: /Document type/ });
    expect(Array.from(select.options).map((o) => o.value)).toContain("cerpen");
    expect(screen.getByRole("option", { name: "Short story" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("alert").textContent).toBe("Enter a tag name.");
  });
});

describe("search dialog in English", () => {
  it("translates the dialog and labels an untitled document", async () => {
    const store = {
      listSummaries: vi.fn(async () => [doc("u", "")]),
      listFolders: vi.fn(async () => []),
      get: vi.fn(async () => null),
    };
    english(<StudioSearchDialog onClose={vi.fn()} store={store} />);
    expect(screen.getByText("Type a document title or a folder name.")).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "untit" } });
    await waitFor(() => expect(screen.getByRole("option", { name: /Untitled/ })).toBeTruthy());
    expect(screen.getByRole("listbox", { name: "Search results" })).toBeTruthy();
  });
});

describe("pure functions with a locale", () => {
  it("keeps Indonesian output by default", () => {
    expect(addDocumentTag([], " ")).toMatchObject({ code: "empty", error: "Isi nama tag." });
    expect(dueLabel("2026-11-20", "2026-11-20")).toBe("tenggat hari ini");
    expect(dueLabel("2026-11-25", "2026-11-20")).toBe("5 hari lagi");
    expect(studioSearchResults([doc("u", "")], [], "tanpa")).toHaveLength(1);
  });

  it("writes English target and search text", () => {
    expect(dueLabel("2026-11-20", "2026-11-20", "en")).toBe("due today");
    expect(dueLabel("2026-11-21", "2026-11-20", "en")).toBe("due tomorrow");
    expect(dueLabel("2026-11-21", "2026-11-19", "en")).toBe("2 days left");
    expect(dueLabel("2026-11-19", "2026-11-20", "en")).toBe("1 day overdue");
    const target = { id: "t", words: 1000, due: "2026-11-25" };
    expect(targetLine(target, 320, "2026-11-20", "en")).toBe("320 / 1,000 words · 5 days left");
    expect(targetLine(target, 1200, "2026-11-20", "en")).toBe("1,000 / 1,000 words · reached");
    expect(targetLine(target, 320, "2026-11-20")).toBe("320 / 1.000 kata · 5 hari lagi");
    expect(targetSummary([target], 320, "2026-11-20", "en")).toBe(
      "320 / 1,000 words · 5 days left",
    );
    expect(studioSearchResults([doc("u", "")], [], "untitled", "en")).toHaveLength(1);
  });
});
