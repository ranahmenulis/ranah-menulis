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
import { installDialogShim } from "@/test/dialog-shim";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import type { PostStore } from "@/features/community/storage/post-store";
import { PostView } from "@/features/community/components/post/post-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/postingan/x",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
const holder = vi.hoisted(() => ({ store: null as unknown as PostStore }));
// A fresh store per test, so one test's marks and comments never leak into the next.
vi.mock("@/features/community/storage/store", () => ({
  get postStore() {
    return holder.store;
  },
}));

installDialogShim();
// Several jsdom files run at once; the editor and stores can be slow to settle under load.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  holder.store = createMemoryPostStore();
});
afterEach(cleanup);

function renderPost(id: string) {
  return render(
    <ToastProvider>
      <PostView postId={id} />
    </ToastProvider>,
  );
}

const POST = "hujan-pertama-bulan-november";
const menuOf = (name: string) =>
  within(screen.getByRole("menu", { name: `Lainnya untuk komentar ${name}`, hidden: true }));

const heading = () =>
  screen.findByRole("heading", { level: 1, name: "Hujan Pertama Bulan November" });

describe("PostView", () => {
  it("shows the label, the scope line, and the end marker of a prolog", async () => {
    renderPost(POST);
    await heading();
    expect(screen.getAllByText("Prolog · Cerpen").length).toBeGreaterThan(0);
    expect(screen.getByText(/hanya bagian ini yang publik/)).toBeTruthy();
    expect(screen.getByText("Akhir prolog.")).toBeTruthy();
  });

  it("counts comments from the list that can be opened", async () => {
    renderPost(POST);
    await heading();
    expect(screen.getAllByRole("link", { name: "Komentar 9" }).length).toBeGreaterThan(0);
  });

  it("appreciates once and remembers it", async () => {
    renderPost(POST);
    await heading();
    fireEvent.click(screen.getAllByRole("button", { name: "Apresiasi 86" })[0]);
    await screen.findAllByRole("button", { name: "Apresiasi 87" });
    expect((await holder.store.listMarks())[`ap:${POST}`]).toBe(true);
  });

  it("publishes a comment at the top and stores it", async () => {
    renderPost(POST);
    await heading();
    const send = screen.getByRole("button", { name: "Kirim" });
    expect((send as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Tulis komentar"), {
      target: { value: "Terima kasih sudah menulis ini." },
    });
    fireEvent.click(send);
    await screen.findByText("Terima kasih sudah menulis ini.");
    expect(await holder.store.listComments()).toHaveLength(1);
  });

  it("lets the author hide a comment and shows a quiet row in its place", async () => {
    renderPost(POST);
    await heading();
    fireEvent.click(
      screen.getAllByRole("button", { name: /Lainnya untuk komentar Aina Sofea/ })[0],
    );
    fireEvent.click(
      menuOf("Aina Sofea").getByRole("menuitem", { name: "Sembunyikan komentar", hidden: true }),
    );
    await screen.findByText(/Kamu menyembunyikan satu komentar/);
    expect(screen.queryByText(/Nenek saya pun begitu/)).toBeNull();
  });

  it("asks for confirmation before deleting a comment, and says it cannot be undone", async () => {
    renderPost(POST);
    await heading();
    fireEvent.click(
      screen.getAllByRole("button", { name: /Lainnya untuk komentar Aina Sofea/ })[0],
    );
    fireEvent.click(
      menuOf("Aina Sofea").getByRole("menuitem", { name: "Hapus komentar", hidden: true }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Hapus komentar ini?" });
    expect(within(dialog).getByText(/tidak bisa dikembalikan/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus komentar" }));
    await waitFor(() => expect(screen.queryByText(/Nenek saya pun begitu/)).toBeNull());
  });

  it("shows the withdrawn page for an unknown post", async () => {
    renderPost("tidak-ada");
    await screen.findByText("Tulisan ini tidak tersedia.");
  });
});

describe("PostView as a signed-out reader", () => {
  beforeEach(() => sessionStorage.setItem("rm-viewer", "tamu"));

  it("reads everything but replaces the comment field with a sign-in block", async () => {
    renderPost(POST);
    await heading();
    expect(screen.getByText("Masuk untuk ikut membalas.")).toBeTruthy();
    expect(screen.queryByLabelText("Tulis komentar")).toBeNull();
    expect(screen.getByText(/Nenek saya pun begitu/)).toBeTruthy();
  });

  it("asks to sign in instead of appreciating, and stores nothing", async () => {
    renderPost(POST);
    await heading();
    fireEvent.click(screen.getAllByRole("button", { name: "Apresiasi 86" })[0]);
    await screen.findByRole("dialog", { name: "Masuk untuk memberi Apresiasi" });
    expect((await holder.store.listMarks())[`ap:${POST}`]).toBeUndefined();
  });

  it("cannot open a group post", async () => {
    renderPost("garam-dan-pelabuhan");
    await screen.findByText("Tulisan ini tidak tersedia.");
    expect(screen.queryByRole("heading", { name: /Garam dan Pelabuhan/i })).toBeNull();
  });
});
