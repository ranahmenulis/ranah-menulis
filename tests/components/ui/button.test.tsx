import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

afterEach(cleanup);

describe("Button", () => {
  it("renders its label as a button with type=button by default", () => {
    render(<Button>Simpan</Button>);

    const button = screen.getByRole("button", { name: "Simpan" });
    expect(button.getAttribute("type")).toBe("button");
  });

  it("marks itself busy while loading and shows the loading dots", () => {
    const { container } = render(<Button loading>Kirim</Button>);

    const button = screen.getByRole("button", { name: "Kirim" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("i")).toHaveLength(3);
  });

  it("applies the danger variant classes", () => {
    render(<Button variant="danger">Hapus</Button>);

    const button = screen.getByRole("button", { name: "Hapus" });
    expect(button.className).toContain("bg-danger");
  });

  it("does not show loading dots when not loading", () => {
    const { container } = render(<Button>Lanjut</Button>);

    expect(container.querySelectorAll("i")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Lanjut" }).getAttribute("aria-busy")).toBeNull();
  });
});
