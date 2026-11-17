import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pathname = vi.hoisted(() => ({ value: "/kelola" }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

import { KelolaFrame } from "@/features/kelola/components/kelola-frame";

function renderAs(path: string, roles: string, viewer = "masuk") {
  pathname.value = path;
  sessionStorage.setItem("rm-viewer", viewer);
  if (roles) sessionStorage.setItem("rm-roles", roles);
  return render(
    <KelolaFrame>
      <p>isi layar</p>
    </KelolaFrame>,
  );
}

beforeEach(() => sessionStorage.clear());
afterEach(cleanup);

describe("KelolaFrame", () => {
  it("shows the screen and a menu of the areas the person holds", () => {
    renderAs("/kelola/editor", "editor,juri");
    expect(screen.getByText("isi layar")).toBeTruthy();
    const menu = screen.getByRole("navigation", { name: "Bagian kelola" });
    expect(
      within(menu)
        .getAllByRole("link")
        .map((a) => a.textContent),
    ).toEqual(["Ringkasan", "Antrean submission", "Penilaian"]);
    const current = within(menu)
      .getAllByRole("link")
      .filter((a) => a.getAttribute("aria-current") === "page");
    expect(current.map((a) => a.textContent)).toEqual(["Antrean submission"]);
  });

  it("refuses an area the person does not hold, with a way out", () => {
    renderAs("/kelola/admin", "editor");
    expect(screen.queryByText("isi layar")).toBeNull();
    expect(screen.getByText("Kamu tidak punya akses ke bagian ini.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke Beranda" }).getAttribute("href")).toBe(
      "/beranda",
    );
  });

  it("refuses someone without any role", () => {
    renderAs("/kelola", "");
    expect(screen.queryByText("isi layar")).toBeNull();
    expect(screen.getByText("Kamu tidak punya akses ke bagian ini.")).toBeTruthy();
  });

  it("asks a signed-out visitor to sign in, even if roles were left in the tab", () => {
    renderAs("/kelola/editor", "editor", "tamu");
    expect(screen.queryByText("isi layar")).toBeNull();
    expect(screen.getByRole("link", { name: "Masuk" })).toBeTruthy();
  });

  it("lets Administrator open every area", () => {
    renderAs("/kelola/juri", "administrator");
    expect(screen.getByText("isi layar")).toBeTruthy();
  });
});
