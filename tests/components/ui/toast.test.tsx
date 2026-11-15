import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast, type ToastInput } from "@/components/ui/toast";

function Trigger({ input }: { input: ToastInput }) {
  const toast = useToast();
  return <button onClick={() => toast(input)}>buka</button>;
}

function setup(input: ToastInput) {
  render(
    <ToastProvider>
      <Trigger input={input} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("buka"));
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Toast", () => {
  it("announces a status message and removes it after 4 seconds", () => {
    setup({ message: "Tautan disalin." });
    expect(screen.getByRole("status").textContent).toContain("Tautan disalin.");

    act(() => vi.advanceTimersByTime(4000 + 200));

    expect(screen.queryByText("Tautan disalin.")).toBeNull();
  });

  it("keeps an error until it is closed, and announces it as an alert", () => {
    setup({ message: "Gagal menyalin.", tone: "error" });

    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole("alert").textContent).toContain("Gagal menyalin.");

    fireEvent.click(screen.getByRole("button", { name: "Tutup pemberitahuan" }));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("runs the action once and dismisses the toast", () => {
    const onSelect = vi.fn();
    setup({ message: "Dipindah ke Sampah.", action: { label: "Urungkan", onSelect } });

    fireEvent.click(screen.getByRole("button", { name: "Urungkan" }));
    act(() => vi.advanceTimersByTime(200));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Dipindah ke Sampah.")).toBeNull();
  });

  it("pauses the timer while the pointer is over the toast", () => {
    setup({ message: "Tersalin." });
    const item = screen.getByRole("status");

    fireEvent.pointerEnter(item);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("Tersalin.")).toBeTruthy();

    fireEvent.pointerLeave(item);
    act(() => vi.advanceTimersByTime(4000 + 200));
    expect(screen.queryByText("Tersalin.")).toBeNull();
  });

  it("replaces a toast that repeats with the same key instead of stacking", () => {
    render(
      <ToastProvider>
        <Trigger input={{ message: "Coba lagi nanti.", key: "x" }} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("buka"));
    fireEvent.click(screen.getByText("buka"));

    expect(screen.getAllByText("Coba lagi nanti.")).toHaveLength(1);
  });

  it("throws a clear error when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger input={{ message: "x" }} />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
