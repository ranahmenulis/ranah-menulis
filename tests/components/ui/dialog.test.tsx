import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { installDialogShim } from "@/test/dialog-shim";
import { Dialog } from "@/components/ui/dialog";

beforeAll(installDialogShim);
afterEach(cleanup);

function renderDialog(props: Partial<React.ComponentProps<typeof Dialog>> = {}) {
  const onClose = vi.fn();
  const view = render(
    <Dialog
      open
      onClose={onClose}
      title="Ubah nama"
      description="Hanya terlihat olehmu."
      actions={<button>Simpan</button>}
      {...props}
    />,
  );
  return { onClose, dialog: view.container.querySelector("dialog")! };
}

describe("Dialog", () => {
  it("opens as a modal and is named by its title and description", () => {
    const { dialog } = renderDialog();

    expect(dialog.hasAttribute("open")).toBe(true);
    expect(dialog.getAttribute("aria-labelledby")).toBe(screen.getByText("Ubah nama").id);
    expect(dialog.getAttribute("aria-describedby")).toBe(
      screen.getByText("Hanya terlihat olehmu.").id,
    );
  });

  it("closes the native dialog when `open` becomes false", () => {
    const { dialog } = renderDialog();
    expect(dialog.hasAttribute("open")).toBe(true);

    cleanup();
    const second = renderDialog({ open: false });
    expect(second.dialog.hasAttribute("open")).toBe(false);
  });

  it("asks to close on Escape and keeps React in charge of the state", () => {
    const { dialog, onClose } = renderDialog();
    const cancel = new Event("cancel", { cancelable: true });

    dialog.dispatchEvent(cancel);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(cancel.defaultPrevented).toBe(true);
  });

  it("asks to close when the backdrop is clicked", () => {
    const { dialog, onClose } = renderDialog();
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape and backdrop clicks when it is not dismissible", () => {
    const { dialog, onClose } = renderDialog({ dismissible: false });
    const cancel = new Event("cancel", { cancelable: true });

    dialog.dispatchEvent(cancel);
    fireEvent.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
    expect(cancel.defaultPrevented).toBe(true);
  });

  it("does not close when the click lands inside the content", () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByText("Ubah nama"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Dialog, swipe to dismiss", () => {
  it("shows a grabber and wires touch handling only when asked, and only if dismissible", () => {
    const plain = renderDialog();
    expect(plain.dialog.querySelector("[aria-hidden].rounded-full")).toBeNull();
    cleanup();

    const swipe = renderDialog({ swipeToDismiss: true });
    expect(swipe.dialog.querySelector("[aria-hidden].rounded-full")).not.toBeNull();
    cleanup();

    const locked = renderDialog({ swipeToDismiss: true, dismissible: false });
    expect(locked.dialog.querySelector("[aria-hidden].rounded-full")).toBeNull();
  });

  it("closes when the title is swiped down far enough", () => {
    const { dialog, onClose } = renderDialog({ swipeToDismiss: true });
    Object.defineProperty(dialog, "offsetHeight", { value: 300 });
    const handle = screen.getByText("Ubah nama");
    const touch = { pointerType: "touch", pointerId: 1 };

    fireEvent.pointerDown(handle, { ...touch, clientY: 0 });
    fireEvent.pointerMove(handle, { ...touch, clientY: 150 });
    fireEvent.pointerUp(handle, { ...touch, clientY: 150 });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when the body is swiped, so its content can still scroll", () => {
    const { dialog, onClose } = renderDialog({
      swipeToDismiss: true,
      children: <p>Isi</p>,
    });
    Object.defineProperty(dialog, "offsetHeight", { value: 300 });
    const body = screen.getByText("Isi");
    const touch = { pointerType: "touch", pointerId: 1 };

    fireEvent.pointerDown(body, { ...touch, clientY: 0 });
    fireEvent.pointerMove(body, { ...touch, clientY: 250 });
    fireEvent.pointerUp(body, { ...touch, clientY: 250 });

    expect(onClose).not.toHaveBeenCalled();
  });
});
