import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Menu, type MenuEntry } from "@/components/ui/menu";

afterEach(cleanup);

function setup(items?: MenuEntry[]) {
  const onSend = vi.fn();
  const entries: MenuEntry[] = items ?? [
    { id: "a", label: "Kirim ke proyek", onSelect: onSend },
    { id: "b", label: "Ekspor", disabled: true, onSelect: () => {} },
    { id: "s", type: "separator" },
    { id: "c", label: "Pindah ke sampah", onSelect: () => {} },
  ];
  render(<Menu label="Menu dokumen" items={entries} />);
  return { onSend, trigger: screen.getByRole("button", { name: "Menu dokumen" }) };
}

describe("Menu", () => {
  it("exposes the trigger as a collapsed menu button until opened", () => {
    const { trigger } = setup();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("runs the selected action and closes", () => {
    const { onSend, trigger } = setup();
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole("menuitem", { name: "Kirim ke proyek" }));

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not run a disabled item", () => {
    setup();
    const disabled = screen.getByRole("menuitem", { name: "Ekspor" }) as HTMLButtonElement;
    expect(disabled.disabled).toBe(true);
  });

  it("closes on Escape and gives focus back to the trigger", () => {
    const { trigger } = setup();
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on a press outside the menu", () => {
    const { trigger } = setup();
    fireEvent.click(trigger);

    fireEvent.pointerDown(document.body);

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("styles only the danger item red", () => {
    setup([
      { id: "a", label: "Salin tautan", onSelect: () => {} },
      { id: "b", label: "Hapus permanen", danger: true, onSelect: () => {} },
    ]);
    expect(screen.getByRole("menuitem", { name: "Salin tautan" }).className).not.toContain(
      "text-danger",
    );
    expect(screen.getByRole("menuitem", { name: "Hapus permanen" }).className).toContain(
      "text-danger",
    );
  });
});
