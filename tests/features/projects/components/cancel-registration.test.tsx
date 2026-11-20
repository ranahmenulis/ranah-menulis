import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installDialogShim } from "@/test/dialog-shim";
import { RegisterView } from "@/features/projects/components/register-view";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { cancellationLog } from "@/features/projects/cancellation-log";
import { registration, submission } from "../helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const KEY = "ranah.registrations";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  cancellationLog.reset();
});
afterEach(cleanup);

function open(slug: string) {
  localStorage.setItem(KEY, JSON.stringify({ [slug]: registration(slug) }));
  render(
    <RegisterView
      slug={slug}
      source={projectFixtures}
      stores={{
        submissions: createMemorySubmissionStore(),
        assignments: createMemoryAssignmentStore(),
      }}
    />,
  );
}

describe("cancelling from the registration page", () => {
  it("offers no cancel link for a paid project", async () => {
    open("lomba-cerpen-hujan-2026");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("button", { name: "Batalkan pendaftaran" })).toBeNull();
  });

  it("asks first, then cancels and moves focus to the status line", async () => {
    open("kelas-cerpen-untuk-pemula");
    fireEvent.click(await screen.findByRole("button", { name: "Batalkan pendaftaran" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.textContent).toMatch(/kuotamu dilepas/);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Batalkan pendaftaran" }).at(-1) as HTMLElement,
    );
    const status = await screen.findByRole("status");
    expect(status.textContent).toMatch(/Pendaftaranmu dibatalkan/);
    await waitFor(() => expect(document.activeElement).toBe(status));
    expect(JSON.parse(localStorage.getItem(KEY) ?? "{}")).toEqual({});
    expect(screen.getByRole("button", { name: "Daftar" })).toBeTruthy();
  });

  it("keeps the registration and explains when the reader still has a sent work", async () => {
    const slug = "lomba-esai-literasi-remaja";
    localStorage.setItem(KEY, JSON.stringify({ [slug]: registration(slug) }));
    const submissions = createMemorySubmissionStore();
    await submissions.add(submission({ slug }), 5);
    render(
      <RegisterView
        slug={slug}
        source={projectFixtures}
        stores={{ submissions, assignments: createMemoryAssignmentStore() }}
      />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Batalkan pendaftaran" }));
    await screen.findByRole("alertdialog");
    fireEvent.click(
      screen.getAllByRole("button", { name: "Batalkan pendaftaran" }).at(-1) as HTMLElement,
    );
    expect((await screen.findByText(/Tarik karyamu dulu/)).textContent).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(KEY) ?? "{}")[slug]).toBeDefined();
  });
});
