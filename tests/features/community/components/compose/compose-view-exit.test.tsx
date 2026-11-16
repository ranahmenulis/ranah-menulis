import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import type { PostStore } from "@/features/community/storage/post-store";
import { ComposeView } from "@/features/community/components/compose/compose-view";

const holder = vi.hoisted(() => ({ store: null as unknown as PostStore }));
vi.mock("@/features/community/storage/store", () => ({
  get postStore() {
    return holder.store;
  },
}));

const doc: StudioDocument = {
  id: "d1",
  title: "Yang Ditunggu Nenek",
  version: 1,
  updatedAt: Date.now(),
  wordCount: 12,
  content: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Hujan pertama datang sore." }] },
      { type: "paragraph", content: [{ type: "text", text: "Nenek menunggu." }] },
    ],
  },
};
vi.mock("@/features/studio/storage/store", () => ({
  studioStore: {
    list: async () => [doc],
    listFolders: async () => [],
    get: async (id: string) => (id === doc.id ? doc : null),
  },
}));
const nav = vi.hoisted(() => ({ back: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => nav }));

installDialogShim();
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  holder.store = createMemoryPostStore();
  nav.back.mockReset();
  nav.push.mockReset();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function pickDocument() {
  render(
    <ToastProvider>
      <ComposeView draftId={null} />
    </ToastProvider>,
  );
  fireEvent.click(await screen.findByRole("tab", { name: "Dari dokumen Studio" }));
  fireEvent.click(await screen.findByRole("radio", { name: /Yang Ditunggu Nenek/ }));
  fireEvent.click(screen.getByRole("button", { name: "Pilih bagian dari dokumen ini" }));
  await screen.findByRole("group", { name: "Bagian dokumen" });
}

const publish = () => screen.getByRole("button", { name: "Terbitkan" }) as HTMLButtonElement;

function renderCompose() {
  return render(
    <ToastProvider>
      <ComposeView draftId={null} />
    </ToastProvider>,
  );
}

describe("ComposeView, ways out", () => {
  async function tickOne() {
    await pickDocument();
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
  }

  it("shows a labelled 'Tutup' button that closes straight away when nothing was changed", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    renderCompose();
    await screen.findByRole("tab", { name: "Tulis langsung" });
    const close = screen.getByRole("button", { name: "Tutup tanpa menerbitkan" });
    expect(close.textContent).toBe("Tutup");

    fireEvent.click(close);
    expect(nav.back).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks before closing a post with unsaved text", async () => {
    await tickOne();
    fireEvent.click(screen.getByRole("button", { name: "Tutup tanpa menerbitkan" }));
    expect(screen.getByRole("dialog", { name: "Tutup tanpa menerbitkan?" })).toBeTruthy();
    expect(nav.back).not.toHaveBeenCalled();
  });

  it("saves the draft and then leaves to where the author came from", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    await tickOne();
    fireEvent.click(screen.getByRole("button", { name: "Simpan sebagai draf" }));

    await waitFor(() => expect(nav.back).toHaveBeenCalledTimes(1));
    const [saved] = await holder.store.listPosts();
    expect(saved.status).toBe("draft");
    expect(await screen.findByText("Draf disimpan di perangkat ini.")).toBeTruthy();
  });

  it("falls back to Jelajahi when there is no page to go back to", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(1);
    await tickOne();
    fireEvent.click(screen.getByRole("button", { name: "Simpan sebagai draf" }));

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/jelajahi"));
    expect(nav.back).not.toHaveBeenCalled();
  });

  it("stays on the page with an error when the draft could not be saved", async () => {
    await tickOne();
    vi.spyOn(holder.store, "putPost").mockRejectedValue(new Error("full"));
    fireEvent.click(screen.getByRole("button", { name: "Simpan sebagai draf" }));

    expect(await screen.findByText("Draf belum tersimpan. Coba lagi.")).toBeTruthy();
    expect(nav.back).not.toHaveBeenCalled();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("closes a published post without asking, under the plain label 'Tutup'", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    await tickOne();
    fireEvent.change(screen.getByLabelText("Genre"), { target: { value: "Cerpen" } });
    fireEvent.click(screen.getByRole("radio", { name: /Publik/ }));
    fireEvent.click(publish());
    await screen.findByText("Postinganmu sudah terbit.");

    expect(screen.queryByRole("button", { name: "Kembali memilih bagian" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Tutup tanpa menerbitkan" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(nav.back).toHaveBeenCalledTimes(1);
  });

  it("closes the leave dialog before leaving, so coming back does not reopen it", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    await tickOne();
    fireEvent.click(screen.getByRole("button", { name: "Tutup tanpa menerbitkan" }));
    fireEvent.click(screen.getByRole("button", { name: "Buang" }));

    expect(nav.back).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
