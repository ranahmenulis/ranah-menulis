import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SaveIndicator } from "@/features/studio/components/save-indicator";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const savedAt = () => new Date(2026, 10, 15, 14, 2);

describe("SaveIndicator", () => {
  it("is a polite live region", () => {
    render(<SaveIndicator status="saved" savedAt={savedAt()} offline={false} />);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("shows 'Menyimpan…' while saving and 'Draf baru' for an untouched draft", () => {
    const { rerender } = render(<SaveIndicator status="saving" savedAt={null} offline={false} />);
    expect(screen.getByText("Menyimpan…")).toBeTruthy();

    rerender(<SaveIndicator status="draft" savedAt={null} offline={false} />);
    expect(screen.getByText("Draf baru")).toBeTruthy();
  });

  it("shows 'Tersimpan', and adds the clock after 3 seconds", () => {
    vi.setSystemTime(new Date(2026, 10, 15, 14, 2, 0));
    render(<SaveIndicator status="saved" savedAt={savedAt()} offline={false} />);
    expect(screen.getByText("Tersimpan")).toBeTruthy();

    act(() => vi.advanceTimersByTime(3000));

    expect(screen.getByText("Tersimpan 14.02")).toBeTruthy();
  });

  it("shows the clock straight away for a document saved long ago", () => {
    vi.setSystemTime(new Date(2026, 10, 15, 18, 0, 0));
    render(<SaveIndicator status="saved" savedAt={savedAt()} offline={false} />);
    expect(screen.getByText("Tersimpan 14.02")).toBeTruthy();
  });

  it("offline: shows 'Belum tersinkron' as a button that explains itself, not as red text", () => {
    render(<SaveIndicator status="saved" savedAt={savedAt()} offline />);
    const button = screen.getByRole("button", { name: /Belum tersinkron/ });
    expect(button.className).not.toContain("text-danger");
    expect(button.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(button);

    expect(screen.getByText("Perubahanmu tersimpan di perangkat ini.")).toBeTruthy();
  });

  it("a failed write says the change is NOT stored yet", () => {
    render(<SaveIndicator status="failed" savedAt={null} offline={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Belum tersimpan/ }));
    expect(screen.getByText(/belum tersimpan di perangkat ini/)).toBeTruthy();
  });
});
