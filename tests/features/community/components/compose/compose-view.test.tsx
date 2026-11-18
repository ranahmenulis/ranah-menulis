import {
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

const para = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
const longText = Array.from({ length: 300 }, () => "kata").join(" ");

const doc = (over: Partial<StudioDocument>): StudioDocument => ({
  id: "d1",
  title: "Yang Ditunggu Nenek",
  version: 1,
  updatedAt: Date.now(),
  wordCount: 12,
  content: { type: "doc", content: [para("Hujan pertama datang sore."), para("Nenek menunggu.")] },
  ...over,
});

const docs = vi.hoisted(() => ({ list: [] as StudioDocument[] }));
vi.mock("@/features/studio/storage/store", () => ({
  studioStore: {
    list: async () => docs.list,
    listFolders: async () => [],
    get: async (id: string) => docs.list.find((d) => d.id === id) ?? null,
  },
}));
const nav = vi.hoisted(() => ({ back: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => nav }));

installDialogShim();
// Several jsdom files run at once; the editor and stores can be slow to settle under load.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  holder.store = createMemoryPostStore();
  docs.list = [doc({})];
  nav.back.mockReset();
  nav.push.mockReset();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCompose() {
  return render(
    <ToastProvider>
      <ComposeView draftId={null} />
    </ToastProvider>,
  );
}

async function pickDocument() {
  renderCompose();
  fireEvent.click(await screen.findByRole("tab", { name: "Dari dokumen Studio" }));
  fireEvent.click(await screen.findByRole("radio", { name: /Yang Ditunggu Nenek/ }));
  fireEvent.click(screen.getByRole("button", { name: "Pilih bagian dari dokumen ini" }));
  await screen.findByRole("group", { name: "Bagian dokumen" });
}

const publish = () => screen.getByRole("button", { name: "Terbitkan" }) as HTMLButtonElement;

describe("ComposeView, from a Studio document", () => {
  it("shares nothing by default and always shows the notice that only this text becomes public", async () => {
    await pickDocument();
    for (const box of screen.getAllByRole("checkbox")) {
      expect((box as HTMLInputElement).checked).toBe(false);
    }
    expect(screen.getByText(/Yang menjadi publik hanya teks ini/)).toBeTruthy();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("starts the post title from the document title", async () => {
    await pickDocument();
    expect((screen.getByLabelText("Judul postingan") as HTMLInputElement).value).toBe(
      "Yang Ditunggu Nenek",
    );
  });

  it("has no visibility selected, and Terbitkan stays disabled until one is chosen", async () => {
    await pickDocument();
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.change(screen.getByLabelText("Genre"), { target: { value: "Cerpen" } });
    for (const radio of screen.getAllByRole("radio", { name: /Publik|Grup Penulis Pesisir/ })) {
      expect((radio as HTMLInputElement).checked).toBe(false);
    }
    expect(publish().disabled).toBe(true);
    expect(screen.getByText(/lengkapi pilihan siapa yang bisa membaca/)).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: /Publik/ }));
    expect(publish().disabled).toBe(false);
  });

  it("previews exactly the ticked text", async () => {
    await pickDocument();
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    const preview = screen.getByRole("region", { name: "Pratinjau untuk pembaca" });
    expect(within(preview).getByText("Nenek menunggu.")).toBeTruthy();
    expect(within(preview).queryByText("Hujan pertama datang sore.")).toBeNull();
  });

  it("previews and stores a group-only excerpt under the selected membership", async () => {
    await pickDocument();
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.change(screen.getByLabelText("Genre"), { target: { value: "Cerpen" } });
    fireEvent.click(screen.getByRole("radio", { name: /Grup Penulis Pesisir/ }));
    const preview = screen.getByRole("region", { name: "Pratinjau untuk pembaca" });
    expect(within(preview).getByText(/hanya bagian ini yang dibagikan ke grup/)).toBeTruthy();

    fireEvent.click(publish());
    await screen.findByText(/Anggota Grup Penulis Pesisir bisa membacanya/);
    const [stored] = await holder.store.listPosts();
    expect(stored).toMatchObject({
      visibility: "grup",
      groupId: "penulis-pesisir",
      groupMembershipId: "pesisir:rinjani-putri",
      blocks: [{ type: "paragraph", text: "Hujan pertama datang sore." }],
    });
  });

  it("publishes a copy of the ticked text, leaves the document alone, and shows the success page", async () => {
    await pickDocument();
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.change(screen.getByLabelText("Genre"), { target: { value: "Cerpen" } });
    fireEvent.click(screen.getByRole("radio", { name: /Publik/ }));
    fireEvent.click(publish());

    await screen.findByText("Postinganmu sudah terbit.");
    expect(screen.getByText(/tetap pribadi di Studio/)).toBeTruthy();
    const [stored] = await holder.store.listPosts();
    expect(stored).toMatchObject({
      status: "published",
      visibility: "publik",
      sourceTitle: "Yang Ditunggu Nenek",
      blocks: [{ type: "paragraph", text: "Hujan pertama datang sore." }],
    });
    expect(docs.list[0].content.content).toHaveLength(2);
  });

  it("turns the counter red above 500 words, keeps all the text, and blocks Terbitkan", async () => {
    docs.list = [
      doc({
        content: { type: "doc", content: [para(longText), para(longText)] },
        wordCount: 600,
      }),
    ];
    await pickDocument();
    for (const box of screen.getAllByRole("checkbox")) fireEvent.click(box);
    fireEvent.change(screen.getByLabelText("Genre"), { target: { value: "Cerpen" } });
    fireEvent.click(screen.getByRole("radio", { name: /Publik/ }));

    expect(screen.getAllByText(/Lebih 100 kata dari batas 500/).length).toBeGreaterThan(0);
    expect(publish().disabled).toBe(true);
    const draft = screen.getByRole("button", { name: "Simpan sebagai draf" }) as HTMLButtonElement;
    expect(draft.disabled).toBe(false);

    fireEvent.click(draft);
    await waitFor(async () => expect(await holder.store.listPosts()).toHaveLength(1));
    const [saved] = await holder.store.listPosts();
    expect(saved.status).toBe("draft");
    expect(saved.blocks).toHaveLength(2);
  });
});

describe("ComposeView, without Studio documents", () => {
  it("says so in one sentence and offers to write directly", async () => {
    docs.list = [];
    renderCompose();
    fireEvent.click(await screen.findByRole("tab", { name: "Dari dokumen Studio" }));
    await screen.findByText("Belum ada tulisan di Studio yang bisa dipilih.");
    fireEvent.click(screen.getByRole("button", { name: "Tulis langsung" }));
    expect(screen.getByRole("tab", { name: "Tulis langsung" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});

function renderFrom(sourceDocId: string) {
  return render(
    <ToastProvider>
      <ComposeView draftId={null} sourceDocId={sourceDocId} />
    </ToastProvider>,
  );
}

describe("ComposeView, opened from Bagikan in the editor", () => {
  it("opens on the chosen document's parts with nothing ticked and the public-text notice", async () => {
    renderFrom("d1");
    await screen.findByRole("group", { name: "Bagian dokumen" });

    expect(
      screen.getByRole("tab", { name: "Dari dokumen Studio" }).getAttribute("aria-selected"),
    ).toBe("true");
    for (const box of screen.getAllByRole("checkbox")) {
      expect((box as HTMLInputElement).checked).toBe(false);
    }
    expect(screen.getByText(/Yang menjadi publik hanya teks ini/)).toBeTruthy();
    expect(publish().disabled).toBe(true);
    expect((screen.getByLabelText("Judul postingan") as HTMLInputElement).value).toBe(
      "Yang Ditunggu Nenek",
    );
  });

  it("falls back to the document picker with a notice when the document is in Sampah", async () => {
    docs.list = [doc({ deletedAt: Date.now() })];
    renderFrom("d1");
    await screen.findByText(/tidak ditemukan atau sudah ada di Sampah/);
    expect(screen.getByText("Pilih dokumen Studio")).toBeTruthy();
  });

  it("falls back with a notice when the document does not exist", async () => {
    renderFrom("hilang");
    await screen.findByText(/tidak ditemukan atau sudah ada di Sampah/);
  });

  it("falls back with a notice when nothing is written in the document", async () => {
    docs.list = [doc({ wordCount: 0, content: { type: "doc", content: [{ type: "paragraph" }] } })];
    renderFrom("d1");
    await screen.findByText(/belum ada isinya/);
    expect(screen.getByText("Pilih dokumen Studio")).toBeTruthy();
  });

  it("starts a blank post when no document is named", async () => {
    renderCompose();
    expect(
      (await screen.findByRole("tab", { name: "Tulis langsung" })).getAttribute("aria-selected"),
    ).toBe("true");
  });
});

describe("ComposeView, reopening a draft", () => {
  it("tells the author when the source document has been moved to Sampah", async () => {
    docs.list = [doc({ deletedAt: Date.now() })];
    await holder.store.putPost({
      id: "draf-1",
      status: "draft",
      title: "Hujan Pertama",
      kind: "prolog",
      genre: "Cerpen",
      blocks: [{ type: "paragraph", text: "Hujan pertama datang sore." }],
      sourceTitle: "Yang Ditunggu Nenek",
      sourceDocId: "d1",
      visibility: null,
      updatedAt: Date.now(),
    });
    render(
      <ToastProvider>
        <ComposeView draftId="draf-1" />
      </ToastProvider>,
    );
    await screen.findByText(/sudah dipindahkan ke Sampah/);
    expect(screen.getByText("Draf")).toBeTruthy();
    expect(publish().disabled).toBe(true); // visibility is still unchosen
  });

  it("explains a draft that is not on this device", async () => {
    render(
      <ToastProvider>
        <ComposeView draftId="hilang" />
      </ToastProvider>,
    );
    await screen.findByText("Draf ini tidak ada di perangkat ini.");
  });
});
