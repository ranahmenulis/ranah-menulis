import { cleanup, configure, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RunningClassesRow } from "@/features/home/project-rows";
import { MyProjectsView } from "@/features/projects/components/my-projects-view";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { register } from "../../components/submit-helpers";
import { CERPEN, PUISI } from "../helpers";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

describe("Kelas yang sedang berjalan on Beranda", () => {
  it("shows a Lanjutkan button to the first material of a running class", async () => {
    register(CERPEN);
    render(<RunningClassesRow store={createMemoryAssignmentStore()} />);
    const section = await screen.findByRole("region", { name: "Kelas yang sedang berjalan" });
    expect(within(section).getByText("Kelas Cerpen untuk Pemula")).toBeTruthy();
    const link = within(section).getByRole("link", { name: "Lanjutkan Kelas Cerpen untuk Pemula" });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/dasbor#materi-cerpen-1a`);
    expect(within(section).getByText(/0% selesai · Berikutnya: materi “Satu ide/)).toBeTruthy();
  });

  it("is not drawn when no class is running", async () => {
    register(PUISI); // joined, but it has not started
    const { container } = render(<RunningClassesRow store={createMemoryAssignmentStore()} />);
    await new Promise((r) => setTimeout(r, 300));
    expect(container.textContent).toBe("");
  });

  it("fails on its own, with a retry", async () => {
    register(CERPEN);
    const broken = { ...createMemoryAssignmentStore(), list: () => Promise.reject(new Error("x")) };
    render(<RunningClassesRow store={broken} />);
    expect(await screen.findByText(/gagal dimuat/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Coba lagi/ })).toBeTruthy();
  });
});

describe("Kelas yang sedang berjalan in Proyek saya", () => {
  it("sits above the projects", async () => {
    register(CERPEN);
    render(
      <MyProjectsView
        store={createMemorySubmissionStore()}
        assignments={createMemoryAssignmentStore()}
      />,
    );
    const heading = await screen.findByRole("heading", { name: "Kelas yang sedang berjalan" });
    expect(
      heading.compareDocumentPosition(
        screen.getByRole("heading", { name: "Kelas Cerpen untuk Pemula", level: 2 }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lanjutkan Kelas Cerpen untuk Pemula" })).toBeTruthy();
  });
});
