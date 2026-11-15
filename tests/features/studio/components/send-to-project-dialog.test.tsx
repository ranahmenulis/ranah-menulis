import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SendToProjectDialog } from "@/features/studio/components/send-to-project-dialog";
import { installDialogShim } from "@/test/dialog-shim";

beforeAll(installDialogShim);
afterEach(cleanup);

describe("SendToProjectDialog", () => {
  it("honestly says there is no project that accepts work yet, with nothing to submit", () => {
    render(<SendToProjectDialog open onClose={() => {}} />);

    expect(screen.getByRole("dialog", { name: "Kirim ke proyek" })).toBeTruthy();
    expect(screen.getByText(/Belum ada proyek yang menerima karya/)).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("closes with Tutup", () => {
    const onClose = vi.fn();
    render(<SendToProjectDialog open onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
