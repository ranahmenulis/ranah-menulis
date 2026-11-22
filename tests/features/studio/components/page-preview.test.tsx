import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ModeSwitch } from "@/features/studio/components/format/mode-switch";
import { PagePreview } from "@/features/studio/components/preview/page-preview";
import { DEFAULT_LAYOUT } from "@/features/studio/document-layout";

afterEach(cleanup);

describe("ModeSwitch", () => {
  it("marks the current mode and reports a change", () => {
    const onChange = vi.fn();
    render(<ModeSwitch mode="write" onChange={onChange} />);
    const write = screen.getByRole("button", { name: "Mode menulis (Writing Mode)" });
    const preview = screen.getByRole("button", { name: "Pratinjau halaman (Page Preview)" });
    expect(write.getAttribute("aria-pressed")).toBe("true");
    expect(preview.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(preview);
    expect(onChange).toHaveBeenCalledWith("preview");
  });
});

describe("PagePreview", () => {
  it("shows the title and the text on a labelled sheet, with a note that it is an estimate", () => {
    render(<PagePreview title="Judul uji" html="<p>satu dua tiga</p>" layout={DEFAULT_LAYOUT} />);
    expect(screen.getByRole("region", { name: "Pratinjau halaman" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Halaman 1" })).toBeTruthy();
    expect(screen.getByText(/Perkiraan halaman A5/)).toBeTruthy();
    expect(screen.getByText("Halaman 1 dari 1")).toBeTruthy();
    expect(screen.getAllByText("Judul uji").length).toBeGreaterThan(0);
    expect(screen.getAllByText("satu dua tiga").length).toBeGreaterThan(0);
  });

  it("sizes the sheet as A5 with the margin of the document", () => {
    render(
      <PagePreview title="" html="<p>teks</p>" layout={{ ...DEFAULT_LAYOUT, marginMm: 30 }} />,
    );
    const sheet = screen.getByRole("img", { name: "Halaman 1" });
    expect(sheet.style.width).toBe("148mm");
    expect(sheet.style.height).toBe("210mm");
    expect(sheet.style.padding).toBe("30mm");
  });

  it("says so when there is nothing to show", () => {
    render(<PagePreview title="  " html="<p></p>" layout={DEFAULT_LAYOUT} />);
    expect(screen.getByText("Belum ada tulisan.")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
