import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { emptyLog } from "@/features/studio/daily-progress";
import { StudioEditor } from "@/features/studio/components/studio-editor";
import { installDialogShim } from "@/test/dialog-shim";

const h = vi.hoisted(() => ({
  push: vi.fn(),
  updateMeta: vi.fn(),
  saveNow: vi.fn(),
  doc: { title: "Yang Ditunggu Nenek", words: 120, load: "ready" as "ready" | "loading" },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: h.push, back: vi.fn() }) }));
vi.mock("@/features/studio/storage/store", () => ({
  studioStore: { updateMeta: (...args: unknown[]) => h.updateMeta(...args) },
}));
vi.mock("@/features/projects/storage/store", async () => {
  const { createMemorySubmissionStore } =
    await import("@/features/projects/storage/memory-submission-store");
  return { submissionStore: createMemorySubmissionStore() };
});
vi.mock("@/features/studio/components/editor-canvas", () => ({ EditorCanvas: () => <div /> }));
vi.mock("@/features/studio/hooks/use-studio-document", () => ({
  useStudioDocument: () => ({
    load: h.doc.load,
    reload: vi.fn(),
    initial: { title: h.doc.title, content: { type: "doc", content: [] } },
    editorKey: 1,
    title: h.doc.title,
    setTitle: vi.fn(),
    words: h.doc.words,
    onContentChange: vi.fn(),
    status: "saved",
    savedAt: null,
    progress: emptyLog(),
    conflict: null,
    resolveConflict: vi.fn(),
    saveNow: h.saveNow,
    getId: () => "doc-1",
  }),
}));

beforeAll(installDialogShim);
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  h.push.mockReset();
  h.updateMeta.mockReset().mockResolvedValue({ id: "doc-1" });
  h.saveNow.mockReset().mockResolvedValue(true);
  h.doc.title = "Yang Ditunggu Nenek";
  h.doc.words = 120;
  h.doc.load = "ready";
  localStorage.clear();
});
afterEach(cleanup);

function renderEditor() {
  return render(
    <ToastProvider>
      <StudioEditor documentId="doc-1" />
    </ToastProvider>,
  );
}

const ESAI = "lomba-esai-literasi-remaja";
function registerEsai() {
  const registration = {
    slug: ESAI,
    registeredAt: 1,
    agreedAt: 1,
    termsVersion: "1",
    status: "terdaftar",
  };
  localStorage.setItem("ranah.registrations", JSON.stringify({ [ESAI]: registration }));
}

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: "Menu dokumen" }));
const bagikan = () => screen.getByRole("button", { name: "Bagikan" }) as HTMLButtonElement;

describe("StudioEditor, Bagikan", () => {
  it("opens a dialog that keeps the document Pribadi, without leaving the editor", () => {
    renderEditor();
    fireEvent.click(bagikan());

    expect(screen.getByRole("dialog", { name: "Bagikan sebagai postingan" })).toBeTruthy();
    expect(h.push).not.toHaveBeenCalled();
  });

  it("stores the text first, then opens Tulis postingan with this document chosen", async () => {
    renderEditor();
    fireEvent.click(bagikan());
    fireEvent.click(screen.getByRole("button", { name: "Pilih bagian untuk dibagikan" }));

    await waitFor(() => expect(h.push).toHaveBeenCalledWith("/tulis?dokumen=doc-1"));
    expect(h.saveNow).toHaveBeenCalledTimes(1);
    expect(h.saveNow.mock.invocationCallOrder[0]).toBeLessThan(h.push.mock.invocationCallOrder[0]);
  });

  it("closes the dialog when it hands over, so coming back to the editor does not reopen it", async () => {
    renderEditor();
    fireEvent.click(bagikan());
    fireEvent.click(screen.getByRole("button", { name: "Pilih bagian untuk dibagikan" }));

    await waitFor(() => expect(h.push).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Bagikan sebagai postingan" })).toBeNull(),
    );
  });

  it("does not leave when the text could not be stored", async () => {
    h.saveNow.mockResolvedValue(false);
    renderEditor();
    fireEvent.click(bagikan());
    fireEvent.click(screen.getByRole("button", { name: "Pilih bagian untuk dibagikan" }));

    await screen.findByText(/belum tersimpan di perangkat ini/);
    expect(h.push).not.toHaveBeenCalled();
  });

  it("is disabled, with the reason, while nothing is written", () => {
    h.doc.title = "";
    h.doc.words = 0;
    renderEditor();

    expect(bagikan().disabled).toBe(true);
    expect(bagikan().title).toBe("Tulis sesuatu dulu untuk dibagikan");
  });
});

describe("StudioEditor, Bagikan with only a title", () => {
  it("stays disabled until there is text, since there is nothing to pick from yet", () => {
    h.doc.title = "Hanya judul";
    h.doc.words = 0;
    renderEditor();
    expect(bagikan().disabled).toBe(true);
  });
});

describe("StudioEditor, menu", () => {
  it("opens the project picker from Kirim ke proyek, and says so when you have no project yet", async () => {
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Kirim ke proyek/ }));

    expect(screen.getByRole("dialog", { name: "Kirim ke proyek" })).toBeTruthy();
    expect(await screen.findByText(/belum terdaftar di proyek yang menerima karya/)).toBeTruthy();
  });

  it("offers nothing to send while the document has no text", () => {
    h.doc.words = 0;
    renderEditor();
    openMenu();
    expect(
      (screen.getByRole("menuitem", { name: /Kirim ke proyek/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("stores the text first, then opens the send page with this document chosen", async () => {
    registerEsai();
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Kirim ke proyek/ }));
    fireEvent.click(await screen.findByRole("radio", { name: /Esai Literasi/ }));
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));

    await waitFor(() =>
      expect(h.push).toHaveBeenCalledWith(`/projects/${ESAI}/kirim?dokumen=doc-1`),
    );
    expect(h.saveNow).toHaveBeenCalled();
  });

  it("stays and says so when the text cannot be stored before sending", async () => {
    h.saveNow.mockResolvedValue(false);
    registerEsai();
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Kirim ke proyek/ }));
    fireEvent.click(await screen.findByRole("radio", { name: /Esai Literasi/ }));
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));

    await screen.findByText(/belum tersimpan di perangkat ini/);
    expect(h.push).not.toHaveBeenCalled();
  });

  it("keeps Ekspor off until its format is decided", () => {
    renderEditor();
    openMenu();
    expect((screen.getByRole("menuitem", { name: /Ekspor/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("moves the document to Sampah after storing it, then returns to the Studio list", async () => {
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pindah ke sampah/ }));

    await waitFor(() => expect(h.push).toHaveBeenCalledWith("/studio"));
    expect(h.saveNow).toHaveBeenCalled();
    expect(h.updateMeta).toHaveBeenCalledWith("doc-1", { deletedAt: expect.any(Number) });
    await screen.findByText("Dokumen dipindah ke Sampah.");
  });

  it("Urungkan restores the document and opens it again", async () => {
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pindah ke sampah/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Urungkan" }));

    await waitFor(() => expect(h.push).toHaveBeenLastCalledWith("/studio/doc-1"));
    expect(h.updateMeta).toHaveBeenLastCalledWith("doc-1", { deletedAt: null });
  });

  it("stays in the editor and says so when the text cannot be stored first", async () => {
    h.saveNow.mockResolvedValue(false);
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pindah ke sampah/ }));

    await screen.findByText("Dokumen belum bisa dipindah. Coba lagi.");
    expect(h.updateMeta).not.toHaveBeenCalled();
    expect(h.push).not.toHaveBeenCalled();
  });

  it("stays in the editor when the document cannot be found to move", async () => {
    h.updateMeta.mockResolvedValue(null);
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pindah ke sampah/ }));

    await screen.findByText("Dokumen belum bisa dipindah. Coba lagi.");
    expect(h.push).not.toHaveBeenCalled();
  });

  it("offers nothing to move to Sampah while nothing is written", () => {
    h.doc.title = "";
    h.doc.words = 0;
    renderEditor();
    openMenu();
    expect(
      (screen.getByRole("menuitem", { name: /Pindah ke sampah/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("says so, and does not open the document, when Urungkan cannot restore it", async () => {
    renderEditor();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pindah ke sampah/ }));
    await screen.findByRole("button", { name: "Urungkan" });
    h.push.mockClear();
    h.updateMeta.mockRejectedValueOnce(new Error("idb"));

    fireEvent.click(screen.getByRole("button", { name: "Urungkan" }));

    await screen.findByText(/belum bisa dipulihkan/);
    expect(h.push).not.toHaveBeenCalled();
  });
});

describe("StudioEditor, back to Studio", () => {
  const back = () => screen.getByRole("button", { name: "Kembali ke Studio" });

  it("saves what was written, then opens the document list", async () => {
    renderEditor();
    fireEvent.click(back());

    await waitFor(() => expect(h.push).toHaveBeenCalledWith("/studio"));
    expect(h.saveNow.mock.invocationCallOrder[0]).toBeLessThan(h.push.mock.invocationCallOrder[0]);
  });

  it("stays and says why when the text could not be stored", async () => {
    h.saveNow.mockResolvedValue(false);
    renderEditor();
    fireEvent.click(back());

    await screen.findByText(/jadi belum bisa ditutup/);
    expect(h.push).not.toHaveBeenCalled();
  });

  it("is there while the document is still opening, so the writer is never stuck", () => {
    h.doc.load = "loading";
    renderEditor();
    expect(back()).toBeTruthy();
  });
});
