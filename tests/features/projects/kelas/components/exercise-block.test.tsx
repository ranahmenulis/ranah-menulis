import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExerciseBlock } from "@/features/projects/kelas/components/exercise-block";
import { classCopies } from "@/features/projects/kelas/copy-store";
import type { StudioDocument } from "@/features/studio/storage/document-store";

configure({ asyncUtilTimeout: 5000 });

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const material = {
  id: "m1",
  title: "Satu ide",
  minutes: 5,
  body: ["x"],
  exercise: "Tulis satu kalimat.",
};

function fakeStore(existing: Partial<StudioDocument> | null = null) {
  return {
    get: vi.fn(async () => (existing as StudioDocument | null) ?? null),
    duplicate: vi.fn(async (source: StudioDocument, title: string) => ({
      ...source,
      id: "new-doc",
      title,
    })),
  };
}

beforeEach(() => {
  classCopies.reset();
  push.mockClear();
});
afterEach(cleanup);

describe("exercise block", () => {
  it("shows the exercise and copies it to Studio, then opens the editor", async () => {
    const store = fakeStore();
    render(<ExerciseBlock slug="kelas" material={material} store={store} />);
    expect(screen.getByText("Tulis satu kalimat.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Salin latihan ke Studio" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/studio/new-doc"));
    expect(store.duplicate).toHaveBeenCalledTimes(1);
  });

  it("offers to open the copy once it exists, without copying again", async () => {
    classCopies.write([{ key: "kelas:m1", docId: "old-doc", createdAt: 1 }]);
    const store = fakeStore({ id: "old-doc", title: "Latihan" });
    render(<ExerciseBlock slug="kelas" material={material} store={store} />);
    fireEvent.click(await screen.findByRole("button", { name: "Buka salinan di Studio" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/studio/old-doc"));
    expect(store.duplicate).not.toHaveBeenCalled();
  });

  it("goes back to Salin when the copy is in Sampah", async () => {
    classCopies.write([{ key: "kelas:m1", docId: "old-doc", createdAt: 1 }]);
    render(
      <ExerciseBlock
        slug="kelas"
        material={material}
        store={fakeStore({ id: "old-doc", deletedAt: 9 })}
      />,
    );
    expect(await screen.findByRole("button", { name: "Salin latihan ke Studio" })).toBeTruthy();
  });

  it("says so and stays on the page when the copy fails", async () => {
    const store = fakeStore();
    store.duplicate.mockRejectedValueOnce(new Error("quota"));
    render(<ExerciseBlock slug="kelas" material={material} store={store} />);
    fireEvent.click(screen.getByRole("button", { name: "Salin latihan ke Studio" }));
    expect((await screen.findByRole("alert")).textContent).toContain("belum bisa disalin");
    expect(push).not.toHaveBeenCalled();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false);
  });

  it("draws nothing for a material with no exercise", () => {
    const { container } = render(
      <ExerciseBlock
        slug="kelas"
        material={{ ...material, exercise: undefined }}
        store={fakeStore()}
      />,
    );
    expect(container.textContent).toBe("");
  });
});
