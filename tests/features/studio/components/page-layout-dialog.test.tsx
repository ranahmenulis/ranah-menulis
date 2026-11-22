import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PageLayoutDialog } from "@/features/studio/components/page-layout-dialog";
import { DEFAULT_LAYOUT } from "@/features/studio/document-layout";
import { installDialogShim } from "@/test/dialog-shim";

beforeAll(installDialogShim);
afterEach(cleanup);

function setup(layout = DEFAULT_LAYOUT) {
  const onChange = vi.fn();
  const onClose = vi.fn();
  render(<PageLayoutDialog open onClose={onClose} layout={layout} onChange={onChange} />);
  return { onChange, onClose };
}

describe("PageLayoutDialog", () => {
  it("shows the margin and line spacing of the document", () => {
    setup({ ...DEFAULT_LAYOUT, marginMm: 25, lineSpacing: 2 });
    expect((screen.getByLabelText("Margin") as HTMLSelectElement).value).toBe("25");
    expect((screen.getByLabelText("Jarak baris") as HTMLSelectElement).value).toBe("2");
  });

  it("offers margins from 10 to 40 mm in steps of 5", () => {
    setup();
    const options = Array.from((screen.getByLabelText("Margin") as HTMLSelectElement).options);
    expect(options.map((o) => o.value)).toEqual(["10", "15", "20", "25", "30", "35", "40"]);
  });

  it("applies a change at once, keeping the other fields", () => {
    const { onChange } = setup();
    fireEvent.change(screen.getByLabelText("Margin"), { target: { value: "30" } });
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_LAYOUT, marginMm: 30 });
    fireEvent.change(screen.getByLabelText("Jarak baris"), { target: { value: "1.15" } });
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_LAYOUT, lineSpacing: 1.15 });
  });

  it("restores the defaults, and the button is off while they are already in place", () => {
    const { onChange } = setup({ ...DEFAULT_LAYOUT, marginMm: 30 });
    fireEvent.click(screen.getByRole("button", { name: "Kembalikan ke bawaan" }));
    expect(onChange).toHaveBeenCalledWith(DEFAULT_LAYOUT);
    cleanup();
    setup();
    expect(
      (screen.getByRole("button", { name: "Kembalikan ke bawaan" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("closes with Selesai", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Selesai" }));
    expect(onClose).toHaveBeenCalled();
  });
});
