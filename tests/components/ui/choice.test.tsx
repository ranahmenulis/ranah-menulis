import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckChoice } from "@/components/ui/choice";

afterEach(cleanup);

describe("CheckChoice", () => {
  it("is a real checkbox named by its label, and reports changes", () => {
    const onChange = vi.fn();
    render(<CheckChoice label="Saya setuju" checked={false} onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "Saya setuju" }) as HTMLInputElement;
    expect(box.checked).toBe(false);
    fireEvent.click(screen.getByText("Saya setuju"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("reflects the checked state and shows the hint", () => {
    render(<CheckChoice label="Saya setuju" hint="Wajib" checked onChange={() => {}} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText("Wajib")).toBeTruthy();
  });

  it("can be disabled", () => {
    render(<CheckChoice label="Saya setuju" checked={false} disabled onChange={() => {}} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
  });
});
