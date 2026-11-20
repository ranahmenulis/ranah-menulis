import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducer } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeReducer, initialCompose } from "@/features/community/compose-state";
import { CoverImageField } from "@/features/community/components/compose/cover-image-field";

// jsdom cannot decode images, so the resize step is replaced.
vi.mock("@/lib/files/compress-image", () => ({
  compressImage: vi.fn(async () => ({
    blob: new Blob(),
    dataUrl: "data:image/webp;base64,AAAA",
    width: 1200,
    height: 800,
  })),
}));

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

function Harness() {
  const [state, dispatch] = useReducer(composeReducer, initialCompose);
  return <CoverImageField image={state.image} dispatch={dispatch} />;
}

const pick = (file: File) =>
  fireEvent.change(screen.getByLabelText("Tambah gambar"), { target: { files: [file] } });

afterEach(cleanup);

describe("CoverImageField", () => {
  it("adds a checked image and asks for its alt text", async () => {
    render(<Harness />);
    pick(new File([PNG], "foto.png", { type: "image/png" }));
    const alt = await screen.findByLabelText("Teks alternatif");
    expect(alt.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Isi teks alternatif gambar untuk menerbitkan.")).toBeTruthy();
    fireEvent.change(alt, { target: { value: "Mesin tik tua" } });
    expect(screen.getByLabelText("Teks alternatif").getAttribute("aria-invalid")).toBeNull();
  });

  it("refuses a file that only looks like an image", async () => {
    render(<Harness />);
    pick(new File(["<html></html>"], "foto.png", { type: "image/png" }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Pilih gambar JPG, PNG, atau WebP.",
    );
    expect(screen.queryByLabelText("Teks alternatif")).toBeNull();
  });

  it("removes the image again", async () => {
    render(<Harness />);
    pick(new File([PNG], "foto.png", { type: "image/png" }));
    fireEvent.click(await screen.findByRole("button", { name: "Hapus gambar" }));
    await waitFor(() => expect(screen.queryByLabelText("Teks alternatif")).toBeNull());
    expect(screen.getByLabelText("Tambah gambar")).toBeTruthy();
  });
});
