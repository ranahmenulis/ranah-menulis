import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { installDialogShim } from "@/test/dialog-shim";
import { TargetDialog } from "@/features/studio/components/streak/target-dialog";

beforeAll(installDialogShim);
afterEach(cleanup);

function setup(current: number | null) {
  const onSave = vi.fn();
  render(<TargetDialog open current={current} onClose={() => {}} onSave={onSave} />);
  const field = screen.getByLabelText("Kata per hari") as HTMLInputElement;
  const save = () => screen.getByRole("button", { name: "Simpan" }) as HTMLButtonElement;
  return { onSave, field, save };
}

describe("TargetDialog", () => {
  it("says a changed target applies from tomorrow, and keeps today's", () => {
    const { field } = setup(500);
    fireEvent.change(field, { target: { value: "750" } });
    expect(
      screen.getByText("Hari ini tetap 500 kata. Target 750 kata berlaku mulai besok."),
    ).toBeTruthy();
  });

  it("says the very first target counts from today", () => {
    setup(null);
    expect(screen.getByText(/berlaku mulai hari ini/)).toBeTruthy();
  });

  it("cannot save an unchanged or invalid target, and explains an invalid one", () => {
    const { field, save } = setup(500);
    expect(save().disabled).toBe(true);

    fireEvent.change(field, { target: { value: "abc" } });
    expect(save().disabled).toBe(true);
    expect(screen.getByText("Isi angka bulat antara 1 dan 100.000.")).toBeTruthy();
    expect(field.getAttribute("aria-invalid")).toBe("true");
  });

  it("saves the typed number, accepting thousands separators", () => {
    const { field, save, onSave } = setup(500);
    fireEvent.change(field, { target: { value: "1.000" } });
    fireEvent.click(save());
    expect(onSave).toHaveBeenCalledWith(1000);
  });

  it("fills the field from a quick choice", () => {
    const { field, save } = setup(500);
    fireEvent.click(screen.getByRole("button", { name: "250" }));
    expect(field.value).toBe("250");
    expect(save().disabled).toBe(false);
  });
});
