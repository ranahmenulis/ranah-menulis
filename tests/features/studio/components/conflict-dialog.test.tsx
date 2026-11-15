import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { installDialogShim } from "@/test/dialog-shim";
import { ConflictDialog, type ConflictVersion } from "@/features/studio/components/conflict-dialog";

beforeAll(installDialogShim);
afterEach(cleanup);

const local: ConflictVersion = {
  title: "Surat",
  savedAt: new Date(2026, 10, 15, 14, 36),
  words: 170,
  paragraphs: ["Sama.", "Versi perangkat ini."],
};
const remote: ConflictVersion = {
  title: "Surat",
  savedAt: new Date(2026, 10, 15, 14, 31),
  words: 163,
  paragraphs: ["Sama.", "Versi tempat lain."],
};

function setup() {
  const onResolve = vi.fn();
  const view = render(<ConflictDialog open local={local} remote={remote} onResolve={onResolve} />);
  return { onResolve, dialog: view.container.querySelector("dialog")! };
}

const proceed = () => screen.getByRole("button", { name: "Lanjutkan" }) as HTMLButtonElement;

describe("ConflictDialog", () => {
  it("is an alert dialog showing both versions with time and word count", () => {
    const { dialog } = setup();

    expect(dialog.getAttribute("role")).toBe("alertdialog");
    expect(screen.getByText("14.36 · 170 kata")).toBeTruthy();
    expect(screen.getByText("14.31 · 163 kata")).toBeTruthy();
  });

  it("shows only the paragraphs that differ, and how many are the same", () => {
    setup();

    expect(screen.getByText("Versi perangkat ini.")).toBeTruthy();
    expect(screen.getByText("Versi tempat lain.")).toBeTruthy();
    expect(screen.queryByText("Sama.")).toBeNull();
    expect(screen.getByText(/1 paragraf sama di kedua versi/)).toBeTruthy();
  });

  it("cannot be dismissed: no close button, Escape and backdrop do nothing", () => {
    const { dialog, onResolve } = setup();
    const cancel = new Event("cancel", { cancelable: true });

    dialog.dispatchEvent(cancel);
    fireEvent.click(dialog);

    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(screen.queryByRole("button", { name: /tutup/i })).toBeNull();
    expect(onResolve).not.toHaveBeenCalled();
  });

  it("keeps 'Lanjutkan' disabled until a version is chosen", () => {
    setup();
    expect(proceed().disabled).toBe(true);

    fireEvent.click(screen.getByLabelText(/Perangkat ini/));

    expect(proceed().disabled).toBe(false);
  });

  it.each([
    ["Perangkat ini", "local"],
    ["Dari tempat lain", "remote"],
    ["Simpan keduanya", "both"],
  ])("resolves with '%s' as %s", async (label, expected) => {
    const { onResolve } = setup();

    fireEvent.click(screen.getByLabelText(new RegExp(label)));
    fireEvent.click(proceed());

    expect(onResolve).toHaveBeenCalledWith(expected);
  });
});
