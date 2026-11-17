import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ExportDialog } from "@/features/studio/components/export-dialog";
import { ToastProvider } from "@/components/ui/toast";
import { installDialogShim } from "@/test/dialog-shim";

const downloadBlob = vi.fn();
const buildPdf = vi.fn();

vi.mock("@/features/studio/export/download", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/studio/export/download")>()),
  downloadBlob: (...args: unknown[]) => downloadBlob(...args),
}));
vi.mock("@/features/studio/export/export-pdf", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/studio/export/export-pdf")>()),
  buildPdf: (...args: unknown[]) => buildPdf(...args),
}));

const content = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Halo" }] }],
};

function setup(getContent: () => typeof content | null = () => content) {
  const onClose = vi.fn();
  render(
    <ToastProvider>
      <ExportDialog open onClose={onClose} title="Arutala" getContent={getContent} />
    </ToastProvider>,
  );
  return { onClose };
}

beforeAll(installDialogShim);
beforeEach(() => {
  downloadBlob.mockReset();
  buildPdf.mockReset().mockResolvedValue(new Blob(["%PDF"]));
});
afterEach(cleanup);

describe("ExportDialog", () => {
  it("downloads a PDF with the chosen options by default", async () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByLabelText(/Judul di halaman depan/));
    fireEvent.change(screen.getByLabelText("Jarak baris"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));

    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    expect(buildPdf).toHaveBeenCalledWith("Arutala", content, {
      titlePage: true,
      pageNumbers: true,
      lineSpacing: 2,
    });
    expect(downloadBlob.mock.calls[0][1]).toBe("Arutala.pdf");
    expect(onClose).toHaveBeenCalled();
  });

  it("downloads plain text without the PDF options", async () => {
    setup();
    fireEvent.click(screen.getByLabelText(/^TXT/));
    expect(screen.queryByLabelText("Jarak baris")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Unduh TXT" }));

    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    expect(buildPdf).not.toHaveBeenCalled();
    expect(downloadBlob.mock.calls[0][1]).toBe("Arutala.txt");
    const blob = downloadBlob.mock.calls[0][0] as Blob;
    expect(await blob.text()).toBe("Arutala\n\nHalo\n");
  });

  it("says so and stays open when the file cannot be made", async () => {
    buildPdf.mockRejectedValue(new Error("boom"));
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));

    expect(await screen.findByText(/Berkas belum bisa dibuat/)).toBeTruthy();
    expect(downloadBlob).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("fails clearly when the editor has no content to export", async () => {
    setup(() => null);
    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));
    expect(await screen.findByText(/Berkas belum bisa dibuat/)).toBeTruthy();
  });
});
