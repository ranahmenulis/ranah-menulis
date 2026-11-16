import { cleanup, render } from "@testing-library/react";
import { Activity } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Drawer } from "@/components/ui/drawer";
import { installDialogShim } from "@/test/dialog-shim";

beforeAll(installDialogShim);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const tree = (mode: "visible" | "hidden") => (
  <Activity mode={mode}>
    <Drawer open onClose={() => undefined} title="Bantuan" closeLabel="Tutup">
      <p>Isi</p>
    </Drawer>
  </Activity>
);

describe("Drawer, page kept in the background", () => {
  it("closes the modal bottom sheet on phones when its page is hidden", () => {
    // Below md the drawer is a modal sheet, which would block the next page if left open.
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const view = render(tree("visible"));
    const dialog = view.container.querySelector("dialog")!;
    expect(dialog.hasAttribute("open")).toBe(true);

    view.rerender(tree("hidden"));
    expect(dialog.hasAttribute("open")).toBe(false);

    view.rerender(tree("visible"));
    expect(dialog.hasAttribute("open")).toBe(true);
  });
});
