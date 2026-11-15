import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ShareDialog } from "@/features/studio/components/share-dialog";
import { installDialogShim } from "@/test/dialog-shim";

beforeAll(installDialogShim);
afterEach(cleanup);

function renderShare(onContinue: () => Promise<boolean>, title = "Yang Ditunggu Nenek") {
  const onClose = vi.fn();
  const view = render(
    <ShareDialog open onClose={onClose} documentTitle={title} onContinue={onContinue} />,
  );
  return { onClose, dialog: view.container.querySelector("dialog")! };
}

const next = () => screen.getByRole("button", { name: "Pilih bagian untuk dibagikan" });

describe("ShareDialog", () => {
  it("says the document stays Pribadi and only the chosen text becomes public", () => {
    renderShare(async () => true);

    expect(screen.getByText("Yang Ditunggu Nenek")).toBeTruthy();
    expect(screen.getByText("Pribadi")).toBeTruthy();
    expect(
      screen.getByText(
        /Dokumen ini tetap Pribadi\. Yang menjadi publik hanya teks yang kamu pilih/,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/maksimal 500 kata/)).toBeTruthy();
  });

  it("keeps the notice free of any close control", () => {
    renderShare(async () => true);
    const notice = screen.getByText(/Dokumen ini tetap Pribadi/).parentElement!;
    expect(notice.querySelector("button")).toBeNull();
  });

  it("has exactly one filled button, and it hands over to writing the post", async () => {
    const onContinue = vi.fn(async () => true);
    renderShare(onContinue);

    fireEvent.click(next());

    await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(1));
  });

  it("falls back to a placeholder name for an untitled document", () => {
    renderShare(async () => true, "   ");
    expect(screen.getByText("Tanpa judul")).toBeTruthy();
  });

  it("cancels without handing over", () => {
    const onContinue = vi.fn(async () => true);
    const { onClose } = renderShare(onContinue);

    fireEvent.click(screen.getByRole("button", { name: "Batal" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("explains a failed save and lets the author try again, without closing", async () => {
    const onContinue = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { onClose } = renderShare(onContinue);

    fireEvent.click(next());
    await screen.findByText(/belum tersimpan di perangkat ini/);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(next());
    await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText(/belum tersimpan/)).toBeNull());
  });

  it("cannot be dismissed while saving, so a swipe or Escape cannot strand the hand-over", async () => {
    let finish: (ok: boolean) => void = () => {};
    const { onClose, dialog } = renderShare(() => new Promise<boolean>((r) => (finish = r)));

    fireEvent.click(next());
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    fireEvent.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
    finish(false);
    await screen.findByText(/belum tersimpan/);
  });
});
