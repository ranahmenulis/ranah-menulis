import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ManuscriptUpload } from "@/features/projects/components/manuscript-upload";
import type { VersionFile } from "@/features/projects/submission-types";

const file: VersionFile = {
  fileId: "f1",
  name: "naskah-novel.docx",
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  size: 2_400_000,
};

afterEach(cleanup);

describe("ManuscriptUpload", () => {
  it("offers the upload and says the word count is not checked for files", () => {
    render(
      <ManuscriptUpload
        upload={null}
        uploading={false}
        error={null}
        onPick={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Unggah berkas naskah")).toBeTruthy();
    expect(screen.getByText(/Jumlah kata tidak diperiksa/)).toBeTruthy();
  });

  it("hands the picked file to the caller", () => {
    const onPick = vi.fn();
    render(
      <ManuscriptUpload
        upload={null}
        uploading={false}
        error={null}
        onPick={onPick}
        onClear={vi.fn()}
      />,
    );
    const picked = new File(["x"], "a.pdf");
    fireEvent.change(screen.getByLabelText("Unggah berkas naskah"), {
      target: { files: [picked] },
    });
    expect(onPick).toHaveBeenCalledWith(picked);
  });

  it("shows the chosen file with its kind and size, and can remove it", () => {
    const onClear = vi.fn();
    render(
      <ManuscriptUpload
        upload={file}
        uploading={false}
        error={null}
        onPick={vi.fn()}
        onClear={onClear}
      />,
    );
    expect(screen.getByText("naskah-novel.docx")).toBeTruthy();
    expect(screen.getByText(/DOCX · 2,3 MB/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Hapus berkas" }));
    expect(onClear).toHaveBeenCalled();
  });

  it("announces why a file was refused", () => {
    render(
      <ManuscriptUpload
        upload={null}
        uploading={false}
        error="Pilih berkas PDF atau DOCX."
        onPick={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain("Pilih berkas PDF atau DOCX.");
  });
});
