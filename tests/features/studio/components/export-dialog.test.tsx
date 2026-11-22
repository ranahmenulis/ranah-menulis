import { DEFAULT_LAYOUT } from "@/features/studio/document-layout";
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
    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));

    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    expect(buildPdf).toHaveBeenCalledWith(
      "Arutala",
      content,
      { titlePage: true, pageNumbers: true },
      DEFAULT_LAYOUT,
    );
    expect(downloadBlob.mock.calls[0][1]).toBe("Arutala.pdf");
    expect(onClose).toHaveBeenCalled();
  });

  it("downloads plain text without the PDF options", async () => {
    setup();
    fireEvent.click(screen.getByLabelText(/^TXT/));
    expect(screen.queryByLabelText(/Nomor halaman/)).toBeNull();
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

  it("hands the layout of the document to the PDF and says how a font is drawn", async () => {
    const layout = { ...DEFAULT_LAYOUT, font: "sans", marginMm: 30 } as const;
    render(
      <ToastProvider>
        <ExportDialog
          open
          onClose={vi.fn()}
          title="Arutala"
          layout={layout}
          getContent={() => content}
        />
      </ToastProvider>,
    );
    expect(screen.getByText("Font Inter dicetak sebagai Helvetica di PDF.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Unduh PDF" }));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    expect(buildPdf.mock.calls[0][3]).toEqual(layout);
  });
});
