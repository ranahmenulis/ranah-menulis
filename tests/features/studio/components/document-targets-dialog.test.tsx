import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DocumentTargetsDialog } from "@/features/studio/components/document-targets-dialog";
import type { DocumentTarget } from "@/features/studio/document-targets";
import { installDialogShim } from "@/test/dialog-shim";

const TODAY = "2026-11-18";

beforeAll(installDialogShim);
afterEach(cleanup);

function setup(targets: DocumentTarget[] = [], words = 320) {
  const onChange = vi.fn();
  const onClose = vi.fn();
  render(
    <DocumentTargetsDialog
      open
      onClose={onClose}
      words={words}
      targets={targets}
      today={TODAY}
      onChange={onChange}
    />,
  );
  return { onChange, onClose };
}

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(new RegExp(label)), { target: { value } });

describe("DocumentTargetsDialog", () => {
  it("says so when there are no targets", () => {
    setup();
    expect(screen.getByText("Belum ada target untuk dokumen ini.")).toBeTruthy();
  });

  it("adds a target with a due day and clears the form", () => {
    const { onChange } = setup();
    type("Jumlah kata", "1.000");
    type("Tenggat", "2026-11-23");
    fireEvent.click(screen.getByRole("button", { name: "Tambah target" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatchObject([{ words: 1000, due: "2026-11-23" }]);
    expect((screen.getByLabelText(/Jumlah kata/) as HTMLInputElement).value).toBe("");
  });

  it("adds a target without a due day", () => {
    const { onChange } = setup();
    type("Jumlah kata", "500");
    fireEvent.click(screen.getByRole("button", { name: "Tambah target" }));
    expect(onChange.mock.calls[0][0]).toMatchObject([{ words: 500, due: null }]);
  });

  it("explains an invalid word count, a past due day and a duplicate, and adds nothing", () => {
    const { onChange } = setup([{ id: "a", words: 500, due: null }]);

    type("Jumlah kata", "0");
    fireEvent.click(screen.getByRole("button", { name: "Tambah target" }));
    expect(screen.getByText("Isi angka bulat antara 1 dan 500.000.")).toBeTruthy();

    type("Jumlah kata", "700");
    type("Tenggat", "2026-11-17");
    fireEvent.click(screen.getByRole("button", { name: "Tambah target" }));
    expect(screen.getByText("Tenggat tidak boleh sebelum hari ini.")).toBeTruthy();

    type("Jumlah kata", "500");
    type("Tenggat", "");
    fireEvent.click(screen.getByRole("button", { name: "Tambah target" }));
    expect(screen.getByText("Target ini sudah ada.")).toBeTruthy();

    expect(onChange).not.toHaveBeenCalled();
  });

  it("lists targets soonest first with their progress and marks a missed one", () => {
    setup(
      [
        { id: "a", words: 3000, due: "2026-12-20" },
        { id: "b", words: 1000, due: "2026-11-10" },
      ],
      320,
    );
    const items = within(screen.getByRole("list", { name: "Target dokumen" })).getAllByRole(
      "listitem",
    );
    expect(items[0].textContent).toContain("320 / 1.000 kata · terlewat 8 hari");
    expect(items[0].textContent).toContain("Terlewat");
    expect(items[1].textContent).toContain("320 / 3.000 kata · 32 hari lagi");
  });

  it("removes a target by its own button", () => {
    const { onChange } = setup([
      { id: "a", words: 3000, due: null },
      { id: "b", words: 1000, due: null },
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Hapus target 1.000 kata" }));
    expect(onChange).toHaveBeenCalledWith([{ id: "a", words: 3000, due: null }]);
  });

  it("stops at five targets and says so", () => {
    setup(Array.from({ length: 5 }, (_, i) => ({ id: String(i), words: 100 + i, due: null })));
    expect(screen.getByText("Satu dokumen punya paling banyak 5 target.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tambah target" })).toHaveProperty("disabled", true);
  });
});
