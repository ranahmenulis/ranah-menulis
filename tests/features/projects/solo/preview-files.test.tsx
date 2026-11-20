import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreviewFiles } from "@/features/projects/solo/components/preview-files";
import { withFile } from "@/features/projects/solo/stage-model";
import { createMemoryFileStore } from "@/lib/files/memory-file-store";

const BASE = { id: "s1", slug: "solo-penerbitan-buku-sendiri" };

afterEach(cleanup);

describe("withFile with an attached file", () => {
  it("keeps the file's key, name, type and real size in KB", () => {
    const row = withFile(null, BASE, "cover", 100, {
      id: "f1",
      name: "sampul-v1.webp",
      type: "image/webp",
      size: 204_800,
    });
    expect(row.files[0]).toMatchObject({
      kind: "cover",
      version: 1,
      sizeKb: 200,
      fileId: "f1",
      fileName: "sampul-v1.webp",
      fileType: "image/webp",
    });
  });

  it("stays a description when nothing is attached", () => {
    expect(withFile(null, BASE, "layout", 100).files[0].fileId).toBeUndefined();
  });
});

describe("PreviewFiles", () => {
  const withBlob = async () => {
    const store = createMemoryFileStore();
    await store.put({
      id: "f1",
      name: "isi.pdf",
      type: "application/pdf",
      size: 2048,
      blob: new Blob(["%PDF-1.7"], { type: "application/pdf" }),
      createdAt: 1,
    });
    return store;
  };
  const files = withFile(null, BASE, "layout", 100, {
    id: "f1",
    name: "isi.pdf",
    type: "application/pdf",
    size: 2048,
  }).files;

  it("offers a download for an attached file and does not call it an example", async () => {
    const store = await withBlob();
    render(<PreviewFiles files={files} zone="WIB" store={store} />);
    expect(screen.getByRole("button", { name: /Unduh/ })).toBeTruthy();
    expect(screen.queryByText(/Contoh/)).toBeNull();
  });

  it("downloads the stored blob when the button is pressed", async () => {
    const store = await withBlob();
    const create = vi.fn(() => "blob:test");
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    render(<PreviewFiles files={files} zone="WIB" store={store} />);
    fireEvent.click(screen.getByRole("button", { name: /Unduh/ }));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  });

  it("says so when the file is gone from this device", async () => {
    render(<PreviewFiles files={files} zone="WIB" store={createMemoryFileStore()} />);
    fireEvent.click(screen.getByRole("button", { name: /Unduh/ }));
    expect((await screen.findByRole("alert")).textContent).toContain("tidak ada di perangkat ini");
  });

  it("keeps the example note for a row that is only a description", () => {
    const plain = withFile(null, BASE, "cover", 100).files;
    render(<PreviewFiles files={plain} zone="WIB" store={createMemoryFileStore()} />);
    expect(screen.getByText(/Contoh/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Unduh/ })).toBeNull();
  });
});
