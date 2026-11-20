import {
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentView } from "@/features/projects/kelas/components/assignment-view";
import { ClassDashboard } from "@/features/projects/kelas/components/class-dashboard";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { docs, documentsOf, register } from "../../components/submit-helpers";
import { CERPEN, DAY } from "../helpers";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

configure({ asyncUtilTimeout: 5000 });

const task = {
  id: "mt-9",
  slug: CERPEN,
  title: "Surat untuk tokohmu",
  instructions: "Tulis satu surat.\n\nMaksimal dua halaman.",
  dueDate: new Date(Date.now() + 5 * DAY).toISOString().slice(0, 10),
  createdAt: Date.now(),
};

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  localStorage.setItem("ranah.mentorTasks", JSON.stringify([task]));
  register(CERPEN);
});
afterEach(cleanup);

describe("a task a mentor wrote, on the participant's side", () => {
  it("shows in the task list and the progress, but not among the materials", async () => {
    render(<ClassDashboard slug={CERPEN} store={createMemoryAssignmentStore()} />);
    await screen.findByRole("heading", { level: 1 });
    const tasks = screen.getByRole("heading", { name: "Tugas" }).closest("section")!;
    expect(within(tasks).getAllByRole("listitem")).toHaveLength(5);
    const link = within(tasks).getByRole("link", { name: "Surat untuk tokohmu" });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/tugas/mt-9`);
    expect(within(tasks).getByText(/Tugas tambahan/)).toBeTruthy();
    const materials = screen.getByRole("heading", { name: "Materi" }).closest("section")!;
    expect(within(materials).queryByText("Tugas tambahan")).toBeNull();
  });

  it("opens its own page with the instructions, and takes a hand-in", async () => {
    const store = createMemoryAssignmentStore();
    render(<AssignmentView slug={CERPEN} id="mt-9" store={store} documents={documentsOf(docs)} />);
    expect(
      await screen.findByRole("heading", { name: "Surat untuk tokohmu", level: 1 }),
    ).toBeTruthy();
    expect(screen.getByText("Maksimal dua halaman.")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Ketik langsung/ }));
    fireEvent.change(screen.getByLabelText("Tugasmu"), {
      target: { value: "Rani menulis surat." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kumpulkan tugas" }));
    await waitFor(async () => expect((await store.list())[0]?.assignmentId).toBe("mt-9"));
  });

  it("says a task that was deleted is not in the class", async () => {
    localStorage.setItem("ranah.mentorTasks", "[]");
    render(
      <AssignmentView
        slug={CERPEN}
        id="mt-9"
        store={createMemoryAssignmentStore()}
        documents={documentsOf(docs)}
      />,
    );
    expect(await screen.findByText("Tugas ini tidak ditemukan di kelas ini.")).toBeTruthy();
  });
});
