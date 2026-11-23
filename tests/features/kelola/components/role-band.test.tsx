import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { isAdminTabRoot } from "@/features/kelola/admin/components/admin-band";
import { RoleBand, RoleBandLink } from "@/features/kelola/components/role-band";

afterEach(cleanup);

describe("RoleBand", () => {
  it("is the screen's h1 with the role, the number of work and the way in", () => {
    render(
      <RoleBand
        area="editor"
        title="Antrean submission"
        titleId="antrean-title"
        description="Karya yang ditugaskan kepadamu untuk ditinjau."
        work={{ status: "ready", count: 4, entry: { label: "Tinjau", href: "/kelola/editor" } }}
      />,
    );
    const band = screen.getByRole("region", { name: "Antrean submission" });
    expect(screen.getByRole("heading", { level: 1, name: "Antrean submission" })).toBeTruthy();
    expect(band.textContent).toContain("Ruang kerja · Editor");
    // Without matchMedia (jsdom) the number is the value itself, never a rolling frame.
    expect(band.textContent).toContain("4karya perlu tindakan");
    expect(screen.getByRole("link", { name: /Tinjau/ }).getAttribute("href")).toBe(
      "/kelola/editor",
    );
  });

  it("keeps the role illustration out of the accessibility tree", () => {
    const { container } = render(
      <RoleBand area="juri" title="Penilaian" titleId="t" work={{ status: "loading" }} />,
    );
    expect(container.querySelector("[data-mark='juri']")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows a dash while loading and no number when the data cannot be read", () => {
    const { rerender } = render(
      <RoleBand area="mentor" title="Kelas" titleId="t" work={{ status: "loading" }} />,
    );
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByText(/memuat/)).toBeTruthy();
    rerender(<RoleBand area="mentor" title="Kelas" titleId="t" work={{ status: "error" }} />);
    expect(screen.queryByText("—")).toBeNull();
    expect(screen.queryByText(/menunggu penilaianmu/)).toBeNull();
  });

  it("is a plain labelled region when the tabs under it carry the h1 (Admin)", () => {
    render(
      <RoleBand area="admin" title="Admin" work={{ status: "ready", count: 0, entry: null }} />,
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("region", { name: "Ruang kerja Administrator" })).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("puts the Admin band on the tab roots only", () => {
    expect(isAdminTabRoot("/kelola/admin")).toBe(true);
    expect(isAdminTabRoot("/kelola/admin/moderasi")).toBe(true);
    expect(isAdminTabRoot("/kelola/admin/grup/")).toBe(true);
    expect(isAdminTabRoot("/kelola/admin/pengguna/maya")).toBe(false);
    expect(isAdminTabRoot("/kelola/admin/moderasi/post:1")).toBe(false);
  });
});

describe("RoleBandLink", () => {
  it("is one link into the area with its number", () => {
    render(
      <RoleBandLink
        area="organizer"
        label="Proyek"
        summary="Buat dan ubah proyek."
        href="/kelola/organizer"
        work={{ status: "ready", count: 2, entry: null }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/kelola/organizer");
    expect(link.textContent).toContain("2proyek aktif");
  });
});
