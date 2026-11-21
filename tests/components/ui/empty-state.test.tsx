import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EmptyState } from "@/components/ui/states";
import { EMPTY_ART } from "@/lib/empty-art";

afterEach(cleanup);

describe("EmptyState", () => {
  it("stays text only without art", () => {
    const { container } = render(<EmptyState>Sampah kosong.</EmptyState>);
    expect(container.querySelector("img")).toBeNull();
  });

  it("draws a decorative plate above the sentence when given art", () => {
    const { container } = render(
      <EmptyState art="womanWriting">Belum ada tulisan di sini.</EmptyState>,
    );
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe(EMPTY_ART.womanWriting.src);
    expect(img.getAttribute("alt")).toBe("");
    expect(img.closest("[aria-hidden]")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
    // The plate comes before the sentence.
    const sentence = screen.getByText("Belum ada tulisan di sini.");
    expect(img.compareDocumentPosition(sentence) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("sets a smaller plate beside the sentence and the action in the side layout", () => {
    const { container } = render(
      <EmptyState art="womanWriting" layout="side" action={<button type="button">Mulai</button>}>
        Belum ada tulisan di sini.
      </EmptyState>,
    );
    const img = container.querySelector("img")!;
    expect(img.className).toContain("h-24");
    // The sentence and the action share one column next to the plate.
    const column = screen.getByText("Belum ada tulisan di sini.").parentElement!;
    expect(column.contains(screen.getByRole("button", { name: "Mulai" }))).toBe(true);
    expect(column.contains(img)).toBe(false);
  });

  it("ignores the side layout without art", () => {
    const { container } = render(<EmptyState layout="side">Kosong.</EmptyState>);
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("EMPTY_ART", () => {
  it("only points at files already in the repo", async () => {
    const { existsSync } = await import("node:fs");
    for (const { src } of Object.values(EMPTY_ART)) {
      expect(existsSync(`public${src}`), src).toBe(true);
    }
  });
});
