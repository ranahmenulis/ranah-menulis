import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { PublishDone } from "@/features/community/components/compose/publish-done";
import type { StoredPost } from "@/features/community/storage/post-store";

afterEach(cleanup);

const post = (over: Partial<StoredPost> = {}): StoredPost => ({
  id: "p1",
  status: "published",
  title: "Hujan Pertama",
  kind: "prolog",
  genre: "Cerpen",
  blocks: [{ type: "paragraph", text: "Hujan pertama datang sore." }],
  sourceTitle: null,
  sourceDocId: null,
  visibility: "publik",
  updatedAt: Date.now(),
  ...over,
});

function renderDone(over?: Partial<StoredPost>) {
  render(
    <ToastProvider>
      <PublishDone post={post(over)} />
    </ToastProvider>,
  );
  return within(screen.getByRole("navigation", { name: "Kembali ke" }));
}

describe("PublishDone, where to go next", () => {
  it("offers Beranda and Jelajahi for a post written directly, and no Studio link", () => {
    const back = renderDone();
    expect(back.getByRole("link", { name: "Kembali ke Beranda" }).getAttribute("href")).toBe(
      "/beranda",
    );
    expect(back.getByRole("link", { name: "Kembali ke Community" }).getAttribute("href")).toBe(
      "/jelajahi",
    );
    expect(back.queryByRole("link", { name: "Kembali ke Studio" })).toBeNull();
  });

  it("adds a way back to Studio when the post came from a document", () => {
    const back = renderDone({ sourceDocId: "d1", sourceTitle: "Yang Ditunggu Nenek" });
    expect(back.getByRole("link", { name: "Kembali ke Studio" }).getAttribute("href")).toBe(
      "/studio",
    );
  });

  it("keeps 'Lihat postingan' as the one filled action", () => {
    renderDone();
    expect(screen.getByRole("link", { name: "Lihat postingan" }).getAttribute("href")).toBe(
      "/postingan/p1",
    );
  });
});
