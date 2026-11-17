import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { VersionHistoryDrawer } from "@/features/studio/components/version-history-drawer";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import type { DocumentVersion } from "@/features/studio/versions";
import { installDialogShim } from "@/test/dialog-shim";

beforeAll(installDialogShim);
afterEach(cleanup);

const text = (value: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: value }] }],
});

const NOW = Date.now();
const versions: DocumentVersion[] = [
  {
    id: "d:v3",
    docId: "d",
    savedAt: NOW - 3 * 60_000,
    title: "Surat",
    content: text("Terbaru"),
    wordCount: 320,
    reason: "berkala",
  },
  {
    id: "d:v2",
    docId: "d",
    savedAt: NOW - 40 * 60_000,
    title: "Surat lama",
    content: text("Dulu sekali"),
    wordCount: 900,
    reason: "pelindung",
  },
];

function storeWith(list: () => Promise<DocumentVersion[]>) {
  return { listVersions: vi.fn(list) } as unknown as DocumentStore;
}

function setup(
  over: { store?: DocumentStore; onRestore?: (v: DocumentVersion) => Promise<boolean> } = {},
) {
  const onRestore = over.onRestore ?? vi.fn(async () => true);
  const onClose = vi.fn();
  render(
    <VersionHistoryDrawer
      open
      onClose={onClose}
      store={over.store ?? storeWith(async () => versions)}
      docId="d"
      currentWords={300}
      onRestore={onRestore}
    />,
  );
  return { onRestore, onClose };
}

describe("VersionHistoryDrawer", () => {
  it("lists the versions with their size against the text now and why they were kept", async () => {
    setup();
    const list = await screen.findByRole("list", { name: "Versi tersimpan" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain("3 menit lalu");
    expect(items[0].textContent).toContain("320 kata · +20 kata dari sekarang");
    expect(items[0].textContent).toContain("Otomatis");
    expect(items[1].textContent).toContain("900 kata · +600 kata dari sekarang");
    expect(items[1].textContent).toContain("Sebelum banyak teks terhapus");
  });

  it("says so when nothing is kept yet", async () => {
    setup({ store: storeWith(async () => []) });
    expect(await screen.findByText("Belum ada versi tersimpan.")).toBeTruthy();
    expect(screen.getByText(/disimpan selama 3 hari/)).toBeTruthy();
  });

  it("shows an error with a retry that loads again", async () => {
    const list = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(versions);
    setup({ store: { listVersions: list } as unknown as DocumentStore });
    expect(await screen.findByRole("alert")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByRole("list", { name: "Versi tersimpan" })).toBeTruthy();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("previews the chosen version without changing anything", async () => {
    const { onRestore } = setup();
    expect(await screen.findByText(/Pilih satu versi/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /40 menit lalu/ }));

    const preview = screen.getByRole("region", { name: "Isi versi" });
    expect(within(preview).getByText("Surat lama")).toBeTruthy();
    expect(within(preview).getByText("Dulu sekali")).toBeTruthy();
    expect(onRestore).not.toHaveBeenCalled();
  });

  it("asks before restoring, then restores the chosen version", async () => {
    const { onRestore } = setup();
    fireEvent.click(await screen.findByRole("button", { name: /40 menit lalu/ }));
    fireEvent.click(screen.getByRole("button", { name: "Pulihkan versi ini" }));

    expect(screen.getByRole("dialog", { name: "Pulihkan versi ini?" })).toBeTruthy();
    expect(onRestore).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Pulihkan" }));
    await waitFor(() => expect(onRestore).toHaveBeenCalledWith(versions[1]));
  });

  it("stays open and explains when the restore did not work", async () => {
    setup({ onRestore: vi.fn(async () => false) });
    fireEvent.click(await screen.findByRole("button", { name: /3 menit lalu/ }));
    fireEvent.click(screen.getByRole("button", { name: "Pulihkan versi ini" }));
    fireEvent.click(screen.getByRole("button", { name: "Pulihkan" }));

    expect(await screen.findByText(/Versi belum bisa dipulihkan/)).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "Pulihkan versi ini?" })).toBeTruthy();
  });

  it("does not look for versions of a draft that is not stored", async () => {
    const store = storeWith(async () => versions);
    render(
      <VersionHistoryDrawer
        open
        onClose={() => {}}
        store={store}
        docId=""
        currentWords={0}
        onRestore={async () => true}
      />,
    );
    expect(await screen.findByText("Belum ada versi tersimpan.")).toBeTruthy();
    expect(store.listVersions).not.toHaveBeenCalled();
  });
});
