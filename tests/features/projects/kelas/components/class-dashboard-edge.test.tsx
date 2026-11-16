import { cleanup, configure, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ClassDashboard } from "@/features/projects/kelas/components/class-dashboard";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import type { ClassFixture } from "@/features/projects/kelas/types";
import { register } from "../../components/submit-helpers";
import { CERPEN } from "../helpers";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  register(CERPEN);
});
afterEach(cleanup);

const LONG = "Panjang".repeat(40);

async function open(fixture: ClassFixture) {
  render(
    <ClassDashboard slug={CERPEN} classes={[fixture]} store={createMemoryAssignmentStore()} />,
  );
  await screen.findByRole("heading", { level: 1 });
}

describe("class dashboard with worst-case content", () => {
  it("says so, instead of showing a broken page, for a class with nothing in it", async () => {
    await open({ slug: CERPEN, sessions: [], modules: [] });
    expect(screen.getByText("Jadwal pertemuan belum diumumkan.")).toBeTruthy();
    expect(screen.getByText("Belum ada materi atau tugas di kelas ini.")).toBeTruthy();
    expect(screen.getByText("Belum ada tugas di kelas ini.")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("says a module with no material has none, and keeps its assignment", async () => {
    await open({
      slug: CERPEN,
      sessions: [],
      modules: [
        {
          title: "A",
          materials: [],
          assignment: { id: "t", title: "B", instructions: [], dueDay: 3 },
        },
      ],
    });
    expect(screen.getByText("Belum ada materi di modul ini.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "B" })).toBeTruthy();
    expect(
      screen.getByRole("progressbar", { name: "Progres belajar" }).getAttribute("aria-valuenow"),
    ).toBe("0");
  });

  it("lets very long unbroken titles wrap instead of widening the page", async () => {
    await open({
      slug: CERPEN,
      sessions: [
        { id: "s", title: LONG, day: 9, time: "19.00", minutes: 60, link: "https://x.test" },
      ],
      modules: [
        {
          title: LONG,
          materials: [{ id: "m", title: LONG, minutes: 99999, body: [LONG] }],
          assignment: { id: "t", title: LONG, instructions: [LONG], dueDay: 30 },
        },
      ],
    });
    for (const el of screen.getAllByText(LONG)) {
      expect(el.className).toMatch(/wrap-anywhere/);
    }
  });
});
